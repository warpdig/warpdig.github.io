import { NextRequest, NextResponse } from "next/server";

import { getReleaseRelations } from "@/lib/discogs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numericId = Number(id);
  if (Number.isNaN(numericId) || numericId <= 0) {
    return NextResponse.json(
      { error: "Invalid release id." },
      { status: 400 }
    );
  }

  try {
    const data = await getReleaseRelations(numericId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[release-relations-api]", error);
    return NextResponse.json(
      { error: "Failed to fetch release relations from Discogs." },
      { status: 502 }
    );
  }
}
