import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const privateRoutes = ["/notes"];
const publicRoutes = ["/sign-in", "/sign-up"];

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

function isPrivateRoute(pathname: string): boolean {
  return privateRoutes.some((route) => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

async function refreshSession(
  refreshToken: string,
): Promise<RefreshResponse | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as RefreshResponse;

    if (!data.accessToken || !data.refreshToken) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const privateRoute = isPrivateRoute(pathname);
  const publicRoute = isPublicRoute(pathname);

  if (!privateRoute && !publicRoute) {
    return NextResponse.next();
  }

  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken) {
    if (publicRoute) {
      return NextResponse.redirect(new URL("/notes", request.url));
    }

    return NextResponse.next();
  }

  if (!accessToken && refreshToken) {
    const newSession = await refreshSession(refreshToken);

    if (newSession) {
      if (publicRoute) {
        const response = NextResponse.redirect(new URL("/notes", request.url));
        setAuthCookies(
          response,
          newSession.accessToken,
          newSession.refreshToken,
        );
        return response;
      }

      const response = NextResponse.next();
      setAuthCookies(response, newSession.accessToken, newSession.refreshToken);
      return response;
    }
  }

  if (privateRoute) {
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    clearAuthCookies(response);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/notes/:path*", "/sign-in", "/sign-up"],
};