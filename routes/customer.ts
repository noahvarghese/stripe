import { Router } from "express";
import { Plan } from "../lib/models/Plan";
import { User } from "../lib/models/User";

import * as dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    apiVersion: '2020-08-27',
});

import defaultData from "./DefaultData";

export const customerRoutes = Router();

customerRoutes.route("/subscriptions/").get(async (_, res) =>{
    const data = {
        ...defaultData,
        stripeKey: process.env.STRIPE_KEY,
        plans: await Plan.findAll()
    }
    res.render("customer/subscriptions", data)
}).post(async (req, res) => {
        
    //  Find the Plan, retrieve the product id
    let plan = (await Plan.findOne({ where: { name: req.body.selectedPlan}}))!;
    console.log(req.body.stripeToken);

    //  Should check to see if the customer already exists.
    //  If so, get the customer.id instead of creating a new one.
    const customer = stripe.customers.create({
        source: JSON.parse(req.body.stripeToken).id,
        email: req.session!.user.email,
        name: req.session!.user.name,
        phone: req.session!.user.phone,
    });

    customer.then(async (customer) => {
        const user = (await User.findOne({ where: { ID: req.session!.user.ID}}))!;
        console.log(user);
        user.customerId = customer.id;
        await user.save();

        await stripe.subscriptions.create({
            customer: customer.id,
            items: [{
                plan: plan.priceId
            }]
        })
        .then(async (subscription) => {
            // set stripe_subscription_id in database
            user.subscriptionId = subscription.id;
            await user.save();
            req.session!.user = user;
            res.redirect('/customer');
            return;
        })
        .catch(err => {
            console.log(err);
        })
    })
    .catch(err => {
        console.log(err);
    });
});

customerRoutes.get("/", async (req, res) => {
    const user = await User.findOne({ where: { email: req.session!.user.email }});

    const data = {
        ...defaultData,
        user
    };

    res.render("customer/index", data)
})