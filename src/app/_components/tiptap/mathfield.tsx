"use client";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import dynamic from "next/dynamic";
import { type RefObject } from "react";
import type { MathField } from "@digabi/mathquill";

import TeXToSVG from "tex-to-svg";

const EditableMathField = dynamic(
  () =>
    import(
      "@/app/_components/editableMathFieldWrapper/editable-mathfield"
    ).then((x) => x.default),
  { ssr: false },
);

export default function CustomMathfield(
  props: NodeViewProps & {
    setIsFocused: React.Dispatch<React.SetStateAction<boolean>>;
    mathfieldRef: RefObject<MathField | null>;
  },
) {
  const handleChange = (mathField: MathField) => {
    console.log(props.editor.getJSON());
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
    props.setIsFocused(false);
    props.mathfieldRef.current = null;
    props.editor.setEditable(true);
    props.deleteNode();
    props.editor.commands.focus();
  };

  return (
    <NodeViewWrapper>
      <div className="math-field-style">
        <EditableMathField
          latex={props.node.attrs.content ?? ""}
          onChange={handleChange}
          onBlur={handleBlur}
          mathquillDidMount={(x) => {
            setTimeout(() => {
              x.focus();
              props.setIsFocused(true);
              props.mathfieldRef.current = x;
            }, 0);
          }}
          onKeyDown={(x) => {
            if (x.key === "Escape") {
              handleBlur();
              props.editor.commands.focus();
            }
          }}
        />
      </div>
    </NodeViewWrapper>
  );
}
