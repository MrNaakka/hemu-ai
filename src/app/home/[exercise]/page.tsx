import MainClientHandeler from "@/app/_components/mainExerciseClientHandeler";
import { api } from "@/trpc/server";
import { z } from "zod";
import { SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ exercise: string }>;
}) {
  const { exercise } = await params;

  if (!z.string().uuid().safeParse(exercise).success) {
    return redirect("/home");
  }

  const [content, messages] = await Promise.all([
    api.database.getEditorsContent({
      exerciseId: exercise,
    }),
    api.database.getMessages({ exerciseId: exercise }),
  ]);

  if (!content) redirect("/home");

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
        <MainClientHandeler
          exerciseId={exercise}
          initialEditorsData={content}
          initialMessagesData={messages}
        />
      </div>
    </SidebarProvider>
  );
}
