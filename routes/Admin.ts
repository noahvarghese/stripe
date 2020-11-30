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
import moment from "moment";

export const adminRoutes = Router();

adminRoutes.get("/", async (_, res) => {
    // const users = await User.findAll();
    const stripeUsers = (await stripe.customers.list({})).data;
    // console.log(stripeUsers);

    await Promise.all(
        stripeUsers.map(async (stripeUser: any) => {
            const user: User = (await User.findOne({ where: { email: stripeUser.email}}))!;
            console.log(user)

            if ( user ) {
                const subscription: any = user.subscriptionId ? await stripe.subscriptions.retrieve(user.subscriptionId) : null;
                const plan: any = subscription ? await Plan.findOne({ where: { productId: subscription.plan.product}}) : null;

                stripeUser.name = `${user.firstName} ${user.lastName}`;
                stripeUser.subscription_plan_name = plan.label;
                stripeUser.subscription_plan_price = subscription.plan.amount / 100;
                stripeUser.subscription_plan_price_id = subscription.plan.id;
                stripeUser.subscription_plan_start_date = moment.unix(subscription.start_date).format('MMM DD, YYYY');
                stripeUser.created = moment.unix(stripeUser.created).format('MMM DD, YYYY');
            }
        })
    );

    const data = {
        ...defaultData,
        customers: stripeUsers,
    };

    res.render("admin/index", data);
});

