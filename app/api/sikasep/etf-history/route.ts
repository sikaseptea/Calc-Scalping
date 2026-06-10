import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("etf_flows")
      .select("flow_date, net_flow")
      .order("flow_date", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        summary: {
          totalInflow: 0,
          totalOutflow: 0,
          netAccumulation: 0,
          trend: "neutral",
          streak: 0,
        },
      });
    }

    // =========================
    // GROUP PER HARI
    // =========================
    const grouped = new Map<string, number>();

    let totalInflow = 0;
    let totalOutflow = 0;

    for (const row of data) {
      if (!row.flow_date) continue;

      const flow = Number(row.net_flow || 0);

      grouped.set(
        row.flow_date,
        (grouped.get(row.flow_date) || 0) + flow
      );

      if (flow >= 0) totalInflow += flow;
      else totalOutflow += flow;
    }

    const chartData = Array.from(grouped.entries()).map(
      ([date, net_flow]) => ({
        date,
        net_flow,
      })
    );

    // =========================
    // INTELLIGENCE SUMMARY
    // =========================
    const netAccumulation = totalInflow + totalOutflow;

    let trend: "bullish" | "bearish" | "neutral" =
      "neutral";

    if (netAccumulation > 100_000_000) {
      trend = "bullish";
    } else if (netAccumulation < -100_000_000) {
      trend = "bearish";
    }

    // =========================
    // STREAK (consecutive inflow days)
    // =========================
    let streak = 0;

    for (let i = chartData.length - 1; i >= 0; i--) {
      if (chartData[i].net_flow >= 0) {
        streak++;
      } else {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      data: chartData,
      summary: {
        totalInflow,
        totalOutflow,
        netAccumulation,
        trend,
        streak,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        data: [],
        summary: {
          totalInflow: 0,
          totalOutflow: 0,
          netAccumulation: 0,
          trend: "neutral",
          streak: 0,
        },
      },
      { status: 500 }
    );
  }
}