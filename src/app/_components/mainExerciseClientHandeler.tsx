"use client";
import { useRef, useState } from "react";
import Tiptap from "./tiptap";
import type { Editor } from "@tiptap/core";
import { SidebarInset } from "@/components/ui/sidebar";
import ChatSidenav from "./chatSidenav";
import { type RouterOutputs } from "@/trpc/react";
import CustomTrigger from "./chatSidenav/trigger";

import ExerciseSkeleton from "./exerciseSkeleton";
import useExerciseIsMutating from "@/hooks/newExerciseIsMutating";
import { Button } from "@/components/ui/button";
import { insertNewMathfield } from "./tiptap/extensions/customKeyMapExtension";
import type { MathField } from "@digabi/mathquill";

import shortcuts, { type ShortcutData } from "@/lib/mathfieldButtonsData";

export default function MainClientHandeler({
  initialEditorsData,
  initialMessagesData,
  exerciseId,
}: {
  exerciseId: string;
  initialEditorsData: NonNullable<
    RouterOutputs["database"]["getEditorsContent"]
  >;
  initialMessagesData: RouterOutputs["database"]["getMessages"];
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

  const handleShortCutClickWrite = (latex: string) => {
    if (!mathfieldRef.current) return;
    mathfieldRef.current.write(latex);
  };

  return (
    <>
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
                >
                  Add a new mathfield!
                </Button>
              ) : (
                <></>
              )}

              {isMathfieldFocused ? (
                <div className="border-secondaryBg flex flex-row flex-wrap justify-between border-1 p-1">
                  {shortcuts.map((shortcut) => (
                    <button
                      key={crypto.randomUUID()}
                      className="bg-primaryBg h-12 w-12 p-1"
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
                  exerciseId={exerciseId}
                  startContent={JSON.parse(
                    initialEditorsData.problem.problemContent,
                  )}
                  editorRef={problemEditor}
                  className="h-full w-full"
                  placeHolder="Type your problem here..."
                />
              </div>
              <Tiptap
                mathfieldRef={mathfieldRef}
                setIsTextFocused={setIsTextFocused}
                setIsMathfieldFocused={setIsMathfieldFocused}
                textEditorType="solve"
                exerciseId={exerciseId}
                startContent={JSON.parse(initialEditorsData.solve.solveContent)}
                editorRef={solveEditor}
                className="h-3/5 w-full"
                placeHolder="Solve your problem here..."
              />
            </div>
          </>
        )}
      </SidebarInset>

      <div className="h-full">
        <ChatSidenav
          exerciseId={exerciseId}
          initialMessagesData={initialMessagesData}
          problemEditor={problemEditor}
          solveEditor={solveEditor}
        />
        <CustomTrigger className="m-2 p-2" />
      </div>
    </>
  );
}
