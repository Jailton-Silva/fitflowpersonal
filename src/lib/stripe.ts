import Stripe from "stripe";

if(!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
});

export const STRIPE_PLANS = {
  Start: {
    priceID: process.env.STRIPE_PRICE_START_ID,
    productID: process.env.STRIPE_PLAN_START_ID,
  },
  Pro: {
    priceID: process.env.STRIPE_PRICE_PRO_ID,
    productID: process.env.STRIPE_PLAN_PRO_ID,
  },
  Elite: {
    priceID: process.env.STRIPE_PRICE_ELITE_ID,
    productID: process.env.STRIPE_PLAN_ELITE_ID,
  },
} as const;

export type StripePlan = keyof typeof STRIPE_PLANS;