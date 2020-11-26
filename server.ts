import express from "express";
import session from "express-session";

import sqlite3 from "sqlite3";
import sqliteStoreFactory from "express-session-sqlite";
const SqliteStore = sqliteStoreFactory(session)

import * as dotenv from "dotenv";
dotenv.config();

import { publicRoutes } from "./routes/public";
import { customerRoutes } from "./routes/customer";

(async () => {
    const app = express();

    // Set body parsing
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // setup sessions
    app.use(
        session({
            store: new SqliteStore({
                // Database library to use. Any library is fine as long as the API is compatible
                // with sqlite3, such as sqlite3-offline
                driver: sqlite3.Database,
                // for in-memory database
                // path: ':memory:'
                path: './api.db',
                // Session TTL in milliseconds
                ttl: 1234,
                // (optional) Session id prefix. Default is no prefix.
                prefix: 'sess:',
                // (optional) Adjusts the cleanup timer in milliseconds for deleting expired session rows.
                // Default is 5 minutes.
                // cleanupInterval: 300000
            }),
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
    app.use("/customer", customerRoutes);

    const port = 3000;
    app.listen(port, () => {
        console.log(`Server listening on port: ${port}`);
    });
})();
