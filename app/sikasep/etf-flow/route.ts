import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data } = await supabase
      .from("etf_flows")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(10);

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json([]);
  }
}