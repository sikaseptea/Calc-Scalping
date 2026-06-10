import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("fear_greed_history")
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