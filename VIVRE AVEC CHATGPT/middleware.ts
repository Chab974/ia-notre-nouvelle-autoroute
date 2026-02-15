import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedPaths = ["/dashboard", "/formation"];

function isProtectedPath(pathname: string) {
  return protectedPaths.some(
    (pathPrefix) => pathname === pathPrefix || pathname.startsWith(`${pathPrefix}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedPath(pathname) && !user) {
    const redirectTo = new URL("/login", request.url);
    redirectTo.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(redirectTo);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
