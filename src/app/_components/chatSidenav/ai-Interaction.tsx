"use client";
import React, { useState } from "react";

import MathMode from "./mathmode";
import ChatMode from "./chatmode";
export default function AiInteraction({}: {}) {
  const [isMathMode, setIsMathMode] = useState<boolean>(true);

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
      <div className="flex h-3/4 w-9/10 items-center justify-center">
        {isMathMode ? <MathMode /> : <ChatMode />}
      </div>
    </div>
  );
}
