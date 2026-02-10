import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

const protectedRoutes = ["/dashboard", "/admin"];
const adminRoutes = ["/admin"];
const publicRoutes = ["/login", "/register", "/"];

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
    const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
    const isPublicRoute = publicRoutes.some((route) => path === route);

    const cookie = req.cookies.get("session")?.value;
    const session = cookie ? await decrypt(cookie).catch(() => null) : null;

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    if (isAdminRoute && session?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    if (isPublicRoute && session && path !== "/") {
        if (session.role === "ADMIN") {
            return NextResponse.redirect(new URL("/admin", req.nextUrl));
        }
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
