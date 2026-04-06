import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const { auth, handlers } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth;

      const isAuthPage = request.nextUrl.pathname.startsWith("/login");

      if (!isLoggedIn && !isAuthPage) {
        return Response.redirect(new URL("/login", request.url));
      }


      return true;
    },

  
  },
});

console.log("AUTH EXPORT:", typeof auth);