"use client";
import React, { useState } from "react";

import MathMode from "./mathmode";
import ChatMode from "./chatmode";
import { api, type RouterInputs } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { useExerciseId } from "@/lib/context/ExerciseIdContext";
import { useEditorContent } from "@/hooks/useEditorContent";
import { ContentAndExplenationToParagraphs } from "@/lib/utils";
import {
  onData,
  onStarted,
} from "@/lib/subscriptionClientHelpers/contentAndExplanation";
import { onStartedJustChat } from "@/lib/subscriptionClientHelpers/justchat";

export default function AiInteraction({
  isOverTokenLimit,
}: {
  isOverTokenLimit: boolean;
}) {
  const [nextInput, setNextInput] = useState<
    RouterInputs["ai"]["nextstep"] | null
  >(null);
  const [restInput, setRestInput] = useState<
    RouterInputs["ai"]["solverest"] | null
  >(null);
  const [customInput, setCustomInput] = useState<
    RouterInputs["ai"]["customMessage"] | null
  >(null);
  const [chatInput, setChatInput] = useState<
    RouterInputs["ai"]["justChat"] | null
  >(null);
  const [isMathMode, setIsMathMode] = useState<boolean>(true);
  const exerciseId = useExerciseId();
  const util = api.useUtils();
  const content = useEditorContent();
  const nextStepSubscription = api.ai.nextstep.useSubscription(
    nextInput ?? skipToken,
    {
      onStarted: () => {
        if (!content) return;
        onStarted(content.editor);
      },
      onData: (data) => {
        if (!content) return;
        onData(exerciseId, data, content.editor, util);
      },
      onComplete: () => {
        util.database.getTokenInformation.invalidate();
        setNextInput(null);
      },
    },
  );
  const solverestSubscription = api.ai.solverest.useSubscription(
    restInput ?? skipToken,
    {
      onStarted: () => {
        if (!content) return;
        onStarted(content.editor);
      },
      onData: (data) => {
        if (!content) return;
        onData(exerciseId, data, content.editor, util);
      },
      onComplete: () => {
        util.database.getTokenInformation.invalidate();
        setRestInput(null);
      },
    },
  );
  const customMessageSubscription = api.ai.customMessage.useSubscription(
    customInput ?? skipToken,
    {
      onStarted: () => {
        if (!content) return;
        onStarted(content.editor);
      },
      onData: (data) => {
        if (!content) return;
        onData(exerciseId, data, content.editor, util);
      },
      onComplete: () => {
        util.database.getTokenInformation.invalidate();
        setCustomInput(null);
      },
    },
  );
  const chatSubscription = api.ai.justChat.useSubscription(
    chatInput ?? skipToken,
    {
      onData: (data) => {
        if (!content) return;
        onStartedJustChat(exerciseId, data, util);
      },
      onComplete: () => {
        util.database.getTokenInformation.invalidate();
        setChatInput(null);
      },
    },
  );

  const isPending = !!(nextInput || restInput || customInput || chatInput);

  const [isAiSuggestion, setIsAiSuggestion] = useState<boolean>(false);
  return (
    <div className="flex h-[20%] w-full flex-col items-center justify-center p-1">
      <div className="flex h-1/4 w-full flex-row justify-evenly rounded border-1 border-teal-950">
        <button
          className={`w-1/2 border-r-1 border-teal-950 pt-2 pb-2 pl-2 ${isMathMode ? "bg-primaryBg" : ""}`}
          onClick={() => setIsMathMode(true)}
        >
          Math mode
        </button>
        <button
          className={`w-1/2 border-l-1 border-teal-950 pt-2 pr-2 pb-2 ${!isMathMode ? "bg-primaryBg" : ""}`}
          onClick={() => setIsMathMode(false)}
        >
          Chat mode
        </button>
      </div>
      {isAiSuggestion && (
        <p className="text-red-500">
          Either decline or accept the ai suggestion.
        </p>
      )}
      <div className="flex h-3/4 w-9/10 items-center justify-center">
        {isMathMode ? (
          <MathMode
            setNextInput={setNextInput}
            setRestInput={setRestInput}
            setCustomInput={setCustomInput}
            nextPending={!!nextInput}
            restPending={!!restInput}
            customPending={!!customInput}
            isPending={isPending}
            isOver={isOverTokenLimit}
            setIsAiSuggestion={setIsAiSuggestion}
          />
        ) : (
          <ChatMode
            isPending={isPending}
            isOverTokenLimit={isOverTokenLimit}
            setIsAiSuggestion={setIsAiSuggestion}
            isChatInput={!!chatInput}
            setChatInput={setChatInput}
          />
        )}
      </div>
    </div>
  );
}
