import { api } from "@/trpc/server";
import { LatestPost } from "./_components/post";

export default async function Home() {
  const problems = await api.post.getProblems();

  return <div className="text-bold text-center text-6xl">Hemu-Ai</div>;
}
