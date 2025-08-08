"use client";

import { api, type RouterInputs } from "@/trpc/react";
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
import {
  isAiSuggestionInTipTapContent,
  TipTapContentToAiInputContent,
  type MathModeVariants,
  type Paragraphs,
  type TipTapContentOnlyParagraph,
} from "@/lib/utils";
import ConditionalTooltip from "./conditionalTooltip";
import TokenTooltipContent from "./tokenTooltipContent";

interface MathModeProps {
  isPending: boolean;
  isOver: boolean;
  setIsAiSuggestion: React.Dispatch<React.SetStateAction<boolean>>;
  setNextInput: React.Dispatch<
    React.SetStateAction<null | RouterInputs["ai"]["nextstep"]>
  >;
  setRestInput: React.Dispatch<
    React.SetStateAction<null | RouterInputs["ai"]["solverest"]>
  >;
  setCustomInput: React.Dispatch<
    React.SetStateAction<null | RouterInputs["ai"]["customMessage"]>
  >;
  nextPending: boolean;
  restPending: boolean;
  customPending: boolean;
}

export default function MathMode({
  nextPending,
  restPending,
  customPending,
  setNextInput,
  setRestInput,
  setCustomInput,
  isPending,
  isOver,
  setIsAiSuggestion,
}: MathModeProps) {
  const { data, isFetching, refetch } = api.database.getCustomMessages.useQuery(
    undefined,
    { enabled: false },
  );

  const exerciseId = useExerciseId();
  const util = api.useUtils();
  const content = useEditorContent();

  const handlePredefinedClick = (
    messagePrefix: MathModeVariants,
    customMessage?: string,
  ) => {
    if (!content) return;
    const check = isAiSuggestionInTipTapContent(content.solve);
    if (check) {
      setIsAiSuggestion(true);
      return;
    }

    setIsAiSuggestion(false);

    const pContent = TipTapContentToAiInputContent(
      content.problem as TipTapContentOnlyParagraph,
    );
    const sContent = TipTapContentToAiInputContent(
      content.solve as TipTapContentOnlyParagraph,
    );

    sendMessage(messagePrefix, customMessage ?? "", exerciseId, util);

    if (messagePrefix === "Solve the nextstep for me!") {
      setNextInput({
        exerciseId: exerciseId,

        problem: JSON.stringify(pContent),
        solve: JSON.stringify(sContent),
      });
      return;
    }
    if (messagePrefix === "Solve the rest for me!") {
      setRestInput({
        exerciseId: exerciseId,

        problem: JSON.stringify(pContent),
        solve: JSON.stringify(sContent),
      });
      return;
    }
    setCustomInput({
      exerciseId: exerciseId,
      problem: JSON.stringify(pContent),
      solve: JSON.stringify(sContent),
      specifications: customMessage ?? "",
    });
  };

  const [open, setOpen] = useState<boolean>(false);
  const textAreaRef = useRef<null | HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textAreaRef.current) return;
    if (!content) return;

    const check = isAiSuggestionInTipTapContent(content.solve);
    if (check) {
      setIsAiSuggestion(true);
      return;
    }

    setIsAiSuggestion(false);
    const textContent = textAreaRef.current.value;
    if (textContent === "") {
      return;
    }
    handlePredefinedClick("Custom message:", textContent);
    setOpen(false);
  };

  const handleOldMessageClick = (content: string) => {
    if (!textAreaRef.current) return;
    textAreaRef.current.value = content;
    return;
  };
  return (
    <div className="flex h-9/10 w-full flex-row items-center justify-center rounded border-1 border-teal-950">
      <ConditionalTooltip
        condition={isOver}
        tooltipContent={<TokenTooltipContent />}
      >
        <button
          onClick={() => handlePredefinedClick("Solve the nextstep for me!")}
          disabled={isPending || isOver}
          className="bg-primaryBg text-bold hover:bg-secondaryBg h-full w-1/3 rounded border-r-1 border-teal-950 p-1 text-xl disabled:bg-inherit disabled:text-inherit disabled:opacity-100"
        >
          {nextPending ? <ThreeDot color="#d4d4d8" /> : "Next step"}
        </button>
      </ConditionalTooltip>
      <ConditionalTooltip
        condition={isOver}
        tooltipContent={<TokenTooltipContent />}
      >
        <button
          onClick={() => handlePredefinedClick("Solve the rest for me!")}
          disabled={isPending || isOver}
          className="bg-primaryBg text-bold hover:bg-secondaryBg h-full w-1/3 border-r-1 border-l-1 border-teal-950 p-1 text-xl disabled:bg-inherit disabled:text-inherit disabled:opacity-100"
        >
          {restPending ? <ThreeDot color="#d4d4d8" /> : "Solve rest"}
        </button>
      </ConditionalTooltip>

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
          <ConditionalTooltip
            condition={isOver}
            tooltipContent={<TokenTooltipContent />}
          >
            <button
              disabled={isPending || isOver}
              onClick={() => {
                if (!(isPending || isOver)) {
                  setOpen(true);
                }
              }}
              className="bg-primaryBg text-bold hover:bg-secondaryBg h-full w-1/3 rounded border-l-1 border-teal-950 p-1 text-xl disabled:bg-inherit disabled:text-inherit disabled:opacity-100"
            >
              {customPending ? <ThreeDot color="#d4d4d8" /> : "Custom"}
            </button>
          </ConditionalTooltip>
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
