import express from "express";
import * as dotenv from "dotenv";
import { User } from "./lib/models/User";
import { Database } from "./lib/Database";
import e from "express";
dotenv.config();

(async () => {
    const dev = true;
    const permalink = dev ? "http://localhost:4000" : "";

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded());

    // Setup Database
    const database = new Database(true);

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
        const user = new User();
        user.firstName = "Noah";
        user.getKeys();
        const data = {
            permalink,
        };
        res.render("app", data);
    });

    app.get("/login", (_, res) => {
        const data = {
            permalink,
        };
        res.render("login", data);
    });

    app.post("/login", (req, res) => {
        const { email, password } = req.body;

        const user = new User();
        user.email = email;
        user.password = password;
    });

    app.get("/register", (_, res) => {
        const data = {
            permalink,
        };
        res.render("register", data);
    });

    app.post("/register", (req, res) => {
        const {
            firstName,
            lastName,
            email,
            password,
            birthDate,
            phone,
        } = req.body;

        const user = new User();

        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.password = password;
        user.birthDate = birthDate;
        user.phone = phone;
    });

    const port = 4000;
    app.listen(port, () => {
        console.log(`Server listening on port: ${port}`);
    });
})();
