"use client";
import { sendMessage } from "@/lib/functionality/message";
import { Textarea } from "@/components/ui/textarea";
import { useExerciseId } from "@/lib/context/ExerciseIdContext";
import { api, type RouterInputs } from "@/trpc/react";
import React, { useRef, useState } from "react";
import { useEditorContent } from "@/hooks/useEditorContent";
import { ArrowUp } from "lucide-react";
import { ThreeDot } from "react-loading-indicators";
import ConditionalTooltip from "./conditionalTooltip";
import TokenTooltipContent from "./tokenTooltipContent";
import {
  isAiSuggestionInTipTapContent,
  TipTapContentToAiInputContent,
  type TipTapContentOnlyParagraph,
} from "@/lib/utils";

export default function ChatMode({
  isPending,
  isOverTokenLimit,
  setIsAiSuggestion,
  isChatInput,
  setChatInput,
}: {
  isPending: boolean;
  isChatInput: boolean;
  setChatInput: React.Dispatch<
    React.SetStateAction<RouterInputs["ai"]["justChat"] | null>
  >;
  isOverTokenLimit: boolean;
  setIsAiSuggestion: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [emptyChat, setEmptyChat] = useState<boolean>(false);

  const util = api.useUtils();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const exerciseId = useExerciseId();
  const content = useEditorContent();

  const handleChatClick = () => {
    const value = textareaRef.current;

    if (!value || value.value.trim() === "") {
      setEmptyChat(true);
      return;
    }
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

    sendMessage("", value.value, exerciseId, util);
    setChatInput({
      exerciseId: exerciseId,
      problem: JSON.stringify(pContent),
      solve: JSON.stringify(sContent),
      specifications: value.value,
    });

    value.value = "";
  };
  return (
    <div className="h-9/10 w-full">
      <span className="text-center text-red-500">
        {emptyChat ? "You cannot send an empty chat!" : ""}
      </span>
      <div className="bg-primaryBg flex h-full w-full flex-row items-center justify-between rounded border-1 border-teal-950">
        <Textarea
          placeholder="Ask anything math related. It already has the full context!"
          ref={textareaRef}
          className="focus:border-noen h-full resize-none overflow-auto overflow-y-auto border-none focus:border-none focus-visible:ring-0"
        />
        <ConditionalTooltip
          condition={isOverTokenLimit}
          tooltipContent={<TokenTooltipContent />}
        >
          <button
            onClick={handleChatClick}
            disabled={isPending || isOverTokenLimit}
            className="hover:bg-secondaryBg bg-primaryBg disabled:bg-secondaryBg m-1 rounded border-1 border-teal-950 p-1 disabled:text-inherit disabled:opacity-100"
          >
            {isChatInput ? <ThreeDot color="#d4d4d8" /> : <ArrowUp />}
          </button>
        </ConditionalTooltip>
      </div>
    </div>
  );
}
