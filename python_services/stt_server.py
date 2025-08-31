import io, json, asyncio, websockets, base64, numpy as np, soundfile as sf # type: ignore
from faster_whisper import WhisperModel # type: ignore

model = WhisperModel("base", device="cpu")  # change to "small" if GPU available

async def handle(ws):
    pcm_parts = []
    async for msg in ws:
        obj = json.loads(msg)
        if obj.get("type") == "audio":
            audio_bytes = base64.b64decode(obj["data"])
            data, sr = sf.read(io.BytesIO(audio_bytes), dtype="float32")
            if sr != 16000:
                # Simplify: assume correct format for now
                pass
            pcm_parts.append(data)
            segments, _ = model.transcribe(np.concatenate(pcm_parts), beam_size=1)
            partial = "".join([s.text for s in segments])
            await ws.send(json.dumps({"type": "partial", "text": partial}))
        elif obj.get("type") == "end":
            audio = np.concatenate(pcm_parts)
            segments, _ = model.transcribe(audio, beam_size=5)
            text = "".join([s.text for s in segments]).strip()
            await ws.send(json.dumps({"type": "final", "text": text}))
            break

async def main():
    async with websockets.serve(handle, "0.0.0.0", 9001):
        print("STT server running on ws://localhost:9001")
        await asyncio.Future()

asyncio.run(main())

