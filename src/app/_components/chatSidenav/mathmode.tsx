"use client";

import { api } from "@/trpc/react";
import { useExerciseId } from "@/lib/context/ExerciseIdContext";
import { ThreeDot } from "react-loading-indicators";
import { sendMessage } from "@/lib/functionality/message";
import { useEditorContent } from "@/hooks/useEditorContent";
import {
  Dialog,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { Paragraphs } from "@/lib/utils";

type NextStepMutation = ReturnType<typeof api.ai.nextstep.useMutation>;
type SolveRestMutation = ReturnType<typeof api.ai.solverest.useMutation>;
type CustomMessageMutation = ReturnType<
  typeof api.ai.customMessage.useMutation
>;

// 2) Use those in your props interface:
interface MathModeProps {
  nextstepMutation: NextStepMutation;
  solverestMutation: SolveRestMutation;
  customMessageMutation: CustomMessageMutation;
  isPending: boolean;
}

export default function MathMode({
  nextstepMutation,
  solverestMutation,
  customMessageMutation,
  isPending,
}: MathModeProps) {
  const { data, isFetching, refetch } = api.database.getCustomMessages.useQuery(
    undefined,
    { enabled: false },
  );

  const exerciseId = useExerciseId();
  const util = api.useUtils();
  const content = useEditorContent();
  const helper = (result: { explanation: string; parsedData: Paragraphs }) => {
    if (!content) return;

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
  };

  const handlePredefinedClick = (
    promptPrefix: "Solve the nextstep for me!" | "Solve the rest for me!" | "",
    mutation: typeof nextstepMutation | typeof solverestMutation,
  ) => {
    if (!content) return;
    sendMessage(promptPrefix, "", exerciseId, util);
    mutation.mutate(
      {
        problem: content.problemString,
        solve: content.solveString,
        specifications: "",
        exerciseId: exerciseId,
        databaseMessage: promptPrefix,
      },
      {
        onSuccess: async (result) => {
          helper(result);
        },
      },
    );
  };
  const handleCustomClick = (customMessage: string) => {
    if (!content) return;
    sendMessage("Custom message:", customMessage, exerciseId, util);
    customMessageMutation.mutate(
      {
        problem: content.problemString,
        solve: content.solveString,
        customMessage: customMessage,
        exerciseId: exerciseId,
      },
      {
        onSuccess: async (result) => {
          helper(result);
        },
      },
    );
  };
  const [open, setOpen] = useState<boolean>(false);
  const textAreaRef = useRef<null | HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textAreaRef.current) return;
    const textContent = textAreaRef.current.value;
    if (textContent === "") {
      return;
    }
    handleCustomClick(textContent);
    setOpen(false);
  };

  const handleOldMessageClick = (content: string) => {
    if (!textAreaRef.current) return;
    textAreaRef.current.value = content;
    return;
  };
  return (
    <div className="flex h-9/10 w-full flex-row items-center justify-center rounded border-1 border-teal-950">
      <button
        onClick={() =>
          handlePredefinedClick("Solve the nextstep for me!", nextstepMutation)
        }
        disabled={isPending}
        className="bg-primaryBg text-bold hover:bg-secondaryBg h-full w-1/3 rounded border-r-1 border-teal-950 p-1 text-xl disabled:bg-inherit disabled:text-inherit disabled:opacity-100"
      >
        {nextstepMutation.isPending ? (
          <ThreeDot color="#d4d4d8" />
        ) : (
          "Next step"
        )}
      </button>
      <button
        onClick={() =>
          handlePredefinedClick("Solve the rest for me!", solverestMutation)
        }
        disabled={isPending}
        className="bg-primaryBg text-bold hover:bg-secondaryBg h-full w-1/3 border-r-1 border-l-1 border-teal-950 p-1 text-xl disabled:bg-inherit disabled:text-inherit disabled:opacity-100"
      >
        {solverestMutation.isPending ? (
          <ThreeDot color="#d4d4d8" />
        ) : (
          "Solve rest"
        )}
      </button>
      <Dialog
        open={open}
        onOpenChange={async (x) => {
          setOpen(x);
          if (x) {
            await refetch();
          }
        }}
      >
        <DialogTrigger asChild>
          <button
            disabled={isPending}
            className="bg-primaryBg text-bold hover:bg-secondaryBg h-full w-1/3 rounded border-l-1 border-teal-950 p-1 text-xl disabled:bg-inherit disabled:text-inherit disabled:opacity-100"
          >
            {customMessageMutation.isPending ? (
              <ThreeDot color="#d4d4d8" />
            ) : (
              "Custom"
            )}
          </button>
        </DialogTrigger>
        <DialogContent className="bg-primaryBg flex h-2/3 w-2/3 !max-w-none border-1 border-black">
          <div className="flex h-full w-2/3 flex-col items-center justify-between">
            <DialogTitle className="flex h-1/10 w-9/10 items-center pl-3 text-2xl!">
              Custom Mathmode Message
            </DialogTitle>
            <form
              onSubmit={handleSubmit}
              className="flex h-9/10 w-9/10 flex-col items-center border border-teal-950"
            >
              <Textarea
                placeholder="Create your own custom mathmode message for hemu-ai!"
                className="focus:border-noen h-4/5 w-full resize-none overflow-auto overflow-y-auto border-none focus:border-none focus-visible:ring-0"
                required
                ref={textAreaRef}
              />
              <div className="flex h-1/5 w-full flex-row items-center justify-evenly">
                <DialogClose asChild>
                  <Button className="w-1/4 text-xl" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button className="w-1/4 text-xl" type="submit">
                  Send
                </Button>
              </div>
            </form>
          </div>
          <div className="flex h-full w-1/3 flex-col items-center justify-between">
            <DialogTitle className="flex h-1/10 w-9/10 items-center pl-3">
              Previous Messages
            </DialogTitle>
            <ScrollArea className="flex h-9/10 w-9/10 flex-col items-center rounded border border-teal-950">
              {isFetching ? (
                <Skeleton className="h-1000 w-1000 bg-[#232b26]" />
              ) : data ? (
                <div className="p-4">
                  {data.map((element) => {
                    console.log(element.content);
                    return (
                      <React.Fragment key={element.id}>
                        <button
                          onClick={() => handleOldMessageClick(element.content)}
                          className="hover:bg-secondaryBg w-full rounded p-1 text-start"
                        >
                          {element.content.slice(0, 15)}...
                        </button>
                        <Separator className="mt-1 mb-1 bg-teal-950" />
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                <></>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
