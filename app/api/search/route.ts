import { NextRequest, NextResponse } from "next/server";

import { searchDiscogs } from "@/lib/discogs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const pageParam = Number(searchParams.get("page") ?? "1");
  const perPageParam = Number(searchParams.get("per_page") ?? "30");

  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter." },
      { status: 400 }
    );
  }

  try {
    const data = await searchDiscogs(query, pageParam, perPageParam);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[search-api]", error);
    return NextResponse.json(
      { error: "Failed to fetch results from Discogs." },
      { status: 502 }
    );
  }
}
