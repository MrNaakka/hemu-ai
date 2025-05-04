"use client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { MessageSquareText } from "lucide-react";

export default function CustomTrigger({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      onClick={toggleSidebar}
      className={`size-7 ${className}`}
      variant={"ghost"}
      size={"icon"}
      asChild
    >
      <span>
        <MessageSquareText />
      </span>
    </Button>
  );
}
