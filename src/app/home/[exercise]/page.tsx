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

  let content;
  let messages: void;
  let r2: void;
  let tokenInfo;

  try {
    [content, messages, r2, tokenInfo] = await Promise.all([
      api.database.getEditorsContent({ exerciseId }),
      api.database.getMessages.prefetch({ exerciseId }),
      api.r2.getPresingedGetUrls.prefetch({ exerciseId }),
      api.database.getTokenInformation.prefetch(),
    ]);
  } catch (err) {
    return redirect("/home");
  }

  if (!content) {
    return redirect("/home");
  }

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
          <MainClientHandeler
            exerciseId={exerciseId}
            initialContent={content}
          />
        </HydrateClient>
      </div>
    </SidebarProvider>
  );
}
