import { NextResponse } from "next/server";


export async function POST(req: Request) {
  const { text } = await req.json();
  const resp = await fetch("http://localhost:5003/embed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await resp.json();
  return NextResponse.json(data);
}
