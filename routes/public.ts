import { Router } from "express";

import twilio from "../lib/TwilioConfig";
import defaultData from "./DefaultData";
import { User } from "../lib/models/User";

export const publicRoutes = Router();

const sendCode = (phone: number): Promise<number> => {
    const randomCode = Math.floor(Math.random() * 900000) + 99999;
    return new Promise((resolve, reject) => {
        twilio.messages
            .create({
                from: process.env.PHONE,
                to: phone.toString(),
                body: `Thank you for using My Saas. Here is your authorization code: ${randomCode}`,
            })
            .then((message) => {
                console.log("Message sent:", message.sid);
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
    .route("/login/")
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
                if ( (req.session!.user as User).admin ) {
                    res.redirect("/admin/");
                } else {
                    res.redirect("/customer/");
                }
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
    .route("/register/")
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
            const existingUser: User | null = await User.findOne({ where: { email }});
            
            if ( ! existingUser ) {
                const user = await User.create({
                    firstName,
                    lastName,
                    email,
                    hash: password,
                    birthDate,
                    phone,
                    accountConfirmed: false,
                    confirmCode: await sendCode(phone)
                });

                req.session!.confirmCode = user.confirmCode;
                req.session!.user = user;

                res.redirect("/confirm/");
            }
            else {
                if ( !existingUser.accountConfirmed ) {
                    const confirmCode = await sendCode(existingUser.phone);
                    existingUser.confirmCode = confirmCode;
                    await existingUser.save();


                    req.session!.confirmCode = existingUser.confirmCode;
                    req.session!.user = existingUser;

                    res.redirect("/confirm/");
                }
                else {
                    const data = {
                        ...defaultData,
                        error: "Email is already registered, please login."
                    };
                    
                    res.render("public/register", data);
                }
            }
        } else {
            const data = {
                ...defaultData,
                error: "Invalid registration details",
            };

            res.render("public/register", data);
        }
    });

publicRoutes
    .route("/confirm/")
    .get((_, res) => {
        const data = {
            ...defaultData
        };

        res.render("public/confirm", data);
    })
    .post(async (req, res) => {
        if (Number(req.body.confirmCode) === Number(req.session!.confirmCode)) {
            const user = await User.findOne({where: {email: req.session!.user.email }});

            if ( user ) {
                user.accountConfirmed = true;
                user.confirmCode = undefined;
                console.log("Saving:", await user.save());
                // need to overwrite user stored in session as it has been updated
                req.session!.user = user;

                req.session!.confirmCode = null;

                if ( (req.session!.user as User).admin ) {
                    res.redirect("/admin/")
                } else {
                    res.redirect("/customer/subscriptions/");
                }
            } else {
                const data = {
                    ...defaultData,
                    error: "Session error."
                }
                res.render("public/confirm", data);
            }

        } else {
            const data = {
                ...defaultData,
                error: "Invalid code",
            };

            res.render("public/confirm", data);
        }
    });

publicRoutes.route("/sendCode/")
.get((_, res) => {
    res.render("public/sendCode", defaultData);
}).post( async (req, res) => {
    const data: any = { ...defaultData };
    const { email } = req.body;
    console.log("Email:", email)

    const user = await User.findOne({ where: { email }});

    if ( user ) {
        user.confirmCode = await sendCode(user.phone);
        
        if ( user.accountConfirmed ) {
            user.accountConfirmed = false;
        }

        req.session!.confirmCode = user.confirmCode;
        await user.save();
        req.session!.user = user;
        res.redirect("/confirm/");
        return;
    } else {
        data.error = "Unable to send code";
    }

    res.render("public/sendCode/", data);
});

publicRoutes.get("/logout/", (req, res) => {
    delete req.session!.user;
    res.redirect("/");
})
