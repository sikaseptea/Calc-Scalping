import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("etf_flows")
      .select("*")
      .order("flow_date", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    const rows = data || [];

    const totalInflow = rows.reduce(
      (sum, item) => sum + Number(item.inflow || 0),
      0
    );

    const totalOutflow = rows.reduce(
      (sum, item) => sum + Number(item.outflow || 0),
      0
    );

    const totalNetFlow = rows.reduce(
      (sum, item) => sum + Number(item.net_flow || 0),
      0
    );

    const latestDate =
      rows.length > 0
        ? rows[0].flow_date
        : null;

    return NextResponse.json({
      success: true,
      updated_at: latestDate,
      total_inflow: totalInflow,
      total_outflow: totalOutflow,
      total_net_flow: totalNetFlow,
      data: rows,
    });
  } catch (err: any) {
    console.error(
      "ETF Flow API Error:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}