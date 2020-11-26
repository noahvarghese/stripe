import { Router } from "express";

import twilio from "../lib/TwilioConfig";
import defaultData from "./defaultData";
import { User } from "../lib/models/User";

export const publicRoutes = Router();

const sendCode = (phone: number): Promise<number> => {
    const randomCode = Math.floor(Math.random() * 999) + 0o1;
    return new Promise((resolve, reject) => {
        twilio.messages
            .create({
                from: process.env.PHONE,
                to: phone.toString(),
                body: `Thank you for using My Saas. Here is your authorization code: ${randomCode}`,
            })
            .then((message) => {
                console.log(message);
                resolve(randomCode);
            })
            .catch((err) => {
                console.error(err);
                reject(err);
            });
    });
};

publicRoutes.get("/", (_, res) => {
    res.render("public/index", defaultData);
});

publicRoutes
    .route("/login")
    .get((_, res) => {
        res.render("public/login", defaultData);
    })
    .post(async (req, res) => {
        let loggedIn = false;
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (user) {
            if (user.hash === password) {
                loggedIn = true;
                req.session!.user = user;
                res.redirect("/subscriptions");
            }
        }

        if (!loggedIn) {
            const data = {
                ...defaultData,
                error: "Invalid login",
            };

            res.render("public/login", data);
        }
    });

publicRoutes
    .route("/register")
    .get((_, res) => {
        res.render("public/register", defaultData);
    })
    .post(async (req, res) => {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            birthDate,
            phone,
        } = req.body;

        // input validation
        // check for any empty or null values
        // compare password and confirm password
        if (
            password === confirmPassword &&
            ![
                firstName.trim(),
                lastName.trim(),
                email.trim(),
                password,
                confirmPassword,
                birthDate.trim(),
                phone.trim(),
            ].includes("" || null || undefined)
        ) {
            const user = await User.create({
                firstName,
                lastName,
                email,
                hash: password,
                birthDate,
                phone,
                accountConfirmed: false,
            });

            req.session!.confirmCode = await sendCode(user.phone);
            user.confirmCode = req.session!.confirmCode;
            user.save();
            req.session!.user = user;

            res.redirect("/confirm");
        } else {
            const data = {
                ...defaultData,
                error: "Invalid registration details",
            };

            res.render("public/register", data);
        }
    });

publicRoutes
    .route("/confirm")
    .get((req, res) => {
        const data = {
            ...defaultData,
            name: `${req.session!.user.firstName} ${
                req.session!.user.lastName
            }`,
        };

        res.render("public/confirm", data);
    })
    .post(async (req, res) => {

        if (Number(req.body.confirmCode) === Number(req.session!.confirmCode)) {
            const user: User = req.session!.user;
            user.accountConfirmed = true;
            user.confirmCode = undefined;
            await user.save();

            req.session!.confirmCode = null;
            res.redirect("/subscriptions");

        } else {
            const data = {
                ...defaultData,
                error: "Invalid code",
            };

            res.render("public/confirm", data);
        }
    });

publicRoutes.post("/sendCode", async (req, res) => {
    const data: any = { ...defaultData };

    if (req.session!.user) {
        req.session!.confirmCode = await sendCode(req.session!.user.phone);
    } else {
        data.error = "Unable to resend code.";
    }

    res.render("/confirm", data);
});
