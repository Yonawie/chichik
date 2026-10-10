import { NextResponse, type NextRequest } from "next/server";
import {
  encodeGate,
  GATE_COOKIE,
  GATE_COOKIE_OPTIONS,
  parseGate,
} from "@/lib/auth/gate";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user, supabase } = await updateSession(request);

  const isAppRoute = pathname.startsWith("/app");
  const isAdminRoute = pathname.startsWith("/admin");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (!isSupabaseConfigured()) {
    return response;
  }

  if ((isAppRoute || isAdminRoute || isOnboarding) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }

  if (user && (isAppRoute || isAdminRoute || isOnboarding)) {
    let gate = parseGate(request.cookies.get(GATE_COOKIE)?.value);

    // Only hit profiles when gate cookie is missing (login / first request).
    if (!gate && supabase) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        gate = {
          onboardingCompleted: Boolean(profile.onboarding_completed),
          role: profile.role === "admin" ? "admin" : "student",
        };
        response.cookies.set(
          GATE_COOKIE,
          encodeGate(gate.onboardingCompleted, gate.role),
          GATE_COOKIE_OPTIONS,
        );
      }
    }

    if (isAdminRoute && gate?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/app";
      return NextResponse.redirect(url);
    }

    if (isAppRoute && gate && !gate.onboardingCompleted && !isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    if (isOnboarding && gate?.onboardingCompleted) {
      const url = request.nextUrl.clone();
      url.pathname = "/app";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
