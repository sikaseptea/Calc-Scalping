import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.alternative.me/fng/?limit=1",
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch Fear & Greed data");
    }

    const json = await res.json();
    const item = json.data?.[0];

    return NextResponse.json({
      success: true,
      value: Number(item?.value),
      classification: item?.value_classification,
      timestamp: item?.timestamp,
      updated_at: new Date().toISOString(),
      source: "alternative.me",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to fetch Fear & Greed Index",
      },
      { status: 500 }
    );
  }
}