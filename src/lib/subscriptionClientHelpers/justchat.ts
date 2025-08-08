import type { api, RouterOutputs } from "@/trpc/react";
import type { Explnanation } from "../utils";

export function onStartedJustChat(
  exerciseId: string,
  {
    explanation,
    prevMessageCount,
  }: { explanation: Explnanation; prevMessageCount: number },

  util: ReturnType<typeof api.useUtils>,
) {
  util.database.getMessages.setData({ exerciseId: exerciseId }, (old) => {
    if (!old) return;
    let i = 0;
    let dateNow = Date.now();
    const index = old.length - prevMessageCount;

    const newMessages: RouterOutputs["database"]["getMessages"] =
      explanation.paragraphs.map((p) => {
        i++;
        return {
          chatId: dateNow + i,
          chatContent: p,
          sender: "ai",
        };
      });
    return [...old.slice(0, index), ...newMessages];
  });
}
