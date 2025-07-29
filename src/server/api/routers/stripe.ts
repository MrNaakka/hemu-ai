import Stripe from "stripe";

import { authProcedure, createTRPCRouter } from "@/server/api/trpc";
import { env } from "@/env";
import { TRPCError } from "@trpc/server";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { standardTokenLimit } from "@/lib/utils";

export const stripeRouter = createTRPCRouter({
  createCheckOutSessionStandard: authProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    const url = env.URL;
    const [result] = await ctx.db
      .select({ stripeCustomerId: users.stripeCustomerId })
      .from(users)
      .where(eq(users.userId, userId));
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    let stripeCustomerId = result?.stripeCustomerId;

    if (!stripeCustomerId) {
      stripeCustomerId = (await stripe.customers.create()).id;
      await ctx.db
        .update(users)
        .set({ stripeCustomerId: stripeCustomerId })
        .where(eq(users.userId, userId));
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: env.STRIPE_SUBSCRIPTION_PRICE_ID, quantity: 1 }],

      subscription_data: {
        metadata: {
          userId: userId,
          tier: "standard",
          tokenLimit: standardTokenLimit,
        },
      },

      success_url: `${url}/home`,
      cancel_url: `${url}/plans`,
      metadata: {
        userId: userId,
        tier: "standard",
        tokenLimit: standardTokenLimit,
      },
    });
    if (!checkoutSession.url) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Could not produce a valid checkout URL",
      });
    }
    return { url: checkoutSession.url };
  }),

  cancelPortal: authProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    const [stripeCustomerId] = await ctx.db
      .select({ stripeCustomerId: users.stripeCustomerId })
      .from(users)
      .where(eq(users.userId, userId));
    if (!stripeCustomerId?.stripeCustomerId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Error with stripeCustomerId and database.",
      });
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId.stripeCustomerId,
      return_url: `${env.URL}/home`,
    });
    return { url: portalSession.url };
  }),
});
