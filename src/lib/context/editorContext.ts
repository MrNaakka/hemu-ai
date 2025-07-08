import { type RefObject, createContext, useContext } from "react";
import type { Editor } from "@tiptap/core";

export const ProblemEditorContext =
  createContext<RefObject<Editor | null> | null>(null);
export const SolveEditorContext =
  createContext<RefObject<Editor | null> | null>(null);

export function useProblemEditor() {
  const ctx = useContext(ProblemEditorContext);
  if (!ctx) {
    throw new Error("useProblemEditor is used in the wrong place.");
  }
  return ctx;
}

export function useSolveEditor() {
  const ctx = useContext(SolveEditorContext);

  if (!ctx) {
    throw new Error("useProblemEditor is used in the wrong place.");
  }
  return ctx;
}
