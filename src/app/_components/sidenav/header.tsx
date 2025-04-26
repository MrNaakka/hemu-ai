"use client";

import { SidebarGroup, SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/trpc/react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { ThreeDot } from "react-loading-indicators";
import { Plus } from "lucide-react";
import { FormDialog } from "../onlyUI/dialogs";

type exercisesType = ReturnType<typeof api.database.latestExercises.useQuery>;

export default function Sidenavheader({
  exercises,
}: {
  exercises: exercisesType;
}) {
  const util = api.useUtils();
  const folderMutation = api.database.addNewFolder.useMutation();
  const exerciseMutation = api.database.addNewExercise.useMutation();
  return (
    <>
      <SidebarGroup>
        <div className="flew-col flex justify-between">
          <SidebarTrigger />
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </SidebarGroup>
      <SidebarGroup className="text-bold flex flex-row gap-4">
        Exercises {exercises.isFetching && <ThreeDot color={"white"} />}
      </SidebarGroup>
      <div className="flex flex-row justify-between gap-2 p-2">
        <FormDialog
          title="Add folder"
          triggerContent={
            <>
              <Plus className="h-4 w-4" color="white" />
              Add folder
            </>
          }
          dialogAction={(name) => {
            folderMutation.mutate(
              { name: name },
              {
                onSuccess: () => {
                  util.invalidate();
                },
              },
            );
          }}
        />

        <FormDialog
          title="Add Exercise"
          triggerContent={
            <>
              <Plus className="h-4 w-4" color="white" />
              Add Exercise
            </>
          }
          dialogAction={(name) => {
            exerciseMutation.mutate(
              { name: name },
              {
                onSuccess: () => {
                  util.invalidate();
                },
              },
            );
          }}
        />
      </div>
    </>
  );
}
