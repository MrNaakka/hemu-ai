"use client";

import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";

export default function AiSuggestion({
  editor,
  deleteNode,
  node,
}: NodeViewProps) {
  const handleNoClick = () => {
    editor.setEditable(true);
    deleteNode();
    editor.chain().focus().run();
  };

  const handleYesClick = () => {
    editor.setEditable(true);
    const content = node.content.toJSON();
    deleteNode();
    editor.chain().insertContent(content).focus().run();
  };

  return (
    <>
      <NodeViewWrapper className="m-1 flex h-auto w-full flex-row items-center justify-center rounded-xl bg-[#0f1410] p-2 text-white">
        <NodeViewContent />
        <div className="w flex h-full flex-col gap-2">
          <Button
            className="hover:bg-[#161f1e] hover:text-white"
            variant={"ghost"}
            size={"icon"}
            onClick={handleNoClick}
          >
            <X />
          </Button>
          <Button
            className="hover:bg-[#161f1e] hover:text-white"
            variant={"ghost"}
            size={"icon"}
            onClick={handleYesClick}
          >
            <Check />
          </Button>
        </div>
      </NodeViewWrapper>
    </>
  );
}
