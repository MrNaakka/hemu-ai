"use client";
import { useRef, useState } from "react";
import Tiptap from "./tiptap";
import type { Editor, JSONContent } from "@tiptap/core";
import { SidebarInset } from "@/components/ui/sidebar";
import ChatSidenav from "./chatSidenav";
import CustomTrigger from "./chatSidenav/trigger";

import ExerciseSkeleton from "./exerciseSkeleton";
import useExerciseIsMutating from "@/hooks/newExerciseIsMutating";
import { Button } from "@/components/ui/button";
import { insertNewMathfield } from "./tiptap/extensions/customKeyMapExtension";
import type { MathField } from "@digabi/mathquill";

import { ExerciseIdContext } from "@/lib/context/ExerciseIdContext";
import {
  ProblemEditorContext,
  SolveEditorContext,
} from "@/lib/context/editorContext";

import ShortCuts from "./shortcuts";
import shortcuts from "@/lib/mathfieldButtonsData";

import UploadedFiles from "./uploadedFiles";

export default function MainClientHandeler({
  exerciseId,
  initialContent,
}: {
  exerciseId: string;
  initialContent: {
    solveContent: JSONContent;
    problemContent: JSONContent;
  };
}) {
  const problemEditor = useRef<null | Editor>(null);
  const solveEditor = useRef<null | Editor>(null);
  const hasMutated = useExerciseIsMutating();

  const [isTextFocused, setIsTextFocused] = useState<boolean>(false);
  const [isMathfieldFocused, setIsMathfieldFocused] = useState<boolean>(false);

  const mathfieldRef = useRef<MathField | null>(null);

  const handleClick = () => {
    if (!solveEditor.current || !problemEditor.current) return;

    if (solveEditor.current.isFocused) {
      insertNewMathfield(solveEditor.current);
      return;
    }
    insertNewMathfield(problemEditor.current);
    return;
  };
  return (
    <ExerciseIdContext.Provider value={exerciseId}>
      <ProblemEditorContext.Provider value={problemEditor}>
        <SolveEditorContext.Provider value={solveEditor}>
          <SidebarInset className="bg-primaryBg flex flex-col items-center">
            {hasMutated ? (
              <ExerciseSkeleton needButton={false} />
            ) : (
              <>
                <div className="h-1/10 w-9/10">
                  {isTextFocused ? (
                    <Button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleClick}
                      className="mt-4"
                    >
                      Add a new mathfield!
                    </Button>
                  ) : (
                    <></>
                  )}

                  {isMathfieldFocused && (
                    <ShortCuts
                      shortcuts={shortcuts}
                      mathfieldRef={mathfieldRef}
                    />
                  )}
                </div>
                <div className="flex h-[90%] w-9/10 flex-col items-center justify-center gap-4">
                  <UploadedFiles exerciseId={exerciseId} />

                  <div className="flex h-1/5 w-full flex-col gap-2">
                    <Tiptap
                      mathfieldRef={mathfieldRef}
                      setIsTextFocused={setIsTextFocused}
                      setIsMathfieldFocused={setIsMathfieldFocused}
                      textEditorType="problem"
                      className="h-full w-full"
                      placeHolder="Type your problem here. Press cmd + e or ctrl + e to add a new mathfield."
                      initialContent={initialContent.problemContent}
                    />
                  </div>
                  <Tiptap
                    mathfieldRef={mathfieldRef}
                    setIsTextFocused={setIsTextFocused}
                    setIsMathfieldFocused={setIsMathfieldFocused}
                    textEditorType="solve"
                    className="h-3/5 w-full"
                    placeHolder="Solve your problem here. Press cmd + e or ctrl + e to add a new mathfield."
                    initialContent={initialContent.solveContent}
                  />
                </div>
              </>
            )}
          </SidebarInset>

          <div className="h-full">
            <ChatSidenav />
            <CustomTrigger className="m-2 p-2" />
          </div>
        </SolveEditorContext.Provider>
      </ProblemEditorContext.Provider>
    </ExerciseIdContext.Provider>
  );
}
