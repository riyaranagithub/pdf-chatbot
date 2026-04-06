'use client'
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  console.log("session: ", session);

  const router = useRouter();

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">


        <button onClick={() => signOut()} className="absolute right-4 top-4  bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 ">
          Logout
        </button>
        <div className="flex items-center space-y-4 flex-col ">
          <h2>Welcome {session.user?.name}</h2>
          <button onClick={() => {
            router.push("/chat-bot")
          }} className="ml-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
            Go to Chat Bot

          </button>
        </div>

      </div>
    );
  }
}