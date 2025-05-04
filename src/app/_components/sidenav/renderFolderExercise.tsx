"use client";

import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import PopoverMenu from "../onlyUI/popoverMenu";
import { Ellipsis, FileText } from "lucide-react";
import { ExercisePopoverContent } from "../FolderPopoverContent";
import type { RouterOutputs } from "@/trpc/react";
import { useDraggable } from "@dnd-kit/core";

export default function RenderFolderExercise({
  exercise,
  folderId,
}: {
  exercise: RouterOutputs["database"]["latestExercises"]["folders"][number]["exercises"][number];
  folderId: string;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: exercise.exerciseId,
    data: { from: folderId },
  });

  return (
    <SidebarMenuSubItem
      key={exercise.exerciseId}
      {...attributes}
      {...listeners}
      ref={setNodeRef}
    >
      <SidebarMenuSubButton
        asChild
        className="rounded bg-[#0f1410] text-white hover:bg-green-800 hover:text-white active:bg-green-800 active:text-white [&:hover>.ellipsis]:opacity-100"
      >
        <div className="group flex flex-row justify-between">
          <Link
            href={`/home/${exercise.exerciseId}`}
            className="flex h-full w-full flex-row items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span>{exercise.exerciseName}</span>
          </Link>

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
