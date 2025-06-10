import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const type = searchParams.get("type");
  const radius = searchParams.get("radius");

  if (!lat || !lng || !type || !radius) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 }
    );
  }
}
