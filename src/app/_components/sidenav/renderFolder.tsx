"use client";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";
import {
  SidebarGroup,
  SidebarMenuSub,
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
    <Collapsible defaultOpen className="group/collapsible w-full">
      <SidebarGroup
        ref={setNodeRef}
        className={`${isOver ? "w-full rounded border-2 border-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" : ""}`}
      >
        <div className="flex h-8 w-full items-center justify-center text-sm">
          <CollapsibleTrigger className="flex w-4/5 items-center gap-2 px-2 py-1">
            <Folder className="h-4 w-4" />
            <div className="w-40 overflow-x-auto text-left text-white">
              {folder.folderName}
            </div>
          </CollapsibleTrigger>
          <div className="flex w-1/5 items-center justify-end">
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
          </div>
        </div>

        {/* <SidebarGroupAction title="See options" className="">
          <
        </SidebarGroupAction> */}

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
