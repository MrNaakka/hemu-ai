"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor, JSONContent } from "@tiptap/react";
import type { RefObject } from "react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import { useEffect } from "react";
import mathfieldExtension from "./tiptap/extensions/mathfieldExtension";
import customImageExtension from "./tiptap/extensions/customImageExtension";
import customKeyMapExtension from "./tiptap/extensions/customKeyMapExtension";
import { api } from "@/trpc/react";
import aiSuggestionExtension from "./tiptap/extensions/aiSuggestionExtension";

export default function Tiptap({
  editorRef,
  className,
  placeHolder,
  startContent,
  exerciseId,
  textEditorType,
}: {
  editorRef: RefObject<Editor | null>;
  className?: string;
  placeHolder: string;
  startContent: JSONContent;
  exerciseId: string;
  textEditorType: "problem" | "solve";
}) {
  useEffect(() => {
    const loadStyles = async () => {
      const { addStyles } = await import("react-mathquill");
      addStyles();
    };
    loadStyles();
  }, []);
  const updateContentMutation =
    api.database.updateExerciseContent.useMutation();

  const editor = useEditor({
    extensions: [
      StarterKit,
      mathfieldExtension,
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
        blur: () => {
          if (editorRef.current) {
            const content = JSON.stringify(editorRef.current.getJSON());
            updateContentMutation.mutate({
              newContent: content,
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
