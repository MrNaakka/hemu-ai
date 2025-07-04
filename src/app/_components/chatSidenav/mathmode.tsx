"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useExerciseId } from "@/lib/context/ExerciseIdContext";
import { useProblemEditor, useSolveEditor } from "@/lib/context/editorContext";
import { removeSrcFromContent, type TipTapContent } from "@/lib/utils";
import { ThreeDot } from "react-loading-indicators";
import { sendMessage } from "@/lib/functionality/message";
import { useEditorContent } from "@/hooks/useEditorContent";

export default function MathMode() {
  const nextstepMutation = api.ai.nextstep.useMutation();
  const solverestMutation = api.ai.solverest.useMutation();

  const isPending = nextstepMutation.isPending || solverestMutation.isPending;
  const exerciseId = useExerciseId();
  const util = api.useUtils();

  const handleClick = (
    promptPrefix: "Solve the nextstep for me!" | "Solve the rest for me!",
    mutation: typeof nextstepMutation | typeof solverestMutation,
  ) => {
    const content = useEditorContent();
    if (!content) return;
    sendMessage(promptPrefix, "", exerciseId, util);
    if (!content) return;
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

  return (
    <div className="flex w-full flex-row items-center justify-center gap-4">
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
        onClick={() => handleClick("Solve the rest for me!", solverestMutation)}
        disabled={isPending}
        className="p-7 text-xl disabled:bg-inherit disabled:text-inherit disabled:opacity-100"
      >
        {solverestMutation.isPending ? (
          <ThreeDot color="#d4d4d8" />
        ) : (
          "Solve rest"
        )}
      </Button>
      <Button
        // onClick={handleChatClick}
        // disabled={isPending}
        className="p-7 text-xl disabled:bg-inherit disabled:text-inherit disabled:opacity-100"
      >
        {/* {chatMutation.isPending ? <ThreeDot color="#d4d4d8" /> : "Custom"} */}
        Custom
      </Button>
    </div>
  );
}
