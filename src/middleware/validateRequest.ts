import { NextResponse } from "next/server";
import { ZodSchema } from "zod";

export function validateRequest<T>(schema: ZodSchema<T>) {
  return async (request: Request) => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      return { success: true, data: validatedData };
    } catch (error) {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }
  };
}
