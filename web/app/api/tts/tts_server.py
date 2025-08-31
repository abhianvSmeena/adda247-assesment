from fastapi import FastAPI
from pydantic import BaseModel
import base64
import subprocess
import tempfile

app = FastAPI()

class TTSRequest(BaseModel):
    text: str

@app.post("/tts")
async def tts(req: TTSRequest):
    # Save temporary wav file from Piper CLI
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as f:
        wav_path = f.name

    subprocess.run([
        "piper", "--model", "en_US-amy-medium.onnx", "--output_file", wav_path
    ], input=req.text.encode("utf-8"), check=True)

    with open(wav_path, "rb") as f:
        audio_b64 = base64.b64encode(f.read()).decode("utf-8")

    return {"audio_wav_base64": audio_b64}
