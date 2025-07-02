"use client";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollAreaScrollbar } from "@radix-ui/react-scroll-area";

import Sidenavheader from "./sidenav/header";
import RenderFolder from "./sidenav/renderFolder";

import { api, type RouterOutputs } from "@/trpc/react";

import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { useId, useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import RootDropArea from "./sidenav/rootDropArea";

import { addExercise, removeExercise } from "@/lib/draggingModifications";

export default function Sidenav({
  initialData,
}: {
  initialData: RouterOutputs["database"]["latestExercises"];
}) {
  const exercises = api.database.latestExercises.useQuery(undefined, {
    initialData,
  });

  const [activeName, setActiveName] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
        delay: 300,
      },
    }),
  );
  const changeFolderMutation = api.database.exerciseChangeFolder.useMutation();

  const util = api.useUtils();

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveName(null);
    const current = active.data.current!;
    if (!over || over.id === current.from) return;
    util.database.latestExercises.setData(undefined, (old) => {
      if (!old) {
        return old;
      }
      if (current.from === "root") {
        const newExercises = old.exercises.filter(
          (x) => x.exerciseId !== current.exerciseId,
        );
        addExercise(
          { exerciseId: current.exerciseId, exerciseName: current.name },
          over.id as string,
          old.folders,
        );
        old.exercises = newExercises;
        return old;
      }
      if ((over.id as string) === "root") {
        removeExercise(current.exerciseId, current.from, old.folders);

        for (const [index, { exerciseName }] of old.exercises.entries()) {
          if (exerciseName.localeCompare(current.name) === (1 || 0)) {
            old.exercises.splice(index - 1, 0, {
              exerciseId: current.exerciseId,
              exerciseName: current.name,
            });
            return old;
          }
        }
        old.exercises.push({
          exerciseId: current.exerciseId,
          exerciseName: current.name,
        });
        return old;
      }
      removeExercise(current.exerciseId, current.from, old.folders);
      addExercise(
        { exerciseId: current.exerciseId, exerciseName: current.name },
        over.id as string,
        old.folders,
      );

      return old;
    });
    changeFolderMutation.mutate({
      exerciseId: active.id as string,
      folderId: over.id as string,
    });
    return;
  };
  const id = useId();

  return (
    <Sidebar className="border-secondaryBg border-r">
      <SidebarContent className="bg-secondaryBg text-gray-300">
        <Sidenavheader exercises={exercises} />
        <ScrollArea className="h-[80%] rounded-md [--border:#152d33]">
          <ScrollAreaScrollbar
            orientation="vertical"
            className="bg-secondaryBg w-2"
          ></ScrollAreaScrollbar>
          <DndContext
            id={id}
            onDragEnd={handleDragEnd}
            onDragStart={(e) =>
              setActiveName(e.active.data.current!.name as string)
            }
            sensors={sensors}
          >
            {exercises.data.folders.map((folder) => (
              <RenderFolder key={folder.folderId} folder={folder} />
            ))}
            <RootDropArea exercises={exercises.data.exercises} />

            <DragOverlay dropAnimation={{ duration: 100, easing: "ease" }}>
              {activeName ? (
                <div className="bg-primaryBg rounded border-1 border-black p-2">
                  {activeName}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
