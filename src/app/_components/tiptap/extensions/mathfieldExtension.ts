"use client";
import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CustomMathfield from "../mathfield";

export default Node.create({
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
    return ReactNodeViewRenderer(CustomMathfield);
  },
});
