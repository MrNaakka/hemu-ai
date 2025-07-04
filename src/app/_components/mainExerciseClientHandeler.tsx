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

import shortcuts from "@/lib/mathfieldButtonsData";
import { ExerciseIdContext } from "@/lib/context/ExerciseIdContext";
import {
  ProblemEditorContext,
  SolveEditorContext,
} from "@/lib/context/editorContext";

export default function MainClientHandeler({
  exerciseId,
}: {
  exerciseId: string;
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
  const handleShortCutClick = (latex: string, write: boolean) => {
    if (!mathfieldRef.current) return;
    if (write) {
      mathfieldRef.current.write(latex);
      return;
    }
    mathfieldRef.current.cmd(latex);
  };
  return (
    <ExerciseIdContext.Provider value={exerciseId}>
      <ProblemEditorContext.Provider value={problemEditor}>
        <SolveEditorContext.Provider value={solveEditor}>
          <SidebarInset className="bg-primaryBg">
            {hasMutated ? (
              <ExerciseSkeleton needButton={false} />
            ) : (
              <>
                <div className="h-[10%] w-full">
                  {isTextFocused ? (
                    <Button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleClick}
                      className="m-4"
                    >
                      Add a new mathfield!
                    </Button>
                  ) : (
                    <></>
                  )}

                  {isMathfieldFocused ? (
                    <div className="border-secondaryBg flex w-full flex-row flex-wrap justify-between border-1 p-4">
                      {shortcuts.map((shortcut) => (
                        <button
                          key={crypto.randomUUID()}
                          className="bg-primaryBg flex h-12 w-12 items-center justify-center p-1"
                          onClick={() =>
                            handleShortCutClick(
                              shortcut.action,
                              shortcut.fn === "write",
                            )
                          }
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <img className="invert filter" src={shortcut.svg} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
                <div className="flex h-[90%] w-full flex-col items-center justify-center gap-4">
                  <div className="flex h-1/5 w-full flex-col gap-2">
                    <Tiptap
                      mathfieldRef={mathfieldRef}
                      setIsTextFocused={setIsTextFocused}
                      setIsMathfieldFocused={setIsMathfieldFocused}
                      textEditorType="problem"
                      className="h-full w-full"
                      placeHolder="Type your problem here..."
                    />
                  </div>
                  <Tiptap
                    mathfieldRef={mathfieldRef}
                    setIsTextFocused={setIsTextFocused}
                    setIsMathfieldFocused={setIsMathfieldFocused}
                    textEditorType="solve"
                    className="h-3/5 w-full"
                    placeHolder="Solve your problem here..."
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
