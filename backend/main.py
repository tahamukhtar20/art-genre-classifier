"""Art Genre Classifier API (FastAPI + ONNX Runtime, runs as a Vercel Python function).

The model is fetched from the Hugging Face model repo on the first request after a cold start
and kept in memory while the instance stays warm. The frontend calls `/health` as soon as the
page opens, so the download and load usually finish while the visitor is still picking an image.
"""

import base64
import os
import threading
import urllib.request
from io import BytesIO

import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

MODEL_URL = os.environ.get(
    "MODEL_URL",
    "https://huggingface.co/tahamukhtar20/art-genre-classifier/resolve/main/art_genre_classifier.int8.onnx",
)
MODEL_PATH = os.environ.get("MODEL_PATH", "/tmp/art_genre_classifier.int8.onnx")
# Output order of the network, fixed at training time (see the notebook).
CLASSES = ["abstract", "cityscape", "portrait", "landscape", "animal-painting"]
SIZE = 300
# keras.applications.resnet.preprocess_input ("caffe" mode): RGB -> BGR, minus the ImageNet mean.
BGR_MEAN = np.array([103.939, 116.779, 123.68], dtype=np.float32)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

_lock = threading.Lock()
_session: ort.InferenceSession | None = None


def session() -> ort.InferenceSession:
    """Download (once per instance) and load the model."""
    global _session
    with _lock:
        if _session is None:
            if not os.path.exists(MODEL_PATH):
                tmp = MODEL_PATH + ".part"
                urllib.request.urlretrieve(MODEL_URL, tmp)
                os.replace(tmp, MODEL_PATH)
            _session = ort.InferenceSession(MODEL_PATH, providers=["CPUExecutionProvider"])
        return _session


@app.get("/health")
def health():
    """Loads the model if this instance hasn't yet, then reports 'ready' (or 'error')."""
    try:
        session()
        return {"status": "ready", "error": None}
    except Exception as e:
        return {"status": "error", "error": str(e)}


class ImageParams(BaseModel):
    image: str  # base64, without the data URL prefix


def preprocess(img: Image.Image) -> np.ndarray:
    arr = np.asarray(img.convert("RGB").resize((SIZE, SIZE), Image.BILINEAR), dtype=np.float32)
    return np.ascontiguousarray(arr[..., ::-1] - BGR_MEAN)[np.newaxis]


@app.post("/classify/")
def classify(params: ImageParams):
    try:
        img = Image.open(BytesIO(base64.b64decode(params.image)))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the image")
    sess = session()
    probs = sess.run(None, {sess.get_inputs()[0].name: preprocess(img)})[0][0]
    return {name: float(p) for name, p in zip(CLASSES, probs)}
