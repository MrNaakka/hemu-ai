"use client";
import { useRef } from "react";
import Tiptap from "./tiptap";
import type { Editor } from "@tiptap/core";
import { SidebarInset } from "@/components/ui/sidebar";
import ChatSidenav from "./chatSidenav";
import { type RouterOutputs } from "@/trpc/react";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomTrigger from "./chatSidenav/trigger";

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

  return (
    <>
      <SidebarInset className="bg-primaryBg">
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
          <Tiptap
            textEditorType="problem"
            exerciseId={exerciseId}
            startContent={JSON.parse(initialEditorsData.problem.problemContent)}
            editorRef={problemEditor}
            className="h-1/5 w-full"
            placeHolder="Type your problem here..."
          />
          <Tiptap
            textEditorType="solve"
            exerciseId={exerciseId}
            startContent={JSON.parse(initialEditorsData.solve.solveContent)}
            editorRef={solveEditor}
            className="h-3/5 w-full"
            placeHolder="Solve your problem here..."
          />
        </div>
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
