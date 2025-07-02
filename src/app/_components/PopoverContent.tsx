"use client";

import { Plus, Pencil, Trash2 } from "lucide-react";
import { FormDialog, DeleteDialog } from "./onlyUI/dialogs";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export function FolderPopoverContent({
  folderId,
  folderName,
}: {
  folderId: string;
  folderName: string;
}) {
  const router = useRouter();
  const utils = api.useUtils();

  const newExerciseMutate = api.database.addNewExerciseWithFolder.useMutation({
    onError() {
      if (window.location.pathname === "/home") {
        window.location.reload();
      } else {
        router.push("/home");
      }
    },
    // the onSuccess is below since i need the name.
  });
  const renameFolderMutate = api.database.renameFolder.useMutation({
    onSuccess: (result) => {
      utils.database.latestExercises.setData(undefined, (old) => {
        return { folders: result, exercises: old!.exercises };
      });
    },
  });
  const deleteFolderMutate = api.database.deleteFolder.useMutation({
    onSuccess: (result) => {
      router.refresh();
      utils.database.latestExercises.setData(undefined, (old) => {
        return { folders: result, exercises: old!.exercises };
      });
    },
  });

  return (
    <div className="flex flex-col justify-center gap-2 p-2">
      <FormDialog
        title="New exercise name"
        triggerContent={
          <>
            <Plus />
            Add exercise
          </>
        }
        dialogAction={(name) =>
          newExerciseMutate.mutate(
            { name: name, folderId: folderId },
            {
              onSuccess: (result) => {
                router.push(`/home/${result.e.eId}`);
                utils.database.latestExercises.setData(undefined, (old) => {
                  return {
                    folders: result.exercisesInFolders,
                    exercises: old!.exercises,
                  };
                });
              },
            },
          )
        }
      />
      <FormDialog
        title={`Rename folder ${folderName}`}
        triggerContent={
          <>
            <Pencil />
            Rename
          </>
        }
        dialogAction={(name) =>
          renameFolderMutate.mutate({ name: name, folderId: folderId })
        }
      />
      <DeleteDialog
        descriptionContent={`There is no going back. This will delete folder "${folderName}" and all
				the exercises inside it.`}
        title={`Are you sure you want to delete folder "${folderName}"?`}
        triggerContent={
          <>
            <Trash2 color="red" />
            Delete
          </>
        }
        dialogAction={() => {
          deleteFolderMutate.mutate({ folderId: folderId });
        }}
      />
    </div>
  );
}

export function ExercisePopoverContent({
  exerciseId,
  exerciseName,
}: {
  exerciseId: string;
  exerciseName: string;
}) {
  const utils = api.useUtils();
  const router = useRouter();
  const deleteExerciseMutation = api.database.deleteExercise.useMutation({
    onMutate: () => {
      if (window.location.pathname === `/home/${exerciseId}`) {
        router.push("/home");
      }
    },
    onSuccess: (result) => {
      utils.database.latestExercises.setData(undefined, (_) => {
        return { folders: result.allFolders, exercises: result.allExercises };
      });
    },
  });

  const renameExerciseMutation = api.database.renameExercise.useMutation({
    onSuccess: (result) => {
      utils.database.latestExercises.setData(undefined, (_) => {
        return { folders: result.allFolders, exercises: result.allExercises };
      });
    },
  });

  return (
    <div className="flex flex-col justify-center gap-2 p-2">
      <FormDialog
        title={`Rename exercise "${exerciseName}"`}
        triggerContent={
          <>
            <Pencil />
            Rename
          </>
        }
        dialogAction={(name) =>
          renameExerciseMutation.mutate({ name: name, exerciseId: exerciseId })
        }
      />
      <DeleteDialog
        descriptionContent={`There is no going back. This will delete exercise "${exerciseName}".`}
        title={`Are you sure you want to delete exercise "${exerciseName}"?`}
        triggerContent={
          <>
            <Trash2 color="red" />
            Delete
          </>
        }
        dialogAction={() => {
          deleteExerciseMutation.mutate({ exerciseId: exerciseId });
        }}
      />
    </div>
  );
}
