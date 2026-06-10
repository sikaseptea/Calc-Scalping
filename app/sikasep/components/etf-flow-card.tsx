"use client";

import { useEffect, useState } from "react";

type ETFRow = {
  id: number;
  asset: string;
  ticker: string;
  inflow: number;
  outflow: number;
  net_flow: number;
  flow_date: string;
  source: string;
};

type ETFResponse = {
  success: boolean;
  updated_at: string | null;
  total_inflow: number;
  total_outflow: number;
  total_net_flow: number;
  data: ETFRow[];
};

function formatMoney(value: number) {
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }

  return `$${value.toLocaleString()}`;
}

export default function ETFFlowCard() {
  const [data, setData] = useState<ETFRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [summary, setSummary] =
    useState<ETFResponse | null>(null);

  async function load() {
    try {
      setError("");

      const res = await fetch(
        "/api/sikasep/etf-flow",
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(
          `HTTP ${res.status}`
        );
      }

      const json: ETFResponse =
        await res.json();

      setSummary(json);
      setData(json.data || []);
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to load ETF data"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    const interval = setInterval(
      load,
      60000
    );

    return () =>
      clearInterval(interval);
  }, []);

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          ETF Flow
        </h3>

        <span className="text-xs text-zinc-500">
          Refresh 60s
        </span>
      </div>

      {loading && (
        <div className="text-zinc-500">
          Loading ETF Flow...
        </div>
      )}

      {error && (
        <div className="text-red-400">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        summary && (
          <>
            <div className="mb-4 rounded-2xl bg-zinc-800 p-4">
              <div className="text-xs text-zinc-500">
                Total Net Flow
              </div>

              <div
                className={`mt-1 text-2xl font-bold ${
                  summary.total_net_flow >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {formatMoney(
                  summary.total_net_flow
                )}
              </div>

              <div className="mt-2 text-xs text-zinc-500">
                Updated:
                {" "}
                {summary.updated_at ??
                  "-"}
              </div>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-zinc-800 p-3">
                <div className="text-xs text-zinc-500">
                  Inflow
                </div>

                <div className="font-semibold text-emerald-400">
                  {formatMoney(
                    summary.total_inflow
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-zinc-800 p-3">
                <div className="text-xs text-zinc-500">
                  Outflow
                </div>

                <div className="font-semibold text-red-400">
                  {formatMoney(
                    summary.total_outflow
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-zinc-800 p-3">
                <div className="text-xs text-zinc-500">
                  Net
                </div>

                <div
                  className={`font-semibold ${
                    summary.total_net_flow >=
                    0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {formatMoney(
                    summary.total_net_flow
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {data.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-800 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">
                        {item.ticker}
                      </div>

                      <div className="text-xs text-zinc-500">
                        {item.asset}
                      </div>
                    </div>

                    <div
                      className={`font-semibold ${
                        item.net_flow >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {formatMoney(
                        item.net_flow
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-zinc-500">
                        Inflow:
                      </span>{" "}
                      {formatMoney(
                        item.inflow
                      )}
                    </div>

                    <div>
                      <span className="text-zinc-500">
                        Outflow:
                      </span>{" "}
                      {formatMoney(
                        item.outflow
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {data.length === 0 && (
                <div className="text-zinc-500">
                  No ETF data found.
                </div>
              )}
            </div>
          </>
        )}
    </div>
  );
}