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
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import Link from "next/link";

import { type RouterOutputs } from "@/trpc/react";

import { Folder, Ellipsis, FileText } from "lucide-react";
import PopoverMenu from "../onlyUI/popoverMenu";
import {
  FolderPopoverContent,
  ExercisePopoverContent,
} from "../FolderPopoverContent";

import { useDroppable, useDraggable } from "@dnd-kit/core";
import RenderFolderExercise from "./renderFolderExercise";

export default function RenderFolder({
  folder,
}: {
  folder: RouterOutputs["database"]["latestExercises"]["folders"][number];
}) {
  const folderRef = useDroppable({ id: folder.folderId });
  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup ref={folderRef.setNodeRef}>
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
