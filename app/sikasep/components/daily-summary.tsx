"use client";

import { useEffect, useState } from "react";

export default function DailySummary() {
  const [data, setData] = useState<any>(null);

  async function load() {
    const res = await fetch(
      "/api/sikasep/daily-summary"
    );

    const json = await res.json();

    setData(json);
  }

  useEffect(() => {
    load();

    const interval = setInterval(
      load,
      60000
    );

    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="text-xl font-bold">
        Today's Market Outlook
      </h3>

      <div className="mt-4 flex gap-8">
        <div>
          <p className="text-zinc-400">
            Bias
          </p>

          <p className="text-2xl font-bold">
            {data.bias}
          </p>
        </div>

        <div>
          <p className="text-zinc-400">
            Confidence
          </p>

          <p className="text-2xl font-bold">
            {data.confidence}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 font-semibold">
          Reasons
        </p>

        <ul className="space-y-2">
          {data.reasons.map(
            (reason: string, idx: number) => (
              <li key={idx}>
                ✓ {reason}
              </li>
            )
          )}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl bg-zinc-800 p-4">
        {data.conclusion}
      </div>
    </div>
  );
}