"""Art Genre Classifier API.

The model loads in a background thread, so the server answers straight away and `/health`
can tell the frontend whether it is still waking up ("loading") or ready for inference.
"""

import base64
import os
import threading
from io import BytesIO

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

MODEL_PATH = os.environ.get("MODEL_PATH", "model/art_genre_classifier.keras")
# Output order of the network, fixed at training time (see the notebook).
CLASSES = ["abstract", "cityscape", "portrait", "landscape", "animal-painting"]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

state = {"status": "loading", "model": None, "error": None}


def load_model():
    try:
        # Imported here so the web server starts before TensorFlow finishes loading.
        import keras

        state["model"] = keras.models.load_model(MODEL_PATH)
        state["status"] = "ready"
    except Exception as e:  # report it on /health instead of crashing the server
        state["status"] = "error"
        state["error"] = str(e)


@app.on_event("startup")
def start_loading():
    threading.Thread(target=load_model, daemon=True).start()


@app.get("/health")
def health():
    """'loading' while the model loads, 'ready' when it can classify, 'error' if loading failed."""
    return {"status": state["status"], "error": state["error"]}


class ImageParams(BaseModel):
    image: str  # base64, without the data URL prefix


def preprocess(img: Image.Image) -> np.ndarray:
    from keras.applications.resnet import preprocess_input

    arr = np.asarray(img.convert("RGB").resize((300, 300)), dtype=np.float32)
    return preprocess_input(arr[np.newaxis])


@app.post("/classify/")
def classify(params: ImageParams):
    if state["status"] != "ready":
        raise HTTPException(status_code=503, detail=f"Model is {state['status']}")
    try:
        img = Image.open(BytesIO(base64.b64decode(params.image)))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the image")
    probs = state["model"].predict(preprocess(img), verbose=0)[0]
    return {name: float(p) for name, p in zip(CLASSES, probs)}
