"use client";
import { sendMessage } from "@/lib/functionality/message";
import { Textarea } from "@/components/ui/textarea";
import { useExerciseId } from "@/lib/context/ExerciseIdContext";
import { api } from "@/trpc/react";
import { useRef, useState } from "react";
import { useEditorContent } from "@/hooks/useEditorContent";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

export default function ChatMode() {
  const [emptyChat, setEmptyChat] = useState<boolean>(false);
  const chatMutation = api.ai.justChat.useMutation();

  const util = api.useUtils();
  const isPending = chatMutation.isPending;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const exerciseId = useExerciseId();

  const handleChatClick = () => {
    const value = textareaRef.current;

    if (!value || value.value.trim() === "") {
      setEmptyChat(true);
      return;
    }
    const content = useEditorContent();
    if (!content) return;
    sendMessage("", value.value, exerciseId, util);
    value.value = "";

    chatMutation.mutate(
      {
        problem: content.problemString,
        solve: content.solveString,
        specifications: value.value,
        exerciseId: exerciseId,
      },
      {
        onSuccess: async (result) => {
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
  };
  return (
    <div className="w-full bg-red-200">
      <span className="text-center text-red-500">
        {emptyChat ? "You cannot send an empty chat!" : ""}
      </span>
      <div className="jusitfy-between bg-primaryBg flex w-full flex-row items-center rounded border-1 border-teal-950">
        <Textarea
          placeholder="Ask anything math related. It already has the full context!"
          ref={textareaRef}
          className="focus:border-noen resize-none overflow-auto overflow-y-auto border-none focus:border-none focus-visible:ring-0"
        />

        <ArrowUp
          className="hover:bg-secondaryBg m-1 rounded border-1 border-teal-950 p-1"
          size={30}
        />

        {/* <Button asChild>
          <ArrowUp />
        </Button> */}
      </div>
    </div>
  );
}
