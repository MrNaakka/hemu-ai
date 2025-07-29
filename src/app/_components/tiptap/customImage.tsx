import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import TeXToSVG from "tex-to-svg";

export default function CustomImage({ editor, node, getPos }: NodeViewProps) {
  const handleClick = () => {
    console.log(TeXToSVG(node.attrs.latex));
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
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(
            TeXToSVG(node.attrs.latex).replace(
              /fill="currentColor"/g,
              'fill="white"',
            ),
          )}`}
          id={node.attrs.id}
          className="bg-darkblue inline min-h-[40px] min-w-[40px] border border-1 border-zinc-400 p-2 text-white"
          color="white"
        />
      </span>
    </NodeViewWrapper>
  );
}
