import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth } = req;
  const path = nextUrl.pathname;

  if (!auth && path !== "/login") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (auth && !auth.user?.username && !path.startsWith("/select-username")) {
    return NextResponse.redirect(new URL("/select-username", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};