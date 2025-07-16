import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

export default function Plan({
  title,
  content,
  icon,
  action,
  cost,
}: {
  title: string;
  content: string[];
  icon: ReactNode;
  cost: string;
  action?: string;
}) {
  return (
    <div className="flex h-[40vh] w-1/4 flex-col justify-between gap-8 rounded-lg border-2 border-teal-700 p-5">
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="text-bold text-4xl">{title}</h4>
        </div>
        <p className="ml-2 text-stone-400">{cost} € per month</p>
      </div>
      <div className="flex flex-col gap-3">
        {content.map((element) => (
          <div
            className="flex w-full flex-row items-center gap-2 text-stone-200"
            key={element}
          >
            <Check className="w-1/8" color="#3e9392" />
            <p className="w-7/8">{element}</p>
          </div>
        ))}
      </div>
      <Button>{action ?? "Start Now"}</Button>
    </div>
  );
}
