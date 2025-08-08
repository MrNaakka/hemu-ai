"use client";
import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar";

import AiInteraction from "./chatSidenav/ai-Interaction";
import Messages from "./chatSidenav/messages";
import CustomTrigger from "./chatSidenav/trigger";
import { Progress } from "@/components/ui/progress";
import { api } from "@/trpc/react";

export default function ChatSidenav() {
  const { data } = api.database.getTokenInformation.useQuery();
  const usedTokens = data!.usedTokens;
  const tokenLimit = data!.tokenLimit;
  const isOverTokenLimit = usedTokens >= tokenLimit;
  return (
    <Sidebar
      className="border-secondaryBg border-l"
      side="right"
      variant="sidebar"
      collapsible="offcanvas"
    >
      <SidebarContent className="bg-secondaryBg justify-between text-gray-300">
        <SidebarGroup>
          <div className="flex h-10 w-full justify-between">
            <div className="w-2/3 p-2">
              <Progress
                className="bg-secondaryBg h-4 border-2 border-teal-900 [&>div]:bg-teal-700"
                value={
                  !isOverTokenLimit ? (usedTokens * 100) / tokenLimit : 100
                }
              />
              <p className="text-center text-sm text-stone-500">
                {!isOverTokenLimit ? usedTokens : tokenLimit}/{tokenLimit}{" "}
                tokens used
              </p>
            </div>
            <CustomTrigger />
          </div>
        </SidebarGroup>
        <Messages />

        <AiInteraction isOverTokenLimit={isOverTokenLimit} />
      </SidebarContent>
    </Sidebar>
  );
}
