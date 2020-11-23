const express = require("express");

require("dotenv").config();

(async () => {
    const dev = true;

    const permalink = dev ? "http://localhost:4000" : "";

    const app = express();

    // Configure mustache
    const mustacheExpress = require("mustache-express");
    // set path for mustache partials
    app.engine("mustache", mustacheExpress(__dirname + "/views/partials", ".mustache"));
    app.set("view engine", "mustache");
    // set path for regular views
    app.set("views", __dirname + "/views");

    app.get("/", (_, res) => {
        const data = {
            permalink
        };
        res.render("app", data);
    });

    app.get("/login", (_, res) => {
        const data = {
            permalink
        };
        res.render("login", data);
    });
    app.get("/register", (_, res) => {
        const data = {
            permalink
        };
        res.render("register", data);
    });

    const port = 4000;
    app.listen(port, () => {
        console.log(`Server listening on port: ${port}`);
    });

})();