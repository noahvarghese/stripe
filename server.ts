import express from "express";
import session from "express-session";

import sqlite3 from "sqlite3";
import sqliteStoreFactory from "express-session-sqlite";
const SqliteStore = sqliteStoreFactory(session)

import * as dotenv from "dotenv";
dotenv.config();

import { publicRoutes } from "./routes/Public";
import { customerRoutes } from "./routes/Customer";

import authMiddleware from "./lib/AuthMiddleware";
import { adminRoutes } from "./routes/Admin";
import { User } from "./lib/models/User";

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
                ttl: 8*60*60*1000,
                // (optional) Session id prefix. Default is no prefix.
                prefix: 'sess:',
                // (optional) Adjusts the cleanup timer in milliseconds for deleting expired session rows.
                // Default is 5 minutes.
                cleanupInterval: 300000
            }),
            secret: process.env.SESSION_SECRET!,
            resave: true,
            saveUninitialized: false,
            cookie: { maxAge: 8*60*60*1000 },  // 8 hours
        })
    );

    // Authorization middleware
    // control access
    app.use(authMiddleware);

    // Configure mustache
    const mustacheExpress = require("mustache-express");
    app.engine(
        "mustache",
        mustacheExpress(__dirname + "/views/partials", ".mustache")
    );
    app.set("view engine", "mustache");
    app.set("views", __dirname + "/views");
    
    // routes
    app.use("/", publicRoutes);
    app.use("/customer", customerRoutes);
    app.use("/admin", adminRoutes);

    // static files (css/js/etc)
    app.get(/^(.+)$/, (req,res) => {
        console.log("static file request: " + req.params[0]);
        res.sendFile(__dirname + req.params[0]);
    });

    const port = 3000;
    app.listen(port, () => {
        console.log(`Server listening on port: ${port}`);
    });
})();
