import { auth } from "@/auth";

export const proxy = auth((req) => {
  // no custom logic needed
});

export const config = {
  matcher: [
    /*
      Protect everything EXCEPT:
      - /api/auth (NextAuth routes)
      - _next (static files)
      - favicon
    */
    "/((?!api/auth|_next|favicon.ico).*)",
  ],
};