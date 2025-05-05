"use client";

import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
import RenderExercise from "./renderExercise";
import type { RouterOutputs } from "@/trpc/react";
import { useDroppable } from "@dnd-kit/core";

export default function RootDropArea({
  exercises,
}: {
  exercises: RouterOutputs["database"]["latestExercises"]["exercises"];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "root",
  });

  return (
    <SidebarGroup
      ref={setNodeRef}
      className={`${isOver ? "rounded border-2 border-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" : ""}`}
    >
      <SidebarMenu>
        {exercises.map((exercise) => (
          <RenderExercise key={exercise.exerciseId} exercise={exercise} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
