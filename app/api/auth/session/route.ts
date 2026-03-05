import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../../api";
import { isAxiosError } from "axios";
import { logErrorResponse } from "../../_utils/utils";
import { setAuthCookiesFromHeader, setAuthCookiesFromPayload } from "../../_utils/authCookies";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (accessToken) {
      return NextResponse.json({ success: true });
    }

    if (refreshToken) {
      const apiRes = await api.get("auth/session", {
        headers: {
          Cookie: cookieStore.toString(),
        },
      });

      const fromHeader = setAuthCookiesFromHeader(cookieStore, apiRes.headers["set-cookie"]);
      const fromPayload = setAuthCookiesFromPayload(cookieStore, apiRes.data);
      const hasAccessToken = Boolean(cookieStore.get("accessToken")?.value);

      if (fromHeader || fromPayload || hasAccessToken) {
        return NextResponse.json({ success: true }, { status: 200 });
      }

      return NextResponse.json({ success: false }, { status: 200 });
    }
    return NextResponse.json({ success: false }, { status: 200 });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json({ success: false }, { status: 200 });
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
