import { NextRequest, NextResponse } from "next/server";
import { refreshSessionServer } from "./lib/api/serverApi";

const notesRoutes = ["/notes"];
const profileRoutes = ["/profile"];
const publicRoutes = ["/sign-in", "/sign-up"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isNotesRoute = notesRoutes.some((route) => pathname.startsWith(route));
  const isProfileRoute = profileRoutes.some((route) => pathname.startsWith(route));
  const needsRefreshCheck = isNotesRoute || isProfileRoute;

  if (!accessToken && refreshToken && needsRefreshCheck) {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const refreshed = await refreshSessionServer(cookieHeader);

    if (refreshed?.accessToken) {
      const response = NextResponse.next();

      response.cookies.set("accessToken", refreshed.accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      if (refreshed.refreshToken) {
        response.cookies.set("refreshToken", refreshed.refreshToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        });
      }

      return response;
    }

    const fallbackUrl = isNotesRoute ? "/sign-in" : "/";
    const response = NextResponse.redirect(new URL(fallbackUrl, request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  if (!accessToken && isNotesRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!accessToken && isProfileRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (accessToken && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
