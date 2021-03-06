import { Router } from "express";
import { User } from "../lib/models/User";

import defaultData from "./DefaultData";

export const customerRoutes = Router();

customerRoutes.route("/subscriptions/").get((_, res) =>{
    res.render("customer/subscriptions", defaultData)
}).post(async (req, res) => {
    const message = "POST not implemented";
    console.log(message);
    res.send(message);
});

customerRoutes.get("/", async (req, res) => {
    const user = await User.findOne({ where: { email: req.session!.user.email }});

    const data = {
        ...defaultData,
        user
    };

    res.render("customer/index", data)
})