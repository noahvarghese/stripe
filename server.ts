import express from "express";
import session from "express-session";
import * as dotenv from "dotenv";
import { Sequelize } from "sequelize";
import { User } from "./lib/models/User";
// import { Database } from "./lib/Database";
dotenv.config();

(async () => {
    const dev = true;
    const permalink = dev ? "http://localhost:4000" : "";

    const app = express();

    // Set body parsing
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // setup sessions
    app.use(
        session({
            secret: process.env.SESSION_SECRET!,
            resave: false,
            saveUninitialized: false,
        })
    );

    // Setup Database
    // const database = new Database(true);
    const sequelize = new Sequelize("sqlite::memory");
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
            permalink,
        };
        res.render("public/index", data);
    });

    app.get("/login", (_, res) => {
        const data = {
            permalink,
        };
        res.render("login", data);
    });

    app.post("/login", async (req, res) => {
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
            res.send({ success: false, error: "Invalid login" });
        }
    });

    app.get("/register", (req, res) => {
        const data = {
            permalink,
        };
        res.render("register", data);
    });

    app.post("/register", async (req, res) => {
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
            ].includes("")
        ) {
            await User.create({
                firstName,
                lastName,
                email,
                hash: password,
                birthDate,
                phone,
            });

            const data = {
                permalink,
            };
            res.render("register", data);
        } else {
            res.send({ success: false, error: "Invalid registration details" });
        }
    });

    const port = 4000;
    app.listen(port, () => {
        console.log(`Server listening on port: ${port}`);
    });
})();
