import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Initialize() {
  try {
    await api.database.addUserToDB();
    redirect("/home");
  } catch (error) {
    redirect("/");
  }
}
