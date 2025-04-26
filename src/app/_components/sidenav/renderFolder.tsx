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

import { type RouterOutputs } from "@/trpc/react";

import { Folder, Ellipsis, FileText } from "lucide-react";
import PopoverMenu from "../onlyUI/popoverMenu";
import {
  FolderPopoverContent,
  ExercisePopoverContent,
} from "../FolderPopoverContent";

export default function RenderFolder({
  folder,
}: {
  folder: RouterOutputs["database"]["latestExercises"]["folders"][number];
}) {
  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup>
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
                <SidebarMenuSubItem key={exercise.exerciseId}>
                  <SidebarMenuSubButton
                    asChild
                    className="rounded bg-[#0f1410] text-white hover:bg-green-800 hover:text-white active:bg-green-800 active:text-white [&:hover>.ellipsis]:opacity-100"
                  >
                    <div className="group flex flex-row justify-between">
                      <div className="flex flex-row gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{exercise.exerciseName}</span>
                      </div>
                      <PopoverMenu
                        popTrigger={
                          <Ellipsis
                            className="ellipsis h-4 w-4 opacity-0 transition-opacity duration-150"
                            color="white"
                          />
                        }
                      >
                        <ExercisePopoverContent
                          exerciseName={exercise.exerciseName}
                          exerciseId={exercise.exerciseId}
                        />
                      </PopoverMenu>
                    </div>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
