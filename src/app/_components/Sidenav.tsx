"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
} from "@/components/ui/sidebar";

import { ScrollArea } from "@/components/ui/scroll-area";

import { api, type RouterOutputs } from "@/trpc/react";

import { ScrollAreaScrollbar } from "@radix-ui/react-scroll-area";
import Sidenavheader from "./sidenav/header";
import RenderFolder from "./sidenav/renderFolder";
import RenderExercise from "./sidenav/renderExercise";

export default function Sidenav({
  initialData,
}: {
  initialData: RouterOutputs["database"]["latestExercises"];
}) {
  const exercises = api.database.latestExercises.useQuery(undefined, {
    initialData,
  });

  return (
    <Sidebar className="border-r border-[#2b402f]">
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

          <SidebarGroup>
            <SidebarMenu>
              {exercises.data.exercises.map((exercise) => (
                <RenderExercise key={exercise.exerciseId} exercise={exercise} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
