"use client";
import React, { useState } from "react";

import MathMode from "./mathmode";
import ChatMode from "./chatmode";
import { api } from "@/trpc/react";

export default function AiInteraction({ isOver }: { isOver: boolean }) {
  const [isMathMode, setIsMathMode] = useState<boolean>(true);
  const nextstepMutation = api.ai.nextstep.useMutation();
  const solverestMutation = api.ai.solverest.useMutation();
  const customMessageMutation = api.ai.customMessage.useMutation();
  const chatMutation = api.ai.justChat.useMutation();
  const isPending =
    chatMutation.isPending ||
    nextstepMutation.isPending ||
    solverestMutation.isPending ||
    customMessageMutation.isPending;

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
            nextstepMutation={nextstepMutation}
            solverestMutation={solverestMutation}
            customMessageMutation={customMessageMutation}
            isPending={isPending}
            isOver={isOver}
            setIsAiSuggestion={setIsAiSuggestion}
          />
        ) : (
          <ChatMode
            chatMutation={chatMutation}
            isPending={isPending}
            isOver={isOver}
            setIsAiSuggestion={setIsAiSuggestion}
          />
        )}
      </div>
    </div>
  );
}
