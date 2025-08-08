import {
  content,
  explanation,
  type ContentAndExplanation,
  type Explnanation,
} from "../utils";
import { z } from "zod";

export function makeContentAndExplanationParser(): (
  data: unknown,
) =>
  | { contentAndExplanation: ContentAndExplanation; prevMessageCount: number }
  | undefined {
  let prevExplanation: [string, ...string[]] = [""];
  let previousMessageCount = 0;
  return (parsed: unknown) => {
    const p = parsed as ContentAndExplanation | undefined;

    if (p?.explanation) {
      const e = p.explanation;
      const result = explanation.safeParse(e);
      if (result.success) {
        if (
          JSON.stringify(prevExplanation) !==
          JSON.stringify(result.data.paragraphs)
        ) {
          const textContent = " "; // there needs to be a space for tiptap.
          const holder = previousMessageCount;

          previousMessageCount = result.data.paragraphs.length;

          const contentAndExplanation: ContentAndExplanation = {
            explanation: result.data,
            content: { newline: [[{ type: "text", data: textContent }]] },
          };
          prevExplanation = result.data.paragraphs;
          return { contentAndExplanation, prevMessageCount: holder };
        }
      }
    }
    if (p?.content) {
      const c = p.content;
      const result = content.safeParse(c);

      if (result.success) {
        const contentAndExplanation: ContentAndExplanation = {
          explanation: { paragraphs: prevExplanation },
          content: result.data,
        };
        return {
          contentAndExplanation,
          prevMessageCount: previousMessageCount,
        };
      }
    }
  };
}

export function makeJustChatParser(): (
  data: unknown,
) => { explanation: Explnanation; prevMessageCount: number } | undefined {
  let previousMessageCount = 0;
  return (parsed: unknown) => {
    const p = parsed as Explnanation | undefined;
    if (p) {
      const result = explanation.safeParse(p);
      if (result.success) {
        const explanation: Explnanation = result.data;
        const holder = previousMessageCount;
        previousMessageCount = explanation.paragraphs.length;
        return { explanation, prevMessageCount: holder };
      }
    }
  };
}
