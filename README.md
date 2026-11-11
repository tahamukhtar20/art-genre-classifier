# Art Genre Classifier

Live at [art.tahamukhtar.com](https://art.tahamukhtar.com).

Upload a painting and a fine-tuned ResNet152 tells you which of five genres it belongs to: abstract, cityscape, portrait, landscape or animal painting.

## Results

87.6% accuracy on 1,470 held-out test paintings.

| Genre | Test accuracy | Most often confused with |
|---|---|---|
| Portrait | 95.7% | |
| Abstract | 93.0% | |
| Landscape | 85.7% | cityscape |
| Animal painting | 84.8% | abstract |
| Cityscape | 78.7% | landscape |

## How it's trained

[`notebook/Art Genre Classifier.ipynb`](notebook/Art%20Genre%20Classifier.ipynb) runs on a Kaggle GPU with the [WikiArt genre dataset](https://www.kaggle.com/datasets/ipythonx/wikiart-gangogh-creating-art-gan).

- Data: Up to 2,000 paintings per genre (9,799 in total), picked with a fixed seed. Stratified 70/15/15 split into training, validation and test sets. The test set is used once, at the end.
- Model: ResNet152 pre-trained on ImageNet at 300 × 300, global average pooling, a 1,024-unit dense layer with dropout, and a 5-way softmax. Light augmentation: flips, rotation, shifts and zoom.
- Training: First only the new head trains, with the network frozen (Adam, 1e-3). Then the last 30 layers are unfrozen, BatchNorm stays frozen, and everything trains at 1e-5. Both stages use early stopping on validation loss.

The trained model is converted to ONNX and quantised to int8 for serving. It's on Hugging Face at [tahamukhtar20/art-genre-classifier](https://huggingface.co/tahamukhtar20/art-genre-classifier).

## Project layout

```
notebook/   Training notebook (Keras)
backend/    FastAPI + ONNX Runtime API, deployed as a Vercel Python function
frontend/   React + Vite + Tailwind/daisyUI site, deployed on Cloudflare Workers
```

## API

- `GET /health` loads the model if needed and returns `{"status": "ready", "error": null}` (or `"error"` with a message). The site calls it as soon as the page opens, so a sleeping function wakes up while you pick an image.
- `POST /classify/` takes `{"image": "<base64>"}` and returns a probability for each genre.

## Running locally

Backend (downloads the model from Hugging Face on the first request):

```bash
cd backend
pip install -r requirements.txt uvicorn
uvicorn main:app --port 8000
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env.local   # VITE_API_URL points at the backend
npm run dev
```

## Deploying

- Backend: `cd backend && vercel deploy --prod`
- Frontend: `cd frontend && npm run build && npx wrangler deploy`, with `VITE_API_URL` set to the backend's URL at build time
