import { type RouterOutputs } from "@/trpc/react";

type Exercise =
  RouterOutputs["database"]["latestExercises"]["folders"][number]["exercises"][number];
type Folders = RouterOutputs["database"]["latestExercises"]["folders"];
export function addExercise(
  exercise: Exercise,
  newFolderId: string,
  folders: Folders,
): Folders {
  for (const [index, folder] of folders.entries()) {
    if (folder.folderId === newFolderId) {
      for (const x of folder.exercises.entries()) {
        if (
          x[1].exerciseName.localeCompare(exercise.exerciseName) === (1 || 0)
        ) {
          folders[index]!.exercises.splice(x[0] - 1, 0, exercise);
          return folders;
        }
      }
      folder.exercises.push(exercise);
      return folders;
    }
  }

  console.log("theree is an error!!!!");
  return folders;
}

export function removeExercise(
  exerciseId: string,
  oldFolderId: string,
  folders: Folders,
): Folders {
  for (const [index, { folderId, exercises }] of folders.entries()) {
    if (folderId === oldFolderId) {
      const newExercises = exercises.filter((x) => x.exerciseId !== exerciseId);
      folders[index]!.exercises = newExercises;
      return folders;
    }
  }
  console.log("error deleting exercise from folder");
  return folders;
}
