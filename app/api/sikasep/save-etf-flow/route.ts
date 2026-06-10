import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // sementara source dari json static
    // nanti gampang diganti ke endpoint provider asli
    const rows = [
      {
        asset: "BTC",
        ticker: "IBIT",
        inflow: 300000000,
        outflow: 0,
        net_flow: 300000000,
        flow_date: new Date().toISOString().split("T")[0],
        source: "farside",
      },
      {
        asset: "ETH",
        ticker: "ETHA",
        inflow: 65000000,
        outflow: 0,
        net_flow: 65000000,
        flow_date: new Date().toISOString().split("T")[0],
        source: "farside",
      },
    ];

    const { data, error } = await supabase
      .from("etf_flows")
      .upsert(rows, {
        onConflict: "ticker,flow_date",
      })
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      saved: data?.length || 0,
      data,
    });
  } catch (err: any) {
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