import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=7.8,98.3&radius=1000&type=restaurant&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "API test failed", details: error },
      { status: 500 }
    );
  }
}
