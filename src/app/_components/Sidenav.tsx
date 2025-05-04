"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollAreaScrollbar } from "@radix-ui/react-scroll-area";

import Sidenavheader from "./sidenav/header";
import RenderFolder from "./sidenav/renderFolder";
import RenderExercise from "./sidenav/renderExercise";
import { api, type RouterOutputs } from "@/trpc/react";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useId } from "react";
export default function Sidenav({
  initialData,
}: {
  initialData: RouterOutputs["database"]["latestExercises"];
}) {
  const exercises = api.database.latestExercises.useQuery(undefined, {
    initialData,
  });
  const noFolderExercisesRef = useDroppable({ id: "root" });
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    console.log(over.id, "over");
    console.log(active.id, "active");
    console.log(active.data.current, "ok");
  };
  const id = useId();
  return (
    <Sidebar className="border-r border-[#0f1410]">
      <DndContext
        id={id}
        onDragStart={() => console.log("lolllll")}
        onDragEnd={handleDragEnd}
      >
        <SidebarContent className="bg-[#0f1410] text-gray-300">
          <Sidenavheader exercises={exercises} />
          <ScrollArea className="h-[80%] rounded-md [--border:#152d33]">
            <ScrollAreaScrollbar
              orientation="vertical"
              className="w-2 bg-[#0f1410]"
            ></ScrollAreaScrollbar>

            {exercises.data.folders.map((folder) => (
              <RenderFolder key={folder.folderId} folder={folder} />
            ))}

            <SidebarGroup ref={noFolderExercisesRef.setNodeRef}>
              <SidebarMenu>
                {exercises.data.exercises.map((exercise) => (
                  <RenderExercise
                    key={exercise.exerciseId}
                    exercise={exercise}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </ScrollArea>
        </SidebarContent>
      </DndContext>
    </Sidebar>
  );
}
