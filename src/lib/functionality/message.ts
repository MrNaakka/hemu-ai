import type { api } from "@/trpc/react";
import type { MathModeVariants } from "../utils";

export function sendMessage(
  promptPrefix: MathModeVariants | "",
  message: string,
  exerciseId: string,
  util: ReturnType<typeof api.useUtils>,
) {
  util.database.getMessages.setData({ exerciseId: exerciseId }, (old = []) => {
    return [
      ...old,
      {
        chatId: old.length + 1,
        chatContent:
          promptPrefix === "" ? message : promptPrefix + " " + message,
        sender: "user",
      },
    ];
  });
}
