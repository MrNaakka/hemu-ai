"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor, JSONContent } from "@tiptap/react";
import type { RefObject } from "react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import mathfieldExtension from "./tiptap/extensions/mathfieldExtension";
import customImageExtension from "./tiptap/extensions/customImageExtension";
import customKeyMapExtension from "./tiptap/extensions/customKeyMapExtension";
import { api } from "@/trpc/react";
import aiSuggestionExtension from "./tiptap/extensions/aiSuggestionExtension";
import type { MathField } from "@digabi/mathquill";
import { removeSrcFromContent, type TipTapContent } from "@/lib/utils";

export default function Tiptap({
  editorRef,
  className,
  placeHolder,
  startContent,
  exerciseId,
  textEditorType,
  setIsTextFocused,
  setIsMathfieldFocused,
  mathfieldRef,
}: {
  editorRef: RefObject<Editor | null>;
  className?: string;
  placeHolder: string;
  startContent: JSONContent;
  exerciseId: string;
  textEditorType: "problem" | "solve";
  setIsTextFocused: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMathfieldFocused: React.Dispatch<React.SetStateAction<boolean>>;
  mathfieldRef: RefObject<MathField | null>;
}) {
  const updateContentMutation =
    api.database.updateExerciseContent.useMutation();

  const editor = useEditor({
    extensions: [
      StarterKit,
      mathfieldExtension.configure({
        setIsFocused: setIsMathfieldFocused,
        mathfieldRef: mathfieldRef,
      }),
      customImageExtension,
      customKeyMapExtension,
      Placeholder.configure({
        placeholder: placeHolder,
      }),
      aiSuggestionExtension,
    ],
    content: startContent,
    immediatelyRender: false,
    onCreate(props) {
      editorRef.current = props.editor;
    },
    editorProps: {
      attributes: {
        class: "tiptap p-4 focus:outline-none focus:ring-0 flex-1 h-full",
      },
      handleDOMEvents: {
        focus: () => {
          setIsTextFocused(true);
        },
        blur: () => {
          setIsTextFocused(false);
          if (editorRef.current) {
            const content = editorRef.current.getJSON() as TipTapContent;
            const removedSrcContent = removeSrcFromContent(content);
            const contentAsString = JSON.stringify(removedSrcContent);
            updateContentMutation.mutate({
              newContent: contentAsString,
              editor: textEditorType,
              exercisesId: exerciseId,
            });
          }

          return false;
        },
      },
    },
  });

  return (
    <>
      <EditorContent
        className={`border-secondaryBg overflow-auto rounded border-1 text-white ${className}`}
        editor={editor}
      />
    </>
  );
}
