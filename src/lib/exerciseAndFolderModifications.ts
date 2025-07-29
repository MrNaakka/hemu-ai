import { type RouterOutputs } from "@/trpc/react";

type Exercise =
  RouterOutputs["database"]["latestExercises"]["folders"][number]["exercises"][number];
type Folders = RouterOutputs["database"]["latestExercises"]["folders"];
type Folder = RouterOutputs["database"]["latestExercises"]["folders"][number];

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

export function deleteFolder(folderId: string, folders: Folders): Folders {
  return folders.filter((folder) => folder.folderId !== folderId);
}

export function deleteExercise(
  exerciseId: string,
  exercises: Exercises,
): Exercises {
  return exercises.filter((exercise) => exercise.exerciseId !== exerciseId);
}
export function deleteFolderExercise(
  exerciseId: string,
  folderId: string,
  folders: Folders,
): Folders {
  return folders.map((folder) =>
    folder.folderId === folderId
      ? {
          ...folder,
          exercises: folder.exercises.filter(
            (exercise) => exercise.exerciseId !== exerciseId,
          ),
        }
      : folder,
  );
}

export function addFolder(folder: Folder, folders: Folders): Folders {
  const index = folders.findIndex(
    (x) => x.folderName.localeCompare(folder.folderName) >= 0,
  );
  if (index === -1) {
    return [...folders, folder];
  }
  return [...folders.slice(0, index), folder, ...folders.slice(index)];
}

export function addExercise(
  newExercise: Exercise,
  exercises: Exercises,
): Exercises {
  const index = exercises.findIndex(
    (exercise) =>
      exercise.exerciseName.localeCompare(newExercise.exerciseName) >= 0,
  );
  if (index === -1) {
    return [...exercises, newExercise];
  }
  return [...exercises.slice(0, index), newExercise, ...exercises.slice(index)];
}

export function addFolderExercise(
  newExercise: Exercise,
  newFolderId: string,
  folders: Folders,
): Folders {
  const newFolders: Folders = folders.map((folder) => {
    if (folder.folderId === newFolderId) {
      const index = folder.exercises.findIndex(
        (exercise) =>
          exercise.exerciseName.localeCompare(newExercise.exerciseName) >= 0,
      );
      if (index === -1) {
        const newFolder: Folder = {
          ...folder,
          exercises: [...folder.exercises, newExercise],
        };
        return newFolder;
      }
      const newFolder: Folder = {
        ...folder,
        exercises: [
          ...folder.exercises.slice(0, index),
          newExercise,
          ...folder.exercises.slice(index),
        ],
      };
      return newFolder;
    }
    return folder;
  });
  return newFolders;
}

export function checkExerciseInFolder(
  checkExerciseId: string,
  checkFolderId: string,
  folders: Folders,
): boolean {
  for (const { folderId, exercises } of folders) {
    if (folderId === checkFolderId) {
      for (const { exerciseId } of exercises) {
        if (exerciseId === checkExerciseId) {
          return true;
        }
      }
      break;
    }
  }
  return false;
}
