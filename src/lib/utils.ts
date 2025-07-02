import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import TeXToSVG from "tex-to-svg";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const customImage = z.object({
  type: z.literal("custom-image"),
  attrs: z.object({
    src: z.string(),
    id: z.string(),
    latex: z.string(),
  }),
});
const text = z.object({
  type: z.literal("text"),
  text: z.string(),
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
const tipTapContent = z.object({
  type: z.literal("doc"),
  content: z.array(z.union([paragraph, aiSuggestion, mathField])),
});

export type TipTapContent = z.infer<typeof tipTapContent>;
export type Paragraphs = z.infer<typeof paragraphs>;

// type CustomImage = {
//   type: "custom-image";
//   attrs: {
//     src: string;
//     id: string;
//     latex: string;
//   };
// };
// type Text = {
//   type: "text";
//   text: string;
// };
// export type Paragraphs = {
//   type: "paragraph";
//   content: (CustomImage | Text)[];
// }[];
// type AiSuggestion = {
//   type: "ai-suggestion";
//   content: Paragraphs;
// };
// type MathField = {
//   type: "mathfield";
//   id: string;
//   content: string;
// };

// export type TipTapContent = {
//   type: "doc";
//   content: (Paragraphs | AiSuggestion | MathField)[];
// };

export function removeSrcFromContent(content: TipTapContent): TipTapContent {
  return {
    type: "doc",
    content: content.content.map((element) => {
      if (element.type === "paragraph") {
        return {
          ...element,
          content: element.content.map((x) => {
            if (x.type === "custom-image") {
              return { ...x, attrs: { ...x.attrs, src: "" } };
            } else {
              return x;
            }
          }),
        };
      } else {
        return element;
      }
    }),
  };
}

export function addSrcToContent(content: TipTapContent): TipTapContent {
  return {
    type: "doc",
    content: content.content.map((element) => {
      if (element.type === "paragraph") {
        return {
          ...element,
          content: element.content.map((x) => {
            if (x.type === "custom-image") {
              const svg = TeXToSVG(x.attrs.latex).replace(
                /fill="currentColor"/g,
                'fill="white"',
              );
              return {
                ...x,
                attrs: {
                  ...x.attrs,
                  src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
                },
              };
            } else {
              return x;
            }
          }),
        };
      } else {
        return element;
      }
    }),
  };
}
