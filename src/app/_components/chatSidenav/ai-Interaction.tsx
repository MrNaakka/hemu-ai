"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { api } from "@/trpc/react";
import React, { useRef, type RefObject } from "react";
import type { Editor } from "@tiptap/core";
import TeXToSVG from "tex-to-svg";
export default function AiInteraction({
  problemEditor,
  solveEditor,
  exerciseId,
}: {
  problemEditor: RefObject<Editor | null>;
  solveEditor: RefObject<Editor | null>;
  exerciseId: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const nextstep = api.ai.nextstep.useMutation();
  const util = api.useUtils();

  const getContent = () => {
    console.log("problem", problemEditor);
    if (!problemEditor.current || !solveEditor.current) return null;
    return {
      problemString: JSON.stringify(problemEditor.current.getJSON()),
      solveString: JSON.stringify(solveEditor.current.getJSON()),
      editor: solveEditor.current,
    };
  };
  const handleNextstepClick = () => {
    const content = getContent();
    // for ts
    const x = textareaRef.current;
    if (!content || !x) return;

    util.database.getMessages.setData(
      { exerciseId: exerciseId },
      (old = []) => {
        return [
          ...old,
          {
            chatId: Date.now(),
            chatContent: `Solve the nextstep for me!${x.value}`,
            sender: "user",
          },
        ];
      },
    );
    nextstep.mutate(
      {
        problem: content.problemString,
        solve: content.solveString,
        message: x.value,
        exerciseId: exerciseId,
      },
      {
        onSuccess: async (result) => {
          util.database.getMessages.setData(
            { exerciseId: exerciseId },
            (old = []) => {
              return [
                ...old,
                {
                  chatId: Date.now(),
                  chatContent: result.explanation,
                  sender: "ai",
                },
              ];
            },
          );
          const svg = TeXToSVG(result.latex).replace(
            /fill="currentColor"/g,
            'fill="white"',
          );
          content.editor.setEditable(false);
          content.editor
            .chain()
            .focus()
            .insertContentAt(content.editor.state.doc.content.size, [
              {
                type: "ai-suggestion",
                content: [
                  {
                    type: "custom-image",
                    attrs: {
                      id: crypto.randomUUID(),
                      latex: result.latex,
                      src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                        svg,
                      )}`,
                    },
                  },
                ],
              },
            ])
            .run();
        },
      },
    );
  };
  return (
    <div className="flex h-[20%] w-full flex-col justify-end gap-4 p-4">
      <div className="flex w-full flex-row items-center justify-center gap-4">
        <Button onClick={handleNextstepClick} className="p-8 text-3xl">
          Next step
        </Button>
        <Button className="p-8 text-3xl">Solve rest</Button>
      </div>
      <div className="jusitfy-between flex w-full flex-row items-center rounded border-1 border-teal-950 bg-[#161f1e]">
        <Textarea
          ref={textareaRef}
          className="focus:border-noen resize-none overflow-auto border-none focus:border-none focus-visible:ring-0"
        />
        <Button className="bg-[#161f1e]">
          <SendHorizontal />
        </Button>
      </div>
    </div>
  );
}
