export default function Title({
  name,
  description,
}: {
  name: string;
  description?: string;
}) {
  return (
    <div className="flex h-full w-full flex-col">
      <h2 className="flex h-3/4 w-full items-end text-8xl">{name}</h2>
      <h4 className="flex h-1/4 w-full items-center text-3xl">
        {description ?? ""}
      </h4>
    </div>
  );
}
