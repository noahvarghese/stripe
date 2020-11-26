import express from "express";
import session from "express-session";

import sqlite3 from "sqlite3";
import sqliteStoreFactory from "express-session-sqlite";
const SqliteStore = sqliteStoreFactory(session)

import * as dotenv from "dotenv";
dotenv.config();

import { publicRoutes } from "./routes/public";
import { customerRoutes } from "./routes/customer";

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

    // Authorization middleware
    app.use((req, res, next) => {
        //  They went to /customer
        if(req.originalUrl.indexOf('/customer/') > -1) {
            // they are not logged in
            if ( !req.session!.user) {
                res.redirect('/');
                return;
            }
            // they are logged in
            else {
                // they do not have a subscriptio
                if ( ! req.session!.user.subscriptionId ) {
                    res.redirect("/customer/subsription")
                    return
                } else {
                    // they have a subscription, all is good
                    next();
                }
            }
        }
        // They went to admin
        else if (req.originalUrl.indexOf("/admin/") > -1) {
            // if the user is not logged in
            if ( ! req.session!.user ) {
                res.redirect("/");
                return;
            }
            else {
                if ( !(req.session!.user as User).admin ) {
                    res.redirect("/customer");
                    return;
                } else {
                    next();
                }
            }
        }
    });

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
