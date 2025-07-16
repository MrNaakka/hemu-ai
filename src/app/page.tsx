import { api } from "@/trpc/server";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import SignButton from "./_components/rootPage/signButton";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Node from "./_components/rootPage/node";
import Plan from "./_components/rootPage/plan";
import { Crown, PersonStanding, Rocket } from "lucide-react";
import Title from "./_components/rootPage/title";

export default async function Home() {
  const isLoggedIn = await api.util.checkIfLoggedIn();
  if (isLoggedIn) {
    redirect("/home");
  }

  return (
    <>
      <SignedIn>HemuAi</SignedIn>

      <SignedOut>
        <section className="flex w-full flex-col items-center">
          <header className="h-[33.3vh] w-4/5">
            <Title name="HEMU-AI" description="to learn math more efficently" />
          </header>
          <section className="flex h-[66.6vh] w-4/5 flex-row items-center justify-start gap-20">
            <SignInButton forceRedirectUrl={"/home"}>
              <SignButton title="SIGN IN" />
            </SignInButton>
            <SignUpButton forceRedirectUrl={"/home"}>
              <SignButton title="SIGN UP" />
            </SignUpButton>
          </section>

          <Separator className="my-4 !h-[2px] !w-9/10 bg-teal-950" />

          <section className="h-[33.3vh] w-4/5">
            <Title name="HEMU-AI PLANS" />
          </section>

          <section className="flex w-4/5 flex-row gap-20">
            <Plan
              cost="0"
              icon={<PersonStanding size={40} />}
              title="Free"
              content={["Math editor", "Exercise storage", "Free ai trial"]}
            />
            <Plan
              cost="10"
              icon={<Rocket size={40} />}
              title="Standard"
              content={[
                "Everything in free",
                "2 000 000 monthly tokens / around 1 000 monthly chats with ai",
              ]}
            />
            <Plan
              cost="custom"
              icon={<Crown size={40} />}
              title="Custom"
              content={["Everything in standard", "Customize to your needs"]}
              action="Contact"
            />
          </section>

          <Separator className="my-4 mt-30 !h-[2px] !w-9/10 bg-teal-950" />

          <section className="h-[33.3vh] w-4/5">
            <Title name="WHY HEMU-AI" />
          </section>
          <section className="flex h-[50vh] w-4/5 flex-col justify-center gap-10">
            <Node
              title="Math Editor"
              description="HEMU-AI provides a math editor integrated with AI"
            />
            <Node
              title="Storage With a Filesystem"
              description="HEMU-AI offers a platform to do and store all of you exercises with an excellent filesystem"
            />
            <Node
              title="Desinged For Students"
              description="Desinged for students that are familiar with the abitti math
              editor"
            />
          </section>

          <Separator className="my-4 mt-20 !h-[2px] !w-9/10 bg-teal-950" />

          <footer className="flex h-[10vh] w-4/5 flex-row items-center justify-evenly">
            <p>By MrNaakka</p>
            <Link href={"/privacy-policy"}>Privacy policy</Link>
          </footer>
        </section>
      </SignedOut>
    </>
  );
}
