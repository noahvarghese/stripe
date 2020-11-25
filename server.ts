import express from "express";
import session from "express-session";
import { Sequelize } from "sequelize";

import * as dotenv from "dotenv";
dotenv.config();

import twilio from "twilio";
const client = twilio(process.env.ACCOUNT_SID!, process.env.AUTH_TOKEN!)


import { User } from "./lib/models/User";
import { config } from "./lib/SQLiteConfig";

(async () => {
    const dev = true;
    const permalink = dev ? "http://localhost:4000" : "";
    const defaultData = {
        permalink
    }

    const app = express();

    // Set body parsing
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // setup sessions
    app.use(session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false 
    }));

    // Setup Database
    // const database = new Database(true);

    const sequelize = new Sequelize(config.storage!, config.username!, config.password, config);
    sequelize.sync();

    // Configure mustache
    const mustacheExpress = require("mustache-express");
    // set path for mustache partials
    app.engine(
        "mustache",
        mustacheExpress(__dirname + "/views/partials", ".mustache")
    );
    app.set("view engine", "mustache");
    // set path for regular views
    app.set("views", __dirname + "/views");

    app.get("/", (_, res) => {
        const data = {
           ...defaultData 
        };
        res.render("app", data);
    });

    app.get("/login", (_, res) => {
        const data = {
            ...defaultData
        };
        res.render("login", data);
    });

    app.post("/login", async (req, res) => {
        let loggedIn = false;
        const { email, password } = req.body;

        const user = await User.findOne({where: {email}});

        if ( user && user.hash === password ) {
            loggedIn = true;
            req.session!.user = user;
                
            let path = "/customer";

            if ( user.admin ) {
                path = "/admin";
            }

            res.redirect(path);
        } else {
            const data = {
                ...defaultData,
                error: "Invalid login"
            }
            res.render("public/login", data);
        }
    });

    app.get("/register", (_, res) => {
        const data = {
            ...defaultData
        };
        res.render("public/register", data);
    });

    app.post("/register", async (req, res) => {
        const { firstName, lastName, email, password, confirmPassword, birthDate, phone } = req.body;
        if ( 
            password === confirmPassword &&
           ! [firstName.trim(), lastName.trim(), email.trim(), password, confirmPassword, birthDate.trim(), phone.trim()].includes("") 
        ) {
           const user = await User.create({
                firstName,
                lastName,
                email,
                hash: password,
                birthDate,
                phone
            });

            req.session!.user = user;
           
            let randomCode = Math.floor(Math.random() * 999) + 0o1;
            req.session!.confirmCode = randomCode;
            // TODO: send code via twilio sms, use serverless
            client.messages.create({         
                to: '+16477715777',
        body: "Thank you for using Sealand Internet Services. Here is your authorization code: " + randomCode
            }) 
            .then(message => console.log(message.sid)) 
            // redirect user to enter code from sms
            res.redirect("/confirm")
        } else {
            const data = {
                ...defaultData,
                error: "Invalid registration details"
            }
            res.render("public/register", data);
        }
    });

    app.get("/confirm", (_, res) => {
        const data = {
            permalink
        }
        res.render("public/confirm", data);
    });

    const port = 4000;
    app.listen(port, () => {
        console.log(`Server listening on port: ${port}`);
    });
})();
