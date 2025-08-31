"use client";

import { useEffect, useRef, useState } from "react";
import MicRecorder from "./components/MicRecorder";

export default function Page() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  async function sendMessage(text: string) {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ prompt: text }),
    });
    const data = await res.json();
    const reply = data.reply;

    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

    // auto-play TTS
    const ttsRes = await fetch("/api/tts", {
      method: "POST",
      body: JSON.stringify({ text: reply }),
    });
    const ttsData = await ttsRes.json();
    const audio = new Audio("data:audio/wav;base64," + ttsData.audio_wav_base64);
    audio.play();
  }

  // auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="p-4 shadow-md bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Adda AI 💬
        </h1>
      </header>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs shadow-md ${
                m.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <footer className="p-4 bg-white dark:bg-gray-800 flex items-center gap-2 border-t">
        <input
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
        />
        <button
          onClick={() => {
            sendMessage(input);
            setInput("");
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
        >
          Send
        </button>
        <MicRecorder onFinalTranscript={sendMessage} />
      </footer>
    </main>
  );
}
