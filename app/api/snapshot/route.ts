import { ingestSnapshot } from "@/lib/snapshot-engine/ingest";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await ingestSnapshot(body);

    return Response.json(result);
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error: err.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}