import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("market_snapshots")
    .select("*")
    .order("created_at", {
      ascending: true,
    })
    .limit(30);

  if (error) {
    return NextResponse.json([]);
  }

  return NextResponse.json(data);
}