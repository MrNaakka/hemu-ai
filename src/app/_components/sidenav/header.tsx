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
import { addExercise, addFolder } from "@/lib/exerciseAndFolderModifications";
type exercisesType = ReturnType<typeof api.database.latestExercises.useQuery>;

export default function Sidenavheader({
  exercises,
}: {
  exercises: exercisesType;
}) {
  const router = useRouter();

  const util = api.useUtils();
  const folderMutation = api.database.addNewFolder.useMutation();

  const exerciseMutation = api.database.addNewExercise.useMutation({
    onError() {
      if (window.location.pathname === "/home") {
        window.location.reload();
      } else {
        router.push("/home");
      }
    },
    onSuccess: (result) => {
      router.push(`/home/${result.eId}`);
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
            const folderId = crypto.randomUUID();
            util.database.latestExercises.setData(undefined, (old) => {
              if (!old) return old;
              const folder = {
                folderId: folderId,
                folderName: name,
                exercises: [],
              };
              const folders = addFolder(folder, old.folders);
              return { ...old, folders };
            });

            folderMutation.mutate({ name: name, folderId: folderId });
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
            const exerciseId = crypto.randomUUID();
            util.database.latestExercises.setData(undefined, (old) => {
              if (!old) return old;

              const exercises = addExercise(
                { exerciseId: exerciseId, exerciseName: name },
                old.exercises,
              );
              return { ...old, exercises };
            });
            exerciseMutation.mutate({ name: name, exerciseId: exerciseId });
          }}
        />
      </div>
    </>
  );
}
