"use client";
import { sendMessage } from "@/lib/functionality/message";
import { Textarea } from "@/components/ui/textarea";
import { useExerciseId } from "@/lib/context/ExerciseIdContext";
import { api } from "@/trpc/react";
import { useRef, useState } from "react";
import { useEditorContent } from "@/hooks/useEditorContent";
import { ArrowUp } from "lucide-react";
import { ThreeDot } from "react-loading-indicators";

export default function ChatMode({
  chatMutation,
  isPending,
}: {
  chatMutation: ReturnType<typeof api.ai.justChat.useMutation>;
  isPending: boolean;
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
    sendMessage("", value.value, exerciseId, util);

    chatMutation.mutate(
      {
        problem: content.problemString,
        solve: content.solveString,
        specifications: value.value,
        exerciseId: exerciseId,
      },
      {
        onSuccess: (result) => {
          const len = result.length - 1;
          util.database.getMessages.setData(
            { exerciseId: exerciseId },

            (old = []) => {
              return [...old, result[len]!];
            },
          );
        },
      },
    );
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
        <button
          onClick={handleChatClick}
          disabled={isPending}
          className="hover:bg-secondaryBg bg-primaryBg disabled:bg-secondaryBg m-1 rounded border-1 border-teal-950 p-1 disabled:text-inherit disabled:opacity-100"
        >
          {chatMutation.isPending ? <ThreeDot color="#d4d4d8" /> : <ArrowUp />}
        </button>
      </div>
    </div>
  );
}
