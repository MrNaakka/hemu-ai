import { createContext, useContext } from "react";

export const ExerciseIdContext = createContext<string | null>(null);

export function useExerciseId() {
  const ctx = useContext(ExerciseIdContext);
  if (!ctx) {
    throw new Error("useExerciseId is used in the wrong place.");
  }
  return ctx;
}
