import { supabase } from "@/lib/supabase";

export async function getNews() {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("impact_score", { ascending: false })
    .limit(20);

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}