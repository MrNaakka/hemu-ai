"use client";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import { type RefObject } from "react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import mathfieldExtension from "./tiptap/extensions/mathfieldExtension";
import customImageExtension from "./tiptap/extensions/customImageExtension";
import customKeyMapExtension from "./tiptap/extensions/customKeyMapExtension";
import { api } from "@/trpc/react";
import aiSuggestionExtension from "./tiptap/extensions/aiSuggestionExtension";
import type { MathField } from "@digabi/mathquill";
import { useProblemEditor, useSolveEditor } from "@/lib/context/editorContext";
import { useExerciseId } from "@/lib/context/ExerciseIdContext";
import type { TipTapContent } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Tiptap({
  className,
  placeHolder,
  textEditorType,
  setIsTextFocused,
  setIsMathfieldFocused,
  mathfieldRef,
  initialContent,
}: {
  className?: string;
  placeHolder: string;
  textEditorType: "problem" | "solve";
  setIsTextFocused: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMathfieldFocused: React.Dispatch<React.SetStateAction<boolean>>;
  mathfieldRef: RefObject<MathField | null>;
  initialContent: JSONContent;
}) {
  const updateContentMutation =
    api.database.updateExerciseContent.useMutation();
  const exerciseId = useExerciseId();

  const problemEditor = useProblemEditor();
  const solveEditor = useSolveEditor();

  const editorRef = textEditorType === "problem" ? problemEditor : solveEditor;
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
    content: initialContent,
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
            const contentAsString = JSON.stringify(content);
            updateContentMutation.mutate({
              newContent: contentAsString,
              editor: textEditorType,
              exerciseId: exerciseId,
            });
          }

          return false;
        },
      },
    },
  });

  return (
    <EditorContent
      className={`overflow-auto rounded border-2 border-teal-700 text-white ${className}`}
      editor={editor}
    />
  );
}
