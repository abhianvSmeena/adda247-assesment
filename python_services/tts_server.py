from fastapi import FastAPI, Body
import subprocess, tempfile, base64, os
import uvicorn

VOICE_PATH = "en_US-amy-low.onnx"
VOICE_CFG = "en_US-amy-low.onnx.json"

app = FastAPI()

@app.post("/tts")
def tts(payload: dict = Body(...)):
    text = payload.get("text", "")
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        out_path = f.name
    cmd = ["piper", "--model", VOICE_PATH, "--config", VOICE_CFG, "--output_file", out_path]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    p.communicate(input=text.encode("utf-8"))
    with open(out_path, "rb") as f:
        wav_b64 = base64.b64encode(f.read()).decode("ascii")
    os.remove(out_path)
    return {"audio_wav_base64": wav_b64}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5002)

