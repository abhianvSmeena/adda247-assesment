import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // Call your Python TTS server (running on port 8002 for example)
    const resp = await fetch("http://localhost:8002/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!resp.ok) {
      return NextResponse.json({ error: "TTS server error" }, { status: 500 });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("TTS API error:", err);
    return NextResponse.json({ error: "Invalid TTS response" }, { status: 500 });
  }
}

