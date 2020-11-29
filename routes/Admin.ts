import { Router } from "express";
import { User } from "../lib/models/User";
import * as dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: '2020-08-27',
});

import defaultData from "./DefaultData";
import { Plan } from "../lib/models/Plan";

export const adminRoutes = Router();

adminRoutes.get("/", async (_, res) => {
    // const users = await User.findAll();
    const stripeUsers = (await stripe.customers.list({})).data;

    await Promise.all(
        stripeUsers.map(async (stripeUser: any) => {
            const user = await User.findOne({ where: { subscriptionId: stripeUser.id}});

            if ( user ) {
                const subscription: any = await stripe.subscriptions.retrieve(user.subscriptionId!);
                const plan = (await Plan.findOne({ where: { productId: subscription.plan!.product}}))!;
                console.log(stripeUser)
                stripeUser.subscription_plan_name = plan.label;
                stripeUser.subscription_plan_price = subscription.plan.amount / 100;
                stripeUser.subscription_plan_price_id = subscription.plan.id;
                stripeUser.subscription_plan_start_date = subscription.start_date;
            }
        })
    );

    const data = {
        ...defaultData,
        users: stripeUsers
    };

    res.render("admin/index", data);
});

