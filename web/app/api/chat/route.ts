import { NextResponse } from "next/server";


export async function POST(req: Request) {
  const { prompt } = await req.json();
  const resp = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: "gemma:2b",
      prompt,
      stream: false,
    }),
  });
  const data = await resp.json();
  return NextResponse.json({ reply: data.response });
}
