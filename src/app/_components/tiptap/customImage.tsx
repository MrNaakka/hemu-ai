import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

export default function CustomImage({ editor, node, getPos }: NodeViewProps) {
  const handleClick = () => {
    console.log(node.attrs.latex, "image latex");
    if (!editor.isEditable) return;
    editor.setEditable(false);
    const resolvedPos = editor.state.doc.resolve(getPos());

    editor
      .chain()
      .insertContentAt(resolvedPos.end(resolvedPos.depth) + 1, {
        type: "mathfield",
        attrs: {
          id: node.attrs.id,
          content: node.attrs.latex,
        },
      })
      .run();
  };
  return (
    <NodeViewWrapper as={"span"}>
      <span className="p-1">
        <img
          alt="latex"
          onClick={handleClick}
          src={node.attrs.src}
          id={node.attrs.id}
          className="bg-darkblue inline min-h-[40px] min-w-[40px] border border-2 border-gray-900 p-2"
        />
      </span>
    </NodeViewWrapper>
  );
}
