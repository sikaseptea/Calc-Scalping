"use client";

import { useEffect, useState } from "react";

type FearGreedResponse = {
  success: boolean;
  value: number;
  classification: string;
  timestamp?: string;
  updated_at?: string;
  source?: string;
};

export default function FearGreedCard() {
  const [data, setData] = useState<FearGreedResponse | null>(null);
  const [error, setError] = useState(false);

  async function load() {
    try {
      setError(false);

      const res = await fetch("/api/sikasep/fear-greed", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error();
      }

      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    load();

    const interval = setInterval(load, 300000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="rounded-3xl border border-red-900 bg-zinc-900 p-6">
        Failed to load Fear & Greed data
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        Loading...
      </div>
    );
  }

  const color =
    data.value <= 25
      ? "text-red-500"
      : data.value <= 45
      ? "text-orange-400"
      : data.value <= 55
      ? "text-yellow-400"
      : data.value <= 75
      ? "text-green-400"
      : "text-emerald-500";

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-zinc-400">
        Fear & Greed
      </p>

      <h2 className={`mt-3 text-4xl font-bold ${color}`}>
        {data.value}
      </h2>

      <p className="mt-2 text-sm text-zinc-400">
        {data.classification}
      </p>

      {data.updated_at && (
        <p className="mt-4 text-xs text-zinc-500">
          Updated: {new Date(data.updated_at).toLocaleString()}
        </p>
      )}

      {data.source && (
        <p className="mt-1 text-xs text-zinc-600">
          Source: {data.source}
        </p>
      )}
    </div>
  );
}