import { Check } from "lucide-react";
import type { ReactNode } from "react";

export default function Plan({
  title,
  content,
  icon,
  children,
  cost,
  classname,
}: {
  title: string;
  content: string[];
  icon: ReactNode;
  children?: ReactNode;
  cost: string;
  classname?: string;
}) {
  return (
    <div
      className={`flex h-[40vh] w-1/4 flex-col justify-between gap-8 rounded-lg border-2 border-teal-700 p-5 ${classname}`}
    >
      <section className="flex h-full w-full flex-col gap-8">
        <div className="flex flex-col items-end justify-center gap-2">
          <div className="flex w-full items-center gap-2">
            <div className="flex w-1/8 items-center justify-center">{icon}</div>
            <h4 className="text-bold w-7/8 text-4xl">{title}</h4>
          </div>

          <p className="w-7/8 pl-2 text-stone-400">{cost} € per month</p>
        </div>
        <div className="flex flex-col gap-3">
          {content.map((element) => (
            <div
              className="flex w-full flex-row items-center justify-center gap-2 text-stone-200"
              key={element}
            >
              <Check className="w-1/8" color="#3e9392" />
              <p className="w-7/8">{element}</p>
            </div>
          ))}
        </div>
      </section>
      {children}
    </div>
  );
}
