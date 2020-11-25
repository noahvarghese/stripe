import { Router } from "express";

import twilio from "../lib/TwilioConfig";
import defaultData from "./defaultData";
import { User } from "../lib/models/User (ai's conflicted copy 2020-11-25)";

export const publicRoutes = Router();

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
                res.redirect("/home");
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
            });

            const randomCode = Math.floor(Math.random() * 999) + 0o1;
            req.session!.confirmCode = randomCode;

            twilio.messages
                .create({
                    to: user.phone.toString(),
                    body: `Thank you for using My Saas. Here is your authorization code: ${randomCode}`,
                })
                .then((message) => console.log(message))
                .catch((err) => console.error(err));

            res.redirect("/confirm");
        } else {
            const data = {
                ...defaultData,
                error: "Invalid registration details",
            };
            res.render("public/register", data);
        }
    });
