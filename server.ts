import express from "express";
import session from "express-session";

import { Sequelize } from "sequelize";

import * as dotenv from "dotenv";
dotenv.config();

import { publicRoutes } from "./routes/public";

(async () => {
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

    // Configure mustache
    const mustacheExpress = require("mustache-express");
    app.engine(
        "mustache",
        mustacheExpress(__dirname + "/views/partials", ".mustache")
    );
    app.set("view engine", "mustache");
    app.set("views", __dirname + "/views");

    // Setup routes
    app.use("/", publicRoutes);

    const port = 4000;
    app.listen(port, () => {
        console.log(`Server listening on port: ${port}`);
    });
})();
