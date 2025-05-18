import { useIsMutating } from "@tanstack/react-query";
import { getMutationKey } from "@trpc/react-query";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";

export default function useExerciseIsMutating() {
  const mutationKeyAddNewExercise = getMutationKey(api.database.addNewExercise);
  const numberOfMutationsAddNewExercise = useIsMutating({
    mutationKey: mutationKeyAddNewExercise,
  });

  const mutationKeyAddNewExerciseFolder = getMutationKey(
    api.database.addNewExerciseWithFolder,
  );
  const numberOfMutationsAddNewExerciseFolder = useIsMutating({
    mutationKey: mutationKeyAddNewExerciseFolder,
  });

  const [hasMutated, setHasMutated] = useState<boolean>(false);
  useEffect(() => {
    if (
      numberOfMutationsAddNewExercise > 0 ||
      numberOfMutationsAddNewExerciseFolder > 0
    ) {
      setHasMutated(true);
    }
  }, [numberOfMutationsAddNewExercise, numberOfMutationsAddNewExerciseFolder]);
  return hasMutated;
}
