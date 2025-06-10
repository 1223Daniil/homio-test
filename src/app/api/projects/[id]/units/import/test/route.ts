import { NextRequest, NextResponse } from "next/server";

// Проверка API токена
const API_TOKEN = process.env.UNITS_IMPORT_API_TOKEN || "9a7b3c5d1e8f2g4h6j0k";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Starting test endpoint");
    
    // Проверка API токена
    const authHeader = request.headers.get("x-api-token");
    console.log("API token check:", {
      headerPresent: !!authHeader,
      envTokenPresent: !!API_TOKEN,
      isMatch: authHeader === API_TOKEN,
      headerValue: authHeader,
      envTokenValue: API_TOKEN
    });
    
    if (!API_TOKEN || authHeader !== API_TOKEN) {
      console.log("Authentication failed: Invalid API token");
      return NextResponse.json(
        { error: "unauthorized", message: "Invalid API token" },
        { status: 401 }
      );
    }

    // Получаем ID проекта из параметров
    const projectId = params.id;
    console.log("Project ID from params:", projectId);

    return NextResponse.json({
      success: true,
      message: "API token is valid",
      projectId
    });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: "serverError", 
          message: "Server error", 
          details: {
            name: error.name,
            message: error.message
          }
        },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { 
          error: "serverError", 
          message: "Server error",
          details: String(error)
        },
        { status: 500 }
      );
    }
  }
} 