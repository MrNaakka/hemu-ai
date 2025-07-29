import { useProblemEditor, useSolveEditor } from "@/lib/context/editorContext";
import { type TipTapContent } from "@/lib/utils";

export function useEditorContent() {
  const problemEditor = useProblemEditor();

  const solveEditor = useSolveEditor();

  if (!problemEditor.current || !solveEditor.current) return null;

  const problemContent = problemEditor.current.getJSON() as TipTapContent;
  const solveContent = solveEditor.current.getJSON() as TipTapContent;

  return {
    problem: problemContent,
    solve: solveContent,
    editor: solveEditor.current,
  };
}
