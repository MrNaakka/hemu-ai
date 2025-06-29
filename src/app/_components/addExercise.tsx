"use client";

import useExerciseIsMutating from "@/hooks/newExerciseIsMutating";
import { FormDialog } from "./onlyUI/dialogs";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { ThreeDot } from "react-loading-indicators";
import ExerciseSkeleton from "./exerciseSkeleton";

export default function AddExercise() {
  const exerciseMutation = api.database.addNewExercise.useMutation({});
  const util = api.useUtils();

  const router = useRouter();
  const hasMutated = useExerciseIsMutating();

  return (
    <>
      {hasMutated ? (
        <ExerciseSkeleton needButton={true} />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
          <div className="text-center text-4xl text-white">Hemu Ai</div>
          <div>
            Do your homework with Hemu Ai and learn in a more efficient way!
          </div>

          <FormDialog
            title="Add Exercise"
            triggerContent={
              <>
                {exerciseMutation.isPending ? (
                  <ThreeDot color={"white"} size="small" />
                ) : (
                  "Create a new exercise!"
                )}
              </>
            }
            dialogAction={(name) => {
              exerciseMutation.mutate(
                { name: name },
                {
                  onSuccess: (result) => {
                    router.push(`/home/${result.e.eId}`);
                    util.database.latestExercises.invalidate();
                  },
                },
              );
            }}
          />
        </div>
      )}
    </>
  );
}
