"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { RefObject } from "react";
import type { Editor } from "@tiptap/core";

import type { RouterOutputs } from "@/trpc/react";
import AiInteraction from "./chatSidenav/ai-Interaction";
import Messages from "./chatSidenav/messages";
import CustomTrigger from "./chatSidenav/trigger";

export default function ChatSidenav({
  initialMessagesData,
  problemEditor,
  solveEditor,
  exerciseId,
}: {
  initialMessagesData: RouterOutputs["database"]["getMessages"];
  exerciseId: string;
  problemEditor: RefObject<Editor | null>;
  solveEditor: RefObject<Editor | null>;
}) {
  return (
    <Sidebar
      className="border-secondaryBg border-l"
      side="right"
      variant="sidebar"
      collapsible="offcanvas"
    >
      <SidebarContent className="bg-secondaryBg justify-between text-gray-300">
        <SidebarGroup>
          <div className="flex justify-end">
            <CustomTrigger />
          </div>
        </SidebarGroup>
        <Messages
          initialMessagesData={initialMessagesData}
          exerciseId={exerciseId}
        />

        <AiInteraction
          exerciseId={exerciseId}
          problemEditor={problemEditor}
          solveEditor={solveEditor}
        />
      </SidebarContent>
    </Sidebar>
  );
}
