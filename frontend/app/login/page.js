"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthPage() {
  const { data: session } = useSession();
   console.log("session: ",session);
  if (session) {
    return (
      <div>
        <h2>Welcome {session.user.name}</h2>

        <button onClick={() => signOut()}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
       
      < div className="bg-white p-6 rounded-2xl shadow-md w-87.5 text-center">
      <h1 className="text-2xl "> SignIn with Google </h1>

      <button onClick={() => signIn("google", { callbackUrl: "/" })} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition cursor-pointer">
          SignIn
      </button>
        </div>
    </div>
  );
}