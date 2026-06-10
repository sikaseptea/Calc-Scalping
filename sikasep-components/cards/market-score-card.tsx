interface Props {
  score: number;
  status: string;
}

export default function MarketScoreCard({
  score,
  status,
}: Props) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-zinc-400">
        Market Health Score
      </p>

      <h2 className="mt-3 text-5xl font-bold">
        {score}
      </h2>

      <p className="mt-3 text-emerald-400">
        {status}
      </p>
    </div>
  );
}