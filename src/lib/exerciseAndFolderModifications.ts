import { type RouterOutputs } from "@/trpc/react";
type Exercise =
  RouterOutputs["database"]["latestExercises"]["folders"][number]["exercises"][number];
type Folders = RouterOutputs["database"]["latestExercises"]["folders"];
type Exercises = RouterOutputs["database"]["latestExercises"]["exercises"];

export function renameFolder(
  checkFolderId: string,
  newName: string,
  folders: Folders,
): Folders {
  const newFolders = folders.map((x) =>
    x.folderId === checkFolderId ? { ...x, folderName: newName } : x,
  );
  return newFolders;
}

export function renameExercise(
  exerciseId: string,
  newName: string,
  exercises: Exercises,
): Exercises {
  const newExercises = exercises.map((x) =>
    x.exerciseId === exerciseId
      ? { exerciseId: x.exerciseId, exerciseName: newName }
      : x,
  );
  return newExercises;
}

export function renameFolderExercise(
  exerciseId: string,
  newName: string,
  folderId: string,
  folders: Folders,
): Folders {
  const newFolders = folders.map((folder) =>
    folder.folderId === folderId
      ? {
          ...folder,
          exercises: folder.exercises.map((exercise) =>
            exercise.exerciseId === exerciseId
              ? { exerciseId: exercise.exerciseId, exerciseName: newName }
              : exercise,
          ),
        }
      : folder,
  );
  return newFolders;
}
