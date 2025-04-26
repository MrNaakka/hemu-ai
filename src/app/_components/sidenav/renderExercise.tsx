"use client";

import type { RouterOutputs } from "@/trpc/react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { FileText, Ellipsis } from "lucide-react";
import PopoverMenu from "../onlyUI/popoverMenu";
import { ExercisePopoverContent } from "../FolderPopoverContent";

export default function RenderExercise({
  exercise,
}: {
  exercise: RouterOutputs["database"]["latestExercises"]["exercises"][number];
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className="rounded hover:bg-green-800 hover:text-white active:bg-green-800 active:text-white [&:hover>.ellipsis]:opacity-100"
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
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
