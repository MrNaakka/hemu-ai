import Link from "next/link";

export default function TokenTooltipContent() {
  return (
    <p className="text-lg">
      You have used your monthly tokens.
      <br />
      <Link href={"/plans"} className="underline">
        Upgrade your plan.
      </Link>
    </p>
  );
}
