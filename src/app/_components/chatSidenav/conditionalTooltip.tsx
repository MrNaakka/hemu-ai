import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ConditionalTooltip({
  condition,
  children,
  tooltipContent,
}: {
  condition: boolean;
  tooltipContent: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      {condition ? (
        <Tooltip>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      ) : (
        children
      )}
    </>
  );
}
