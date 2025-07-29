import { env } from "@/env";
import { freeTokenLimit } from "@/lib/utils";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const signature = req.headers.get("stripe-signature");

    const body = await req.text();

    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      env.STRIPE_WEBHOOK_SECRET,
    );

    switch (event.type) {
      case "customer.subscription.created": {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId as string;
        const tier = subscription.metadata.tier as string;
        const tokenLimit = subscription.metadata.tokenLimit as string;
        await db
          .update(users)
          .set({
            status: "active",
            tier: tier,
            tokenLimit: Number(tokenLimit),
          })
          .where(eq(users.userId, userId));
        break;
      }
      case "customer.subscription.updated": {
        const subObject = event.data.object;
        const isCanceled = subObject.cancel_at;
        const userId = subObject.metadata.userId as string;
        if (!isCanceled) {
          await db
            .update(users)
            .set({ status: "active" })
            .where(eq(users.userId, userId));
          break;
        }
        await db
          .update(users)
          .set({ status: "canceled" })
          .where(eq(users.userId, userId));
        break;
      }
      case "customer.subscription.deleted": {
        const subObject = event.data.object;
        const userId = subObject.metadata.userId as string;
        await db
          .update(users)
          .set({ status: "inactive", tier: "free", tokenLimit: freeTokenLimit })
          .where(eq(users.userId, userId));
      }
      default:
        break;
    }
    return new NextResponse("ok", { status: 200 });
  } catch (error) {
    return new NextResponse("Webhook signature verification failed", {
      status: 400,
    });
  }
}
