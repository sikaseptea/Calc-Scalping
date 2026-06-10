interface Props {
  summary: string;
}

export default function SummaryCard({
  summary,
}: Props) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold">
        AI Executive Summary
      </h3>

      <p className="leading-7 text-zinc-400">
        {summary}
      </p>
    </div>
  );
}