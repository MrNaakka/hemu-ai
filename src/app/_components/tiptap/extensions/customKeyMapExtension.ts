"use client";
import { Extension } from "@tiptap/core";

export default Extension.create({
  addKeyboardShortcuts() {
    const action = () => {
      const pos = this.editor.state.selection.from;
      const resolvedPos = this.editor.state.doc.resolve(pos);
      const id = crypto.randomUUID();
      this.editor
        .chain()
        .focus()
        .insertContent({
          type: "custom-image",
          attrs: {
            src: 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22"></svg>',
            id: id,
            latex: "",
          },
        })
        .run();

      this.editor
        .chain()
        .insertContentAt(resolvedPos.end(resolvedPos.depth) + 1, {
          type: "mathfield",
          attrs: {
            id: id,
            content: "",
          },
        })
        .run();

      return true;
    };
    return {
      "Mod-Enter": action,
      "Mod-e": action,
    };
  },
});
