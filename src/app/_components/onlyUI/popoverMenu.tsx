import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { ReactNode } from "react";

export default function PopoverMenu({
  popTrigger,
  children,
}: {
  popTrigger: ReactNode;
  children: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>{popTrigger}</PopoverTrigger>
      <PopoverContent
        className="w-auto border-2 border-black bg-[#0d0f0d] p-0"
        side="right"
        align="start"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
