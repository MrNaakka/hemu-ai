import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const freeTokenLimit = 10000;
export const standardTokenLimit = 2000000;

export type Tier = "standard" | "free" | "custom";
export type Status = "active" | "inactive" | "canceled";

export type MathModeVariants =
  | "Solve the nextstep for me!"
  | "Solve the rest for me!"
  | "Custom message:";

const customImage = z.object({
  type: z.literal("custom-image"),
  attrs: z.object({
    id: z.string(),
    latex: z.string(),
  }),
});
const text = z.object({
  type: z.literal("text"),
  text: z.string().nonempty(),
});
const paragraph = z.object({
  type: z.literal("paragraph"),
  content: z.array(z.union([customImage, text])),
});
const paragraphs = z.array(paragraph);

const aiSuggestion = z.object({
  type: z.literal("ai-suggestion"),
  content: paragraphs,
});
const mathField = z.object({
  type: z.literal("mathfield"),
  id: z.string(),
  content: z.string(),
});
export const tipTapContent = z.object({
  type: z.literal("doc"),
  content: z.array(z.union([paragraph, aiSuggestion, mathField])).optional(),
});

const tipTapContentOnlyParagraph = z.object({
  type: z.literal("doc"),
  content: z.array(paragraph).optional(),
});

export type TipTapContentOnlyParagraph = z.infer<
  typeof tipTapContentOnlyParagraph
>;

export type TipTapContent = z.infer<typeof tipTapContent>;
export type Paragraphs = z.infer<typeof paragraphs>;

export const aiInputContent = z.object({
  // because the input doesn't have to as strict
  newline: z
    .array(
      z.array(
        z.discriminatedUnion("type", [
          z.object({ type: z.literal("text"), data: z.string() }),
          z.object({ type: z.literal("latex"), data: z.string() }),
        ]),
      ),
    )
    .optional(),
});
export const content = z.object({
  newline: z
    .array(
      z
        .array(
          z.discriminatedUnion("type", [
            z.object({ type: z.literal("text"), data: z.string().nonempty() }),
            z.object({ type: z.literal("latex"), data: z.string().nonempty() }),
          ]),
        )
        .nonempty(),
    )
    .nonempty(),
});

export const explanation = z.object({
  paragraphs: z.array(z.string().nonempty()).nonempty(),
});
export const contentAndExplanationSchema = z.object({
  explanation,
  content,
});
export type ContentAndExplanation = z.infer<typeof contentAndExplanationSchema>;
export type Content = z.infer<typeof content>;
export type AiInputContent = z.infer<typeof aiInputContent>;

export type Explnanation = z.infer<typeof explanation>;

export function isAiSuggestionInTipTapContent(content: TipTapContent): boolean {
  if (!content.content) return false;
  const find = content.content.find(
    (e) => e.type === "ai-suggestion" || e.type === "mathfield",
  );
  return find ? true : false;
}

export function ContentAndExplenationToParagraphs(
  data: ContentAndExplanation,
): Paragraphs {
  if (!data.content.newline) {
    return [
      {
        type: "paragraph",
        content: [],
      },
    ];
  }
  const parsedData: Paragraphs = data.content.newline.map((x) => ({
    type: "paragraph",
    content: x.map((y) => {
      if (y.type === "latex") {
        return {
          type: "custom-image",
          attrs: {
            id: crypto.randomUUID(),
            latex: y.data,
          },
        };
      }

      return {
        type: "text",
        text: y.data,
      };
    }),
  }));
  return parsedData;
}

export function TipTapContentToAiInputContent(
  data: TipTapContentOnlyParagraph,
): AiInputContent {
  if (!data.content) return {};
  const pHasContent = data.content.filter((p) => p.content);

  if (pHasContent.length === 0) return {};

  const result: AiInputContent = {
    newline: pHasContent.map((paragraph) => {
      return paragraph.content!.map((e) => {
        if (e.type === "custom-image") {
          return {
            type: "latex",
            data: e.attrs.latex,
          };
        }
        return {
          type: "text",
          data: e.text ?? "",
        };
      });
    }),
  };
  return result;
}
