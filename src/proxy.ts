import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Exclude static assets, images, and the auth callback route.
    // The auth callback must NOT run the session middleware — it needs to read
    // the PKCE code verifier cookie untouched to complete exchangeCodeForSession.
    "/((?!_next/static|_next/image|favicon\\.ico|auth/(?:callback|signout)(?:[?#]|$)|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

