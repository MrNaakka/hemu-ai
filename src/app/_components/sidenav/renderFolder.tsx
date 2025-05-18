"use client";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarMenuSub,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

import { type RouterOutputs } from "@/trpc/react";

import { Folder, Ellipsis } from "lucide-react";
import PopoverMenu from "../onlyUI/popoverMenu";
import { FolderPopoverContent } from "../PopoverContent";

import { useDroppable } from "@dnd-kit/core";
import RenderFolderExercise from "./renderFolderExercise";

export default function RenderFolder({
  folder,
}: {
  folder: RouterOutputs["database"]["latestExercises"]["folders"][number];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: folder.folderId });
  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup
        ref={setNodeRef}
        className={`${isOver ? "rounded border-2 border-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" : ""}`}
      >
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1">
            <span className="flex items-center gap-2 text-white">
              <Folder className="h-4 w-4" />
              {folder.folderName}
            </span>
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <SidebarGroupAction title="Add Exercise" className="">
          <PopoverMenu
            popTrigger={
              <span className="rounded p-1 hover:bg-green-800">
                <Ellipsis className="h-4 w-4" color="white" />
              </span>
            }
          >
            <FolderPopoverContent
              folderName={folder.folderName}
              folderId={folder.folderId}
            />
          </PopoverMenu>
        </SidebarGroupAction>

        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenuSub className="border-green-800">
              {folder.exercises.map((exercise) => (
                <RenderFolderExercise
                  folderId={folder.folderId}
                  exercise={exercise}
                  key={exercise.exerciseId}
                />
              ))}
            </SidebarMenuSub>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
