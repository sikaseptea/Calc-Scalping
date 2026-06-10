import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("News DB Error:", error);
      return Response.json(
        { data: [], error: error.message },
        { status: 500 }
      );
    }

    return Response.json(data);
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return Response.json(
      { data: [], error: "Unexpected error" },
      { status: 500 }
    );
  }
}