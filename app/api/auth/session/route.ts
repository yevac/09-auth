import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAxiosError } from "axios";
import { api } from "@/app/api/api";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const { data, headers } = await api.get("/auth/session", {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    const response = NextResponse.json(data, { status: 200 });

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
        {
          error:
            (error.response?.data as { error?: string; message?: string })
              ?.error ||
            (error.response?.data as { error?: string; message?: string })
              ?.message ||
            error.message,
        },
        { status: error.response?.status ?? 401 },
      );
    }

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }
}