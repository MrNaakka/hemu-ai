"use client";

import { SidebarGroup, SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/trpc/react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { ThreeDot } from "react-loading-indicators";
import { Plus } from "lucide-react";
import { FormDialog } from "../onlyUI/dialogs";
import { useRouter } from "next/navigation";
import { getMutationKey } from "@trpc/react-query";
import { useIsMutating } from "@tanstack/react-query";
type exercisesType = ReturnType<typeof api.database.latestExercises.useQuery>;

export default function Sidenavheader({
  exercises,
}: {
  exercises: exercisesType;
}) {
  const router = useRouter();

  const util = api.useUtils();
  const folderMutation = api.database.addNewFolder.useMutation({
    onSuccess: (result) => {
      util.database.latestExercises.setData(undefined, (old) => {
        return {
          folders: result.allFolders,
          exercises: old!.exercises,
        };
      });
    },
  });

  const exerciseMutation = api.database.addNewExercise.useMutation({
    onError(error) {
      if (window.location.pathname === "/home") {
        window.location.reload();
      } else {
        router.push("/home");
      }
    },
    onSuccess: (result) => {
      router.push(`/home/${result.e.eId}`);
      util.database.latestExercises.setData(undefined, (old) => {
        return {
          folders: old!.folders,
          exercises: result.allExercises,
        };
      });
    },
  });

  const mutKeyRenameFolder = getMutationKey(api.database.renameFolder);
  const mkDeleteFolder = getMutationKey(api.database.deleteFolder);
  const mkDeleteExercise = getMutationKey(api.database.deleteExercise);
  const mkRenameExercsie = getMutationKey(api.database.renameExercise);

  const numOfRF = useIsMutating({ mutationKey: mutKeyRenameFolder });
  const numOfDF = useIsMutating({ mutationKey: mkDeleteFolder });
  const numOfRE = useIsMutating({ mutationKey: mkRenameExercsie });
  const numOfDE = useIsMutating({ mutationKey: mkDeleteExercise });

  const isMutating = numOfRF > 0 || numOfDF > 0 || numOfRE > 0 || numOfDE > 0;

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
        Exercises{" "}
        {exercises.isFetching || (isMutating && <ThreeDot color={"white"} />)}
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
            folderMutation.mutate({ name: name });
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
            exerciseMutation.mutate({ name: name });
          }}
        />
      </div>
    </>
  );
}
