import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ShortcutData } from "@/lib/mathfieldButtonsData";
import type { MathField } from "@digabi/mathquill";
import type { RefObject } from "react";

export default function ShortCuts({
  shortcuts,
  mathfieldRef,
}: {
  shortcuts: ShortcutData[];
  mathfieldRef: RefObject<MathField | null>;
}) {
  const handleShortCutClick = (latex: string, write: boolean) => {
    if (!mathfieldRef.current) return;
    if (write) {
      mathfieldRef.current.write(latex);
      return;
    }
    mathfieldRef.current.cmd(latex);
  };

  return (
    <div className="relative w-full min-w-0">
      <div className="absolute right-0 left-0 overflow-x-auto">
        <div className="flex flex-row overflow-x-auto border-b-1 border-teal-900 pr-4 pl-4 whitespace-nowrap">
          {shortcuts.map((shortcut) => (
            <Tooltip key={crypto.randomUUID()} disableHoverableContent={true}>
              <TooltipTrigger asChild>
                <button
                  className="hover:bg-secondaryBg mr-2 ml-2 flex-shrink-0 items-center justify-center p-3"
                  onClick={() =>
                    handleShortCutClick(
                      shortcut.action,
                      shortcut.fn === "write",
                    )
                  }
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <img
                    alt="error"
                    className="invert filter"
                    src={shortcut.svg}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{shortcut.action}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}
