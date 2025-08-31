from fastapi import FastAPI, Body
import requests

OLLAMA_URL = "http://localhost:11434/api/embeddings"
MODEL = "nomic-embed-text"

app = FastAPI()

@app.post("/embed")
def embed(payload: dict = Body(...)):
    text = payload.get("text", "")
    resp = requests.post(OLLAMA_URL, json={"model": MODEL, "prompt": text})
    vec = resp.json().get("embedding")
    return {"embedding": vec}
