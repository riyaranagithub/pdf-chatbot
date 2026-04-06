"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export default function UploadUI() {

    const { data: session } = useSession();

    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

    // Chat states
    const [question, setQuestion] = useState("");
    const [chat, setChat] = useState<
        { role: "user" | "bot"; text: string }[]
    >([]);



    // Dummy PDF list (replace with backend later)
    const [pdfs, setPdfs] = useState([
        { _id: "1", filename: "example1.pdf" }
    ]);



    useEffect(() => {
        if (!session?.user?.email) return;

        const fetchPdfs = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/pdfRoute/get_pdfs?user_email=${session?.user?.email}`
                );

                const data = await res.json();
                console.log("Fetched PDFs:", data);
                setPdfs(data.files);
            } catch (err) {
                console.error("Error fetching PDFs:", err);
            }
        };

        fetchPdfs();
    }, [session,loading]);

    // Upload PDF
    const handleUpload = async () => {
        if (!file) return setMessage("Please select a file");
        if (!session) return setMessage("Please login first");

        setLoading(true);
        setMessage("");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("userEmail", session.user?.email || "unknown");

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/file`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!res.ok) throw new Error();

            setMessage("File uploaded successfully ✅");
        } catch {
            setMessage("Upload failed ❌");
        }

        setLoading(false);
    };

    // Chat UI (dummy response)
    const handleAsk = async () => {
        if (!question) return;

        // add user message
        setChat((prev) => [...prev, { role: "user", text: question }]);

        // dummy bot response (replace with backend later)
        setChat((prev) => [
            ...prev,
            { role: "user", text: question },
            { role: "bot", text: "🤖 Answer will come from backend here..." },
        ]);

        setQuestion("");
    };

    return (
        <div className="h-screen flex bg-gray-100 text-black">

            {/* 🔹 Sidebar (PDF List) */}
            <div className="w-1/4 bg-white shadow-lg p-4 flex flex-col">
                <h2 className="text-xl font-semibold mb-4">📄 Your PDFs</h2>

                <div className="flex-1 overflow-y-auto space-y-2">
                    {pdfs.map((pdf) => (
                        <div key={pdf._id} className={`p-3 rounded-lg cursor-pointer ${selectedPdf === pdf.filename ? "bg-blue-500 text-white" : "bg-gray-200"}`} onClick={() => setSelectedPdf(pdf.filename)}>
                            {pdf.filename}
                        </div>
                    ))}
                </div>

                {/* File Upload */}
                <div className="mt-4">
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        className="mb-2"
                    />
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                    >
                        {loading ? "Uploading..." : "Upload PDF"}
                    </button>
                    {message && <p className="mt-2 text-center">{message}</p>}
                </div>

                {/* Logout */}
                <button
                    onClick={() => signOut()}
                    className="mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            {/* 🔹 Chat Section */}
            <div className="flex-1 flex flex-col p-6">

                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-2xl font-semibold">
                        💬 Chat with {selectedPdf || "your PDF"}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {session?.user?.email}
                    </p>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 bg-white rounded-xl shadow p-4 overflow-y-auto mb-4">
                    {chat.length === 0 && (
                        <p className="text-gray-400">Start asking questions...</p>
                    )}

                    {chat.map((msg, i) => (
                        <div
                            key={i}
                            className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`px-4 py-2 rounded-xl max-w-[70%] ${msg.role === "user"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask something from selected PDF..."
                        className="flex-1 border p-3 rounded-xl outline-none"
                    />
                    <button
                        onClick={handleAsk}
                        className="bg-green-500 text-white px-6 rounded-xl hover:bg-green-600"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );

}