import { api } from "@/trpc/server";
import { z } from "zod";

export default async function Home({
  params,
}: {
  params: Promise<{ exercise: string }>;
}) {
  const { exercise } = await params;

  if (!z.string().uuid().safeParse(exercise).success) {
    return <div>mitävit</div>;
  }

  const content = await api.database.getExerciseContent({
    exerciseId: exercise,
  });

  if (!content) return <div>mitävit</div>;

  return (
    <div>
      Ihan vitun helppooasdfasfdsao, {exercise} {content.problem.problemContent}
    </div>
  );
}
