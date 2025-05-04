import { api } from "@/trpc/server";
import Sidenav from "../_components/Sidenav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const eAndF = await api.database.latestExercises();

  return (
    <>
      <SidebarProvider className="h-full">
        <div className="max-h-full">
          <Sidenav initialData={eAndF} />
          <SidebarTrigger className="m-2 p-2" />
        </div>
        <div className="h-full w-full">{children}</div>
      </SidebarProvider>
    </>
  );
}
