"use client";

import { Plus, Pencil, Trash2 } from "lucide-react";
import { FormDialog, DeleteDialog } from "./onlyUI/dialogs";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import {
  addFolderExercise,
  checkExerciseInFolder,
  deleteExercise,
  deleteFolder,
  deleteFolderExercise,
  renameExercise,
  renameFolder,
  renameFolderExercise,
} from "@/lib/exerciseAndFolderModifications";

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
  });
  const renameFolderMutate = api.database.renameFolder.useMutation();
  const deleteFolderMutate = api.database.deleteFolder.useMutation({
    onMutate: (variable) => {
      const currentData = utils.database.latestExercises.getData();
      if (!currentData) return;
      const path = window.location.pathname.split("/");
      const possibleExerciseId = path[path.length - 1]!;
      if (
        checkExerciseInFolder(
          possibleExerciseId,
          variable.folderId,
          currentData.folders,
        )
      ) {
        router.push("/home");
      }
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
        dialogAction={(name) => {
          const newExerciseId = crypto.randomUUID();
          utils.database.latestExercises.setData(undefined, (old) => {
            if (!old) return old;
            const folders = addFolderExercise(
              { exerciseId: newExerciseId, exerciseName: name },
              folderId,
              old.folders,
            );
            return { ...old, folders };
          });

          newExerciseMutate.mutate(
            { name: name, folderId: folderId, exerciseId: newExerciseId },

            {
              onSuccess: (result) => {
                router.push(`/home/${result.eId}`);
              },
            },
          );
        }}
      />
      <FormDialog
        title={`Rename folder ${folderName}`}
        triggerContent={
          <>
            <Pencil />
            Rename
          </>
        }
        dialogAction={(name) => {
          utils.database.latestExercises.setData(undefined, (old) => {
            if (!old) return old;
            const newFolders = renameFolder(folderId, name, old.folders);
            return { exercises: old.exercises, folders: newFolders };
          });
          renameFolderMutate.mutate({ name: name, folderId: folderId });
        }}
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
          const currentData = utils.database.latestExercises.getData();

          const path = window.location.pathname.split("/");
          const possibleExerciseId = path[path.length - 1]!;
          if (
            currentData &&
            checkExerciseInFolder(
              possibleExerciseId,
              folderId,
              currentData.folders,
            )
          ) {
            router.push("/home");
          }
          utils.database.latestExercises.setData(undefined, (old) => {
            if (!old) return old;
            const newFolders = deleteFolder(folderId, old.folders);
            return { exercises: old.exercises, folders: newFolders };
          });
          deleteFolderMutate.mutate({ folderId: folderId });
        }}
      />
    </div>
  );
}

export function ExercisePopoverContent({
  exerciseId,
  exerciseName,
  folderId,
}: {
  exerciseId: string;
  exerciseName: string;
  folderId: string;
}) {
  const utils = api.useUtils();
  const router = useRouter();
  const deleteExerciseMutation = api.database.deleteExercise.useMutation({
    onMutate: () => {
      if (window.location.pathname === `/home/${exerciseId}`) {
        router.push("/home");
      }
    },
  });

  const renameExerciseMutation = api.database.renameExercise.useMutation();

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
        dialogAction={(name) => {
          if (folderId === "root") {
            utils.database.latestExercises.setData(undefined, (old) => {
              if (!old) return old;

              const newExercises = renameExercise(
                exerciseId,
                name,
                old.exercises,
              );
              return { folders: old.folders, exercises: newExercises };
            });
          } else {
            utils.database.latestExercises.setData(undefined, (old) => {
              if (!old) return old;
              const newFolders = renameFolderExercise(
                exerciseId,
                name,
                folderId,
                old.folders,
              );
              return { folders: newFolders, exercises: old.exercises };
            });
          }

          renameExerciseMutation.mutate({ name: name, exerciseId: exerciseId });
        }}
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
          if (folderId === "root") {
            utils.database.latestExercises.setData(undefined, (old) => {
              if (!old) return old;
              const newExercises = deleteExercise(exerciseId, old.exercises);
              return { folders: old.folders, exercises: newExercises };
            });
          } else {
            utils.database.latestExercises.setData(undefined, (old) => {
              if (!old) return old;
              const newFolders = deleteFolderExercise(
                exerciseId,
                folderId,
                old.folders,
              );
              return { folders: newFolders, exercises: old.exercises };
            });
          }
          deleteExerciseMutation.mutate({ exerciseId: exerciseId });
        }}
      />
    </div>
  );
}
