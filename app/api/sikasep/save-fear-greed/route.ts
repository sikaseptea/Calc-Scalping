import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.alternative.me/fng/?limit=1",
      {
        cache: "no-store",
      }
    );

    const json = await res.json();

    const item = json.data[0];

    const payload = {
      value: Number(item.value),
      classification:
        item.value_classification,
    };

    const { error } = await supabase
      .from("fear_greed_history")
      .insert(payload);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: payload,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}