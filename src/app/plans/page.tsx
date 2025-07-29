import { Crown, PersonStanding, Rocket } from "lucide-react";
import Plan from "../_components/rootPage/plan";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { api, HydrateClient } from "@/trpc/server";
import CheckOutButton from "../_components/strpeCheckoutButton";

export default async function PlanPage() {
  const { tier, status } = await api.database.getUserTierAndStatus();
  const planStyling = "ring-4 ring-teal-400";

  return (
    <>
      <Link
        className="hover:bg-secondaryBg absolute m-4 rounded-lg border-2 border-teal-700 p-4"
        href={"/home"}
      >
        HOME
      </Link>

      <h1 className="flex h-1/4 w-full items-center justify-center text-6xl">
        HEMU-AI PLANS
      </h1>
      <section className="flex h-3/4 w-full items-center justify-center gap-10">
        <Plan
          cost="0"
          icon={<PersonStanding size={40} />}
          title="Free"
          content={["Math editor", "Exercise storage", "Free ai trial"]}
          classname={tier === "free" ? planStyling : ""}
        />
        <Plan
          cost="10"
          icon={<Rocket size={40} />}
          title="Standard"
          content={[
            "Everything in free",
            "2 000 000 monthly tokens / around 1 000 monthly chats with ai",
          ]}
          classname={tier === "standard" ? planStyling : ""}
        >
          {tier === "standard" ? (
            status === "canceled" ? (
              <CheckOutButton name="Resume subscription" isPortal={true} />
            ) : (
              <CheckOutButton
                name="Cancel subscription"
                classname="text-red-500"
                isPortal={true}
              />
            )
          ) : tier === "free" ? (
            <CheckOutButton name="Upgrade" isPortal={false} />
          ) : (
            <p></p>
          )}
        </Plan>
        <Plan
          cost="custom"
          icon={<Crown size={40} />}
          title="Custom"
          content={["Everything in standard", "Customize to your needs"]}
          classname={tier === "custom" ? planStyling : ""}
        >
          {tier === "custom" ? (
            <Button className="text-red-500">Cancel subscription</Button>
          ) : (
            <Button>Contact</Button>
          )}
        </Plan>
      </section>
    </>
  );
}
