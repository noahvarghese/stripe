import { Router } from "express";

import defaultData from "./DefaultData";

export const customerRoutes = Router();

customerRoutes.route("/subscriptions").get((_, res) =>{
    res.render("customer/subscriptions", defaultData)
}).post(async (req, res) => {

});

customerRoutes.get("/", (_, res) => {
    res.render("customer/index", defaultData)
})