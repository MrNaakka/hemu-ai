import { Button } from "@/components/ui/button";

export default function SignButton({ title }: { title: string }) {
  return (
    <Button
      variant={"outline"}
      className="bg-primaryBg hover:bg-secondaryBg rounded-lg border-2 border-teal-700 p-18 text-6xl text-white hover:text-white"
    >
      {title}
    </Button>
  );
}
