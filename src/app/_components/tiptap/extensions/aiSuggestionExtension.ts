import AiSuggestion from "../aiSuggestions";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

export default Node.create({
  name: "ai-suggestion",

  group: "block",
  content: "inline",

  parseHTML() {
    return [
      {
        tag: "ai-suggestion",
      },
    ];
  },

  renderHTML(props) {
    return ["ai-suggestion", mergeAttributes(props.HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AiSuggestion);
  },
});
