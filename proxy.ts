import { NextRequest, NextResponse } from "next/server";

const privateRoutes = ["/notes"];
const authRoutes = ["/sign-in", "/sign-up"];

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

function isPrivateRoute(pathname: string) {
  return privateRoutes.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string) {
  return authRoutes.some((route) => pathname.startsWith(route));
}

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

async function refreshSession(refreshToken: string): Promise<RefreshResponse | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

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
  refreshToken: string
) {
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

function clearAuthCookies(response: NextResponse) {
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

  const isPrivate = isPrivateRoute(pathname);
  const isAuth = isAuthRoute(pathname);

  if (!isPrivate && !isAuth) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/notes", request.url));
    }

    return NextResponse.next();
  }

  if (refreshToken) {
    const refreshedSession = await refreshSession(refreshToken);

    if (refreshedSession) {
      if (isAuth) {
        const response = NextResponse.redirect(new URL("/notes", request.url));
        setAuthCookies(
          response,
          refreshedSession.accessToken,
          refreshedSession.refreshToken
        );
        return response;
      }

      const response = NextResponse.next();
      setAuthCookies(
        response,
        refreshedSession.accessToken,
        refreshedSession.refreshToken
      );
      return response;
    }
  }

  if (isPrivate) {
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    clearAuthCookies(response);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/notes/:path*", "/sign-in", "/sign-up"],
};