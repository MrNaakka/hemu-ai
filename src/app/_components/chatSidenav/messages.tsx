"use client";

import { SidebarGroup } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef, useEffect, useContext } from "react";
import { api } from "@/trpc/react";
import { ExerciseIdContext } from "@/lib/context/ExerciseIdContext";

export default function Messages() {
  const exerciseId = useContext(ExerciseIdContext)!;
  const { data } = api.database.getMessages.useQuery({ exerciseId });

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
          {data!.map((x) => {
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
