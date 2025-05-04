"use client";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import type { MathField } from "react-mathquill";

import TeXToSVG from "tex-to-svg";

const EditableMathField = dynamic(
  () => import("react-mathquill").then((x) => x.EditableMathField),
  { ssr: false },
);

export default function CustomMathfield(props: NodeViewProps) {
  const handleChange = (mathField: MathField) => {
    console.log("change");
    console.log(props.node.attrs.content, "latex, matfield");
    const latex = mathField.latex();

    props.updateAttributes({ content: latex });

    const svg = TeXToSVG(latex).replace(/fill="currentColor"/g, 'fill="white"');
    const updatedSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

    props.editor.state.doc.descendants((node, pos) => {
      if (
        node.type.name === "custom-image" &&
        node.attrs.id === props.node.attrs.id
      ) {
        props.editor.view.dispatch(
          props.editor.state.tr.setNodeMarkup(pos, null, {
            ...node.attrs,
            src: updatedSrc,
            latex: latex,
          }),
        );
      }
    });
  };

  const handleBlur = () => {
    props.editor.setEditable(true);
    props.deleteNode();
    props.editor.commands.focus();
  };
  const mfRef = useRef<MathField | null>(null);

  return (
    <NodeViewWrapper>
      <div className="math-field-style">
        <EditableMathField
          latex={props.node.attrs.content || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          mathquillDidMount={(x) => {
            mfRef.current = x;
            setTimeout(() => {
              x.focus();
            }, 0);
          }}
          onKeyDown={(x) => {
            if (x.key === "Escape") {
              console.log(props.node.attrs.content, "mv");
              console.log("vittu espaceeee");
              handleBlur();
              props.editor.commands.focus();
            }
          }}
        />
      </div>
    </NodeViewWrapper>
  );
}
