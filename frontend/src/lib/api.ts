import { useEffect, useState } from "react";
import { GENRES, type Scores } from "./genres";

/** Address of the classifier API (the Vercel deployment of backend/); set VITE_API_URL at build time. */
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export type ServerStatus = "waking" | "ready" | "error";

/**
 * Pings /health as soon as the page opens. That wakes a sleeping server and has it load the
 * model while the visitor is still choosing a painting. Retries until it answers.
 */
export const useServerStatus = (): ServerStatus => {
  const [status, setStatus] = useState<ServerStatus>("waking");
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
        const body = res.ok ? await res.json() : null;
        if (body?.status === "ready" || body?.status === "error") {
          if (!stopped) setStatus(body.status);
          return;
        }
      } catch {
        // no answer yet: the server is still starting
      }
      if (!stopped) timer = setTimeout(check, 2500);
    };
    check();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);
  return status;
};

/**
 * The model sees a 300 x 300 image (stretched, as in training), so resize in the browser
 * before uploading. Keeps requests small, well under the API's 4.5 MB body limit.
 */
const toModelInput = (src: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 300;
      canvas.getContext("2d")!.drawImage(img, 0, 0, 300, 300);
      resolve(canvas.toDataURL("image/jpeg", 0.95).split(",")[1]);
    };
    img.onerror = () => reject(new Error("Could not read the image"));
    img.src = src;
  });

export async function classify(src: string): Promise<Scores> {
  const res = await fetch(`${API_URL}/classify/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: await toModelInput(src) }),
  });
  if (!res.ok) throw new Error(`The server answered ${res.status}`);
  const body = await res.json();
  return Object.fromEntries(GENRES.map((g) => [g, Number(body[g]) || 0])) as Scores;
}
