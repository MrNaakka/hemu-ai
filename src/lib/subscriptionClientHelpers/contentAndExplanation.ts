import type { Editor } from "@tiptap/core";
import {
  ContentAndExplenationToParagraphs,
  type ContentAndExplanation,
} from "../utils";
import type { api, RouterOutputs } from "@/trpc/react";

export function onStarted(editor: Editor) {
  editor.setEditable(false);
  const end = editor.state.doc.content.size;
  editor
    .chain()
    .focus()
    .insertContentAt({ from: end, to: end }, [{ type: "paragraph" }])
    .run();
}

export function onData(
  exerciseId: string,
  {
    contentAndExplanation,
    prevMessageCount,
  }: { contentAndExplanation: ContentAndExplanation; prevMessageCount: number },
  editor: Editor,
  util: ReturnType<typeof api.useUtils>,
) {
  util.database.getMessages.setData({ exerciseId: exerciseId }, (old) => {
    if (!old) return;
    let i = 0;
    let dateNow = Date.now();
    const index = old.length - prevMessageCount;

    const newMessages: RouterOutputs["database"]["getMessages"] =
      contentAndExplanation.explanation.paragraphs.map((p) => {
        i++;
        return {
          chatId: dateNow + i,
          chatContent: p,
          sender: "ai",
        };
      });
    return [...old.slice(0, index), ...newMessages];
  });

  const parsedData = ContentAndExplenationToParagraphs(contentAndExplanation);
  const { state } = editor;
  const doc = state.doc;

  const lastNode = doc.lastChild;
  const lastNodePos = doc.content.size - (lastNode?.nodeSize ?? 0);
  editor
    .chain()
    .focus()
    .insertContentAt(
      { from: lastNodePos, to: doc.content.size },
      {
        type: "ai-suggestion",
        content: parsedData,
      },
    )
    .run();
}
