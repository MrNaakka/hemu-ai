"use client";

import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import PopoverMenu from "../onlyUI/popoverMenu";
import { Ellipsis, FileText } from "lucide-react";
import { ExercisePopoverContent } from "../PopoverContent";
import type { RouterOutputs } from "@/trpc/react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function RenderFolderExercise({
  exercise,
  folderId,
}: {
  exercise: RouterOutputs["database"]["latestExercises"]["folders"][number]["exercises"][number];
  folderId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: exercise.exerciseId,
      data: {
        from: folderId,
        name: exercise.exerciseName,
        exerciseId: exercise.exerciseId,
      },
    });

  // const style: React.CSSProperties = {
  //   transform: CSS.Translate.toString(transform),
  //   ...(isDragging && {
  //     position: "relative",
  //     zIndex: 999,
  //     pointerEvents: "none",
  //   }),
  // };

  return (
    <SidebarMenuSubItem
      key={exercise.exerciseId}
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      // style={style}
    >
      <SidebarMenuSubButton
        asChild
        className="bg-secondaryBg hover:bg-secondaryBg active:bg-secondaryBg rounded border-zinc-400 text-white hover:border-1 hover:text-white active:text-white [&:hover>.ellipsis]:opacity-100"
      >
        <div className="group flex flex-row justify-between">
          {isDragging ? (
            <span className="z-999 flex h-full w-full flex-row items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{exercise.exerciseName}</span>
            </span>
          ) : (
            <Link
              type="button"
              href={`/home/${exercise.exerciseId}`}
              className="flex h-full w-full flex-row items-center gap-2"
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
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
