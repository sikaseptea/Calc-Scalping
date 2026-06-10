"use client";

import { useEffect, useState } from "react";

export default function DashboardSummary() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  async function load() {
    try {
      setError(false);

      const res = await fetch("/api/sikasep/market-score", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error();

      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    load();

    const interval = setInterval(load, 60000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="rounded-3xl border border-red-900 bg-zinc-900 p-6">
        Failed to load market summary
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        Loading market summary...
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <Card title="Market Bias" value={data.bias || "-"} />

      <Card
        title="Market Score"
        value={`${data.score ?? 0}/100`}
      />

      <Card
        title="Bullish News"
        value={data.bullishNews ?? 0}
      />

      <Card
        title="Bearish News"
        value={data.bearishNews ?? 0}
      />
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-zinc-400">{title}</p>

      <h2 className="mt-3 text-3xl font-bold">
        {value}
      </h2>
    </div>
  );
}