import type { api } from "@/trpc/react";

export function sendMessage(
  promptPrefix: "Solve the nextstep for me!" | "Solve the rest for me!" | "",
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
