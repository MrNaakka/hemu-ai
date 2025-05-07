"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import React, { useId, useRef, type RefObject } from "react";
import type { Editor } from "@tiptap/core";
import { ThreeDot } from "react-loading-indicators";
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

  const nextstepMutation = api.ai.nextstep.useMutation();
  const solverestMutation = api.ai.solverest.useMutation();
  const chatMutation = api.ai.justChat.useMutation();

  const util = api.useUtils();

  const getContent = (
    promptPrefix: "Solve the nextstep for me!" | "Solve the rest for me!" | "",
  ) => {
    // for ts
    const x = textareaRef.current;
    if (!problemEditor.current || !solveEditor.current || !x) return null;

    util.database.getMessages.setData(
      { exerciseId: exerciseId },
      (old = []) => {
        return [
          ...old,
          {
            chatId: Number(crypto.randomUUID()),
            chatContent:
              promptPrefix === "" ? x.value : promptPrefix + " " + x.value,
            sender: "user",
          },
        ];
      },
    );
    const value = x.value;
    x.value = "";
    return {
      problemString: JSON.stringify(problemEditor.current.getJSON()),
      solveString: JSON.stringify(solveEditor.current.getJSON()),
      editor: solveEditor.current,
      specification: value,
    };
  };

  const handleClick = (
    promptPrefix: "Solve the nextstep for me!" | "Solve the rest for me!",
    mutation: typeof nextstepMutation | typeof solverestMutation,
  ) => {
    const content = getContent(promptPrefix);
    if (!content) return;
    mutation.mutate(
      {
        problem: content.problemString,
        solve: content.solveString,
        specifications: content.specification,
        exerciseId: exerciseId,
        databaseMessage: promptPrefix,
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
          if (result.parsedData.length === 0) return;

          content.editor.setEditable(false);
          content.editor
            .chain()
            .focus()
            .insertContentAt(content.editor.state.doc.content.size, [
              {
                type: "ai-suggestion",
                content: result.parsedData,
              },
            ])
            .run();
        },
      },
    );
  };

  const handleChatClick = () => {
    const content = getContent("");
    if (!content) return;
    chatMutation.mutate(
      {
        problem: content.problemString,
        solve: content.solveString,
        specifications: content.specification,
        exerciseId: exerciseId,
      },
      {
        onSuccess: async (result) => {
          result.explanation.map((explanation) => {
            util.database.getMessages.setData(
              { exerciseId: exerciseId },

              (old = []) => {
                return [
                  ...old,
                  {
                    chatId: Number(crypto.randomUUID()),
                    chatContent: explanation,
                    sender: "ai",
                  },
                ];
              },
            );
          });
        },
      },
    );
  };

  return (
    <div className="flex h-[20%] w-full flex-col justify-end gap-4 p-4">
      <div className="flex w-full flex-row items-center justify-center gap-4">
        <Button onClick={handleChatClick} className="p-7 text-xl">
          {chatMutation.isPending ? <ThreeDot color="#d4d4d8" /> : "Chat"}
        </Button>

        <Button
          onClick={() =>
            handleClick("Solve the nextstep for me!", nextstepMutation)
          }
          className="p-7 text-xl"
        >
          {nextstepMutation.isPending ? (
            <ThreeDot color="#d4d4d8" />
          ) : (
            "Next step"
          )}
        </Button>
        <Button
          onClick={() =>
            handleClick("Solve the rest for me!", solverestMutation)
          }
          className="p-7 text-xl"
        >
          {solverestMutation.isPending ? (
            <ThreeDot color="#d4d4d8" />
          ) : (
            "Solve rest"
          )}
        </Button>
      </div>
      <div className="jusitfy-between bg-primaryBg flex w-full flex-row items-center rounded border-1 border-teal-950">
        <Textarea
          placeholder="Give context or just Chat..."
          ref={textareaRef}
          className="focus:border-noen resize-none overflow-auto border-none focus:border-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
