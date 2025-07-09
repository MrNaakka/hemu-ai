import { useProblemEditor, useSolveEditor } from "@/lib/context/editorContext";
import { removeSrcFromContent, type TipTapContent } from "@/lib/utils";

export function useEditorContent() {
  const problemEditor = useProblemEditor();

  const solveEditor = useSolveEditor();

  if (!problemEditor.current || !solveEditor.current) return null;

  const problemContent = problemEditor.current.getJSON() as TipTapContent;
  const noSrcProblemContent = removeSrcFromContent(problemContent);
  const solveContent = solveEditor.current.getJSON() as TipTapContent;
  const noSrcSolveContent = removeSrcFromContent(solveContent);

  return {
    problemString: JSON.stringify(noSrcProblemContent),
    solveString: JSON.stringify(noSrcSolveContent),
    editor: solveEditor.current,
  };
}
