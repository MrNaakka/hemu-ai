"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import React, { useRef, type RefObject, useState } from "react";
import type { Editor } from "@tiptap/core";
import { ThreeDot } from "react-loading-indicators";
import { removeSrcFromContent, type TipTapContent } from "@/lib/utils";
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

  const [emptyChat, setEmptyChat] = useState<boolean>(false);
  const nextstepMutation = api.ai.nextstep.useMutation();
  const solverestMutation = api.ai.solverest.useMutation();
  const chatMutation = api.ai.justChat.useMutation();

  const util = api.useUtils();

  const isPending =
    nextstepMutation.isPending ||
    solverestMutation.isPending ||
    chatMutation.isPending;

  const getContent = () => {
    // for ts
    const x = textareaRef.current;
    if (!problemEditor.current || !solveEditor.current || !x) return null;
    const value = x.value;
    const problemContent = problemEditor.current.getJSON() as TipTapContent;
    const noSrcProblemContent = removeSrcFromContent(problemContent);
    const solveContent = problemEditor.current.getJSON() as TipTapContent;
    const noSrcSolveContent = removeSrcFromContent(solveContent);

    return {
      problemString: JSON.stringify(noSrcProblemContent),
      solveString: JSON.stringify(noSrcSolveContent),
      editor: solveEditor.current,
      specification: value,
    };
  };

  const setMessage = (
    promptPrefix: "Solve the nextstep for me!" | "Solve the rest for me!" | "",
  ) => {
    const x = textareaRef.current;
    if (!x) return null;
    setEmptyChat(false);
    util.database.getMessages.setData(
      { exerciseId: exerciseId },

      (old = []) => {
        return [
          ...old,
          {
            chatId: old.length + 1,
            chatContent:
              promptPrefix === "" ? x.value : promptPrefix + " " + x.value,
            sender: "user",
          },
        ];
      },
    );
    x.value = "";
  };

  const handleClick = (
    promptPrefix: "Solve the nextstep for me!" | "Solve the rest for me!",
    mutation: typeof nextstepMutation | typeof solverestMutation,
  ) => {
    const content = getContent();
    setMessage(promptPrefix);

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
    const value = textareaRef.current;
    console.log(`tässä on value:${value?.value}`);
    if (!value || value.value.trim() === "") {
      setEmptyChat(true);
      return;
    }
    const content = getContent();
    setMessage("");
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
          const len = result.length - 1;
          util.database.getMessages.setData(
            { exerciseId: exerciseId },

            (old = []) => {
              return [
                ...old,
                {
                  chatId: result[len]!.chatId,
                  chatContent: result[len]!.chatContent,
                  sender: result[len]!.sender,
                },
              ];
            },
          );
        },
      },
    );
  };

  return (
    <div className="flex h-[20%] w-full flex-col justify-end gap-4 p-4">
      <div className="flex w-full flex-row items-center justify-center gap-4">
        <Button
          onClick={handleChatClick}
          className="p-7 text-xl disabled:bg-inherit disabled:text-inherit disabled:opacity-100"
          disabled={isPending}
        >
          {chatMutation.isPending ? <ThreeDot color="#d4d4d8" /> : "Chat"}
        </Button>

        <Button
          onClick={() =>
            handleClick("Solve the nextstep for me!", nextstepMutation)
          }
          disabled={isPending}
          className="p-7 text-xl disabled:bg-inherit disabled:text-inherit disabled:opacity-100"
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
          className="p-7 text-xl disabled:bg-inherit disabled:text-inherit disabled:opacity-100"
          disabled={isPending}
        >
          {solverestMutation.isPending ? (
            <ThreeDot color="#d4d4d8" />
          ) : (
            "Solve rest"
          )}
        </Button>
      </div>
      <span className="text-center text-red-500">
        {emptyChat ? "You cannot send an empty chat!" : ""}
      </span>
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
