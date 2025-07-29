"use client";
import CustomImage from "../customImage";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

export default Node.create({
  name: "custom-image",

  group: "inline",

  inline: true,

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      latex: {
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
        tag: "custom-image",
        getAttrs: (e) => ({
          id: e.getAttribute("id"),
          latex: e.getAttribute("latex"),
        }),
      },
    ];
  },

  renderHTML(props) {
    return ["custom-image", mergeAttributes(props.HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CustomImage);
  },
});
