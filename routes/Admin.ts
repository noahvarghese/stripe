import { Router } from "express";
import { User } from "../lib/models/User";

import defaultData from "./DefaultData";

export const adminRoutes = Router();

adminRoutes.get("/", async (_, res) => {
    const users = await User.findAll();
    const data = {
        ...defaultData,
        users
    };

    res.render("admin/index", data);
});

