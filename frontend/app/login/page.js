"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
      <div className="bg-white p-6 rounded-2xl shadow-md w-87.5 text-center">
        <h1 className="text-2xl">Sign In with Google</h1>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition cursor-pointer"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}