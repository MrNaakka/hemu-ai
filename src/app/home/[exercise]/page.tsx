import MainClientHandeler from "@/app/_components/mainClientHandeler";
import { api } from "@/trpc/server";
import { z } from "zod";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ exercise: string }>;
}) {
  const { exercise } = await params;

  if (!z.string().uuid().safeParse(exercise).success) {
    return <div>mitävit</div>;
  }

  const [content, messages] = await Promise.all([
    api.database.getEditorsContent({
      exerciseId: exercise,
    }),
    api.database.getMessages({ exerciseId: exercise }),
  ]);

  if (!content) return <div>mitävit</div>;

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
      <div className="flex h-full w-full bg-[#161f1e]">
        <MainClientHandeler
          exerciseId={exercise}
          initialEditorsData={content}
          initialMessagesData={messages}
        />
      </div>
    </SidebarProvider>
  );
}
