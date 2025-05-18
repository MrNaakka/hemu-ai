"use client";
import { useRef } from "react";
import Tiptap from "./tiptap";
import type { Editor } from "@tiptap/core";
import { SidebarInset } from "@/components/ui/sidebar";
import ChatSidenav from "./chatSidenav";
import { type RouterOutputs } from "@/trpc/react";
import CustomTrigger from "./chatSidenav/trigger";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

import ExerciseSkeleton from "./exerciseSkeleton";
import useExerciseIsMutating from "@/hooks/newExerciseIsMutating";

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

  return (
    <>
      <SidebarInset className="bg-primaryBg">
        {hasMutated ? (
          <ExerciseSkeleton needButton={false} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4">
            <div className="flex h-1/5 w-full flex-col gap-2">
              {/* <Input id="upload-file" className="hidden" type="file" />
              <Label
                htmlFor="upload-file"
                className="color-zinc-300 border-secondaryBg hover:bg-secondaryBg w-min rounded p-1 whitespace-nowrap"
              >
                <Plus />
                upload a file
              </Label> */}
              <Tiptap
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
              textEditorType="solve"
              exerciseId={exerciseId}
              startContent={JSON.parse(initialEditorsData.solve.solveContent)}
              editorRef={solveEditor}
              className="h-3/5 w-full"
              placeHolder="Solve your problem here..."
            />
          </div>
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
