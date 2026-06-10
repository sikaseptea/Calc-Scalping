import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    // 1. ambil data ETF terbaru dari source kamu (sementara dummy / nanti API real)
    const netFlow = Math.floor(
      (Math.random() - 0.5) * 200_000_000
    );

    // 2. cek apakah sudah ada data hari ini
    const { data: existing } = await supabase
      .from("etf_flows")
      .select("id")
      .eq("flow_date", today)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Already ingested today",
      });
    }

    // 3. insert data harian
    const { error } = await supabase
      .from("etf_flows")
      .insert({
        flow_date: today,
        net_flow: netFlow,
      });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "ETF flow saved",
      data: {
        flow_date: today,
        net_flow: netFlow,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}