import { NextRequest, NextResponse } from "next/server";
import { api } from "@/app/api/api";
import { isAxiosError } from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, headers } = await api.post("/auth/register", body);

    const response = NextResponse.json(data, { status: 201 });

    const setCookie = headers["set-cookie"];
    if (setCookie) {
      if (Array.isArray(setCookie)) {
        setCookie.forEach((cookie) =>
          response.headers.append("set-cookie", cookie),
        );
      } else {
        response.headers.set("set-cookie", setCookie);
      }
    }

    return response;
  } catch (error) {
    if (isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.error || error.message },
        { status: error.response?.status ?? 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}