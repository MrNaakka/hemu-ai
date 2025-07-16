export default function Node({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      <h4 className="text-5xl">{title}</h4>
      <p className="text-xl">{description}</p>
    </div>
  );
}
