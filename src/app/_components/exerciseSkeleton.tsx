import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquareText } from "lucide-react";
export default function ExerciseSkeleton({
  needButton,
}: {
  needButton: boolean;
}) {
  return (
    <div className="flex h-full w-full flex-row">
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <Skeleton className="h-1/5 w-full bg-[#232b26]" />
        <Skeleton className="h-3/5 w-full bg-[#232b26]" />
      </div>
      {needButton ? (
        <div>
          <Button
            className="m-2 size-7 p-2"
            variant={"ghost"}
            size={"icon"}
            asChild
          >
            <span>
              <MessageSquareText />
            </span>
          </Button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
