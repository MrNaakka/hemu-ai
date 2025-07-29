"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function CheckOutButton({
  name,
  classname,
  isPortal,
}: {
  name: string;
  classname?: string;
  isPortal: boolean;
}) {
  const router = useRouter();
  const { data, isFetching } = isPortal
    ? api.stripe.cancelPortal.useQuery()
    : api.stripe.createCheckOutSessionStandard.useQuery();

  const handleClick = () => {
    if (!data) return;
    router.push(data.url);
  };

  return (
    <Button onClick={handleClick} className={classname} disabled={isFetching}>
      {name}
    </Button>
  );
}
