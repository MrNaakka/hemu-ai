"use client";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollAreaScrollbar } from "@radix-ui/react-scroll-area";

import Sidenavheader from "./sidenav/header";
import RenderFolder from "./sidenav/renderFolder";

import { api, type RouterOutputs } from "@/trpc/react";

import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { useId, useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import RootDropArea from "./sidenav/rootDropArea";

export default function Sidenav({
  initialData,
}: {
  initialData: RouterOutputs["database"]["latestExercises"];
}) {
  const exercises = api.database.latestExercises.useQuery(undefined, {
    initialData,
  });

  const [activeName, setActiveName] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
        delay: 300,
      },
    }),
  );
  const changeFolderMutation = api.database.exerciseChangeFolder.useMutation();

  const util = api.useUtils();
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveName(null);
    if (!over || over.id === active.data.current!.from) return;

    changeFolderMutation.mutate(
      {
        exerciseId: active.id as string,
        folderId: over.id as string,
      },
      {
        onSuccess: () => {
          util.database.latestExercises.invalidate();
        },
      },
    );
    return;
  };
  const id = useId();

  return (
    <Sidebar className="border-r border-[#0f1410]">
      <SidebarContent className="bg-[#0f1410] text-gray-300">
        <Sidenavheader exercises={exercises} />
        <ScrollArea className="h-[80%] rounded-md [--border:#152d33]">
          <ScrollAreaScrollbar
            orientation="vertical"
            className="w-2 bg-[#0f1410]"
          ></ScrollAreaScrollbar>
          <DndContext
            id={id}
            onDragEnd={handleDragEnd}
            onDragStart={(e) =>
              setActiveName(e.active.data.current!.name as string)
            }
            sensors={sensors}
          >
            {exercises.data.folders.map((folder) => (
              <RenderFolder key={folder.folderId} folder={folder} />
            ))}
            <RootDropArea exercises={exercises.data.exercises} />

            <DragOverlay dropAnimation={{ duration: 100, easing: "ease" }}>
              {activeName ? (
                <div className="rounded border-1 border-black bg-[#161f1e] p-2">
                  {activeName}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
