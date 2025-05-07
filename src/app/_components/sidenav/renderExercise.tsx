"use client";

import type { RouterOutputs } from "@/trpc/react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { FileText, Ellipsis } from "lucide-react";
import PopoverMenu from "../onlyUI/popoverMenu";
import { ExercisePopoverContent } from "../FolderPopoverContent";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function RenderExercise({
  exercise,
}: {
  exercise: RouterOutputs["database"]["latestExercises"]["exercises"][number];
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: exercise.exerciseId,
    data: { from: "root", name: exercise.exerciseName },
  });

  return (
    <SidebarMenuItem {...attributes} {...listeners} ref={setNodeRef}>
      <SidebarMenuButton
        asChild
        className="hover:bg-secondaryBg active:bg-secondaryBg rounded border-zinc-400 hover:border-1 hover:text-white active:text-white [&:hover>.ellipsis]:opacity-100"
      >
        <div className="group flex flex-row justify-between">
          {isDragging ? (
            <span className="flex w-full flex-row items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{exercise.exerciseName}</span>
            </span>
          ) : (
            <Link
              href={`/home/${exercise.exerciseId}`}
              className="flex w-full flex-row items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              <span>{exercise.exerciseName}</span>
            </Link>
          )}

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
