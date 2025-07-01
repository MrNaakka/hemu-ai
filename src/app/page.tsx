import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const kokeilu = await api.util.checkIfLoggedIn();
  if (kokeilu) {
    redirect("/home");
  }

  return <div className="text-bold text-center text-6xl">Hemu-Ai</div>;
}
