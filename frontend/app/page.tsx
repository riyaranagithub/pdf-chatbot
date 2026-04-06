"use client";

import { useState } from "react";

import { signOut,useSession } from "next-auth/react"



export default function UploadUI() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
 
   const { data: session } = useSession()
    console.log(session?.user?.email)

const handleUpload = async () => {
  if (!file) {
    setMessage("Please select a file");
    return;
  }

  if (!session) {
    setMessage("Please login first");
    return;
  }

  setLoading(true);
  setMessage("");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("userEmail", session.user?.email || "unknown");


  try {
    console.log("userEmail:", formData.get("userEmail"), "fileName:", formData.get("fileName"));
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/file`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) throw new Error();

    setMessage("File uploaded successfully ✅");
  } catch (error) {
    setMessage("Upload failed ❌");
  }

  setLoading(false);
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
      <div className="absolute top-4 right-4">

        <button
          onClick={() => signOut()}
          className="mb-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition cursor-pointer"
        >
          Sign Out
        </button>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-md w-87.5 text-center">

        <h1 className="text-xl font-semibold mb-4">
          📄 Upload Document
        </h1>

        <input
          type="file"
          className="mb-4 w-full border p-2 rounded-lg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {message && (
          <p className="mt-3 text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}