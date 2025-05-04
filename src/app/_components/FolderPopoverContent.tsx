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
  const newExerciseMutate = api.database.addNewExerciseWithFolder.useMutation();
  const renameFolderMutate = api.database.renameFolder.useMutation();
  const deleteFolderMutate = api.database.deleteFolder.useMutation();
  const utils = api.useUtils();

  const router = useRouter();

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
                router.push(`/home/${result.eId}`);
                utils.invalidate();
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
          renameFolderMutate.mutate(
            { name: name, folderId: folderId },
            {
              onSuccess: () => {
                utils.invalidate();
              },
            },
          )
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
          deleteFolderMutate.mutate(
            { folderId: folderId },
            {
              onSuccess: () => {
                utils.invalidate();
              },
            },
          );
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
  const deleteExerciseMutation = api.database.deleteExercise.useMutation();
  const renameExerciseMutation = api.database.renameExercise.useMutation();
  const utils = api.useUtils();

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
          renameExerciseMutation.mutate(
            { name: name, exerciseId: exerciseId },
            {
              onSuccess: () => {
                utils.invalidate();
              },
            },
          )
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
          deleteExerciseMutation.mutate(
            { exerciseId: exerciseId },
            {
              onSuccess: () => {
                utils.invalidate();
              },
            },
          );
        }}
      />
    </div>
  );
}
