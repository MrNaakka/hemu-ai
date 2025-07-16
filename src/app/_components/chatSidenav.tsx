"use client";
import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar";

import AiInteraction from "./chatSidenav/ai-Interaction";
import Messages from "./chatSidenav/messages";
import CustomTrigger from "./chatSidenav/trigger";

export default function ChatSidenav() {
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
        <Messages />

        <AiInteraction />
      </SidebarContent>
    </Sidebar>
  );
}
