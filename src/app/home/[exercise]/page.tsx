import MainClientHandeler from "@/app/_components/mainExerciseClientHandeler";
import { api, HydrateClient } from "@/trpc/server";
import { z } from "zod";
import { SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ exercise: string }>;
}) {
  const { exercise: exerciseId } = await params;

  if (!z.string().uuid().safeParse(exerciseId).success) {
    return redirect("/home");
  }

  await Promise.all([
    api.database.getEditorsContent.prefetch({
      exerciseId: exerciseId,
    }),
    api.database.getMessages.prefetch({ exerciseId: exerciseId }),
  ]);

  return (
    <SidebarProvider
      defaultOpen={false}
      className="h-full"
      style={
        {
          "--sidebar-width": "30rem",
          "--sidebar-width-mobile": "20rem",
        } as React.CSSProperties
      }
    >
      <div className="bg-primaryBg flex h-full w-full">
        <HydrateClient>
          <MainClientHandeler exerciseId={exerciseId} />
        </HydrateClient>
      </div>
    </SidebarProvider>
  );
}
