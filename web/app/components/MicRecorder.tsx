"use client";

import { useEffect, useRef, useState } from "react";

export default function MicRecorder({ onFinalTranscript }: { onFinalTranscript: (t: string) => void }) {
  const [recording, setRecording] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (recording) {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_STT_WS!);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "partial") {
          console.log("Partial:", msg.text);
        } else if (msg.type === "final") {
          console.log("Final:", msg.text);
          onFinalTranscript(msg.text);
        }
      };

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        mediaRecorder.start(500);

        mediaRecorder.ondataavailable = async (e) => {
          const arrayBuffer = await e.data.arrayBuffer();
          const b64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          ws.send(JSON.stringify({ type: "audio", data: b64 }));
        };

        ws.onclose = () => mediaRecorder.stop();

        // stop after button toggled
        const stopRec = () => {
          mediaRecorder.stop();
          ws.send(JSON.stringify({ type: "end" }));
        };
        (ws as any).stopRec = stopRec;
      });
    } else {
      wsRef.current?.close();
    }
  }, [recording]);

  return (
    <button
      onClick={() => setRecording(!recording)}
      className={`px-3 py-2 rounded ${recording ? "bg-red-500" : "bg-green-500"} text-white`}
    >
      {recording ? "Stop Recording" : "Start Recording"}
    </button>
  );
}
