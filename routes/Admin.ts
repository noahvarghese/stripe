import { Router } from "express";

import defaultData from "./DefaultData";

export const adminRoutes = Router();

adminRoutes.get("/", (_, res) => {
    res.render("admin/index", defaultData);
});

