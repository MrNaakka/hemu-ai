"use client";
import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CustomMathfield from "../mathfield";
import type { RefObject } from "react";
import type { MathField } from "@digabi/mathquill";

export default Node.create<{
  setIsFocused: React.Dispatch<React.SetStateAction<boolean>>;
  mathfieldRef: RefObject<MathField | null>;
}>({
  name: "mathfield",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      content: {
        default: "",
      },
      id: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "mathfield",
        getAttrs: () => ({}),
      },
    ];
  },

  renderHTML() {
    return ["mathfield"];
  },

  addNodeView() {
    return ReactNodeViewRenderer((x) => (
      <CustomMathfield
        {...x}
        setIsFocused={this.options.setIsFocused}
        mathfieldRef={this.options.mathfieldRef}
      />
    ));
  },
});
