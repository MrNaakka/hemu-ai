"use client";

import { api, type RouterOutputs } from "@/trpc/react";
import { Button } from "@/components/ui/button";
export function LatestPost({
  initialData,
}: {
  initialData: RouterOutputs["post"]["getProblems"];
}) {
  const utils = api.useUtils();
  const { data } = api.post.getProblems.useQuery(undefined, { initialData });
  const addProblemMutation = api.post.addProblem.useMutation();
  const deleteProblemMutation = api.post.deleteAllProblems.useMutation();

  return (
    <div className="w-full max-w-xs">
      <div>
        <Button
          type="button"
          onClick={() => {
            addProblemMutation.mutate(
              { content: "jebliasdfasdfsa" },
              { onSuccess: () => utils.invalidate() },
            );
          }}
        >
          {addProblemMutation.isPending ? "loading" : "add new"}
        </Button>
        <Button
          onClick={() => {
            deleteProblemMutation.mutate(undefined, {
              onSuccess: () => utils.invalidate(),
            });
          }}
        >
          {deleteProblemMutation.isPending ? "loading" : "DELETE ALL"}
        </Button>
      </div>
      {data.map((x) => (
        <div key={x.problemId}>
          {x.problemContent}, {x.problemId}
        </div>
      ))}
    </div>
  );
}
