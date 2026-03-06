import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../../api";
import { isAxiosError } from "axios";
import { logErrorResponse } from "../../_utils/utils";
import { setAuthCookiesFromHeader, setAuthCookiesFromPayload } from "../../_utils/authCookies";

export async function GET() {
  try {
    const requestCookies = await cookies();
    const accessToken = requestCookies.get("accessToken")?.value;
    const refreshToken = requestCookies.get("refreshToken")?.value;

    if (accessToken) {
      return NextResponse.json({ success: true });
    }

    if (refreshToken) {
      const apiRes = await api.get("/auth/session", {
        headers: {
          Cookie: requestCookies.toString(),
        },
      });

      const response = NextResponse.json({ success: true }, { status: 200 });
      const responseCookieStore = {
        set: (name: string, value: string, options?: Parameters<typeof response.cookies.set>[2]) =>
          response.cookies.set(name, value, options),
      };

      const fromHeader = setAuthCookiesFromHeader(responseCookieStore, apiRes.headers["set-cookie"]);
      const fromPayload = setAuthCookiesFromPayload(responseCookieStore, apiRes.data);

      if (fromHeader || fromPayload) {
        return response;
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
