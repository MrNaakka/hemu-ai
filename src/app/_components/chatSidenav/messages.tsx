"use client";

import { SidebarGroup } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef, useEffect } from "react";
import { api, type RouterOutputs } from "@/trpc/react";

export default function Messages({
  initialMessagesData,
  exerciseId,
}: {
  initialMessagesData: RouterOutputs["database"]["getMessages"];
  exerciseId: string;
}) {
  const { data } = api.database.getMessages.useQuery(
    { exerciseId: exerciseId },
    { initialData: initialMessagesData },
  );
  const bottomDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomDivRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);
  useEffect(() => {
    bottomDivRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  return (
    <SidebarGroup className="flex h-[70%] flex-col justify-end">
      <ScrollArea className="h-full">
        <div className="flex h-full w-[90%] flex-col gap-2">
          {data.map((x) => {
            console.log(x, "lol");
            if (x.sender === "ai") {
              return (
                <div
                  className="bg-primaryBg w-full rounded-xl p-4"
                  key={x.chatId}
                >
                  {x.chatContent}
                </div>
              );
            }
            return (
              <div key={x.chatId} className="flex w-full flex-row-reverse">
                <div className="bg-primaryBg max-w-[80%] shrink rounded-xl p-4">
                  {x.chatContent}
                </div>
                <div ref={bottomDivRef} />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </SidebarGroup>
  );
}
