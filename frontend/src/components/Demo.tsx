import { useEffect, useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle, Target } from "lucide-react";
import sample from "../assets/sample.jpg";
import { classify, useServerStatus, type ServerStatus } from "../lib/api";
import { pct, results, type Scores } from "../lib/genres";
import { Predictions } from "./Predictions";
import { TrainingCharts } from "./TrainingCharts";

const STATUS: Record<ServerStatus, { text: string; icon: JSX.Element }> = {
  waking: {
    text: "Waking up the model…",
    icon: <LoaderCircle className="w-4 h-4 shrink-0 animate-spin text-teritiary" />,
  },
  ready: { text: "Model ready", icon: <CircleCheck className="w-4 h-4 shrink-0 text-green-700" /> },
  error: {
    text: "Model failed to load",
    icon: <CircleAlert className="w-4 h-4 shrink-0 text-red-700" />,
  },
};

export const Demo = () => {
  const [image, setImage] = useState<string | null>(null); // null: the sample painting
  const [scores, setScores] = useState<Scores | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A click while the model is still waking up is remembered and runs once it is ready.
  const [queued, setQueued] = useState(false);
  const status = useServerStatus();

  const run = () => {
    if (status !== "ready") return setQueued(true);
    setBusy(true);
    setError(null);
    classify(image ?? sample)
      .then(setScores)
      .catch((e: Error) => setError(`Could not classify the image: ${e.message}`))
      .finally(() => setBusy(false));
  };

  useEffect(() => {
    if (queued && status === "ready") {
      setQueued(false);
      run();
    }
  }, [queued, status]);

  const pick = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setScores(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-4 px-2 w-full scroll-mt-4" id="demo">
      <h1 className="text-4xl font-bold text-start">Demo</h1>
      <div className="border-b-2 border-dashed flex flex-col border-quaternary pb-4">
        <h2 className="text-2xl font-semibold">Instructions</h2>
        <ul className="list-disc list-inside text-md">
          <li>Upload a painting, or keep the sample</li>
          <li>Press Classify</li>
        </ul>
      </div>
      <div className="flex lg:flex-row flex-col gap-8">
        <div className="flex flex-col gap-4 lg:w-1/2 w-full">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => pick(e.target.files?.[0])}
            className="file-input w-full max-w-2xl file-input-bordered"
          />
          <div className="relative max-w-2xl w-full rounded-3xl overflow-hidden">
            <img
              src={image ?? sample}
              alt={image ? "Your painting" : "Sample painting: a city street with flowers"}
              className="w-full max-h-[32rem] object-cover object-center"
            />
            {!image && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 text-sm font-semibold">
                Sample painting
              </span>
            )}
          </div>
          <Predictions scores={scores} />
          <div className="flex flex-col gap-3">
            <button
              className="btn-primary btn w-fit"
              type="button"
              disabled={busy || queued || status === "error"}
              aria-busy={busy || queued}
              onClick={run}
            >
              {(busy || queued) && <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden />}
              {queued ? "Waiting for the model…" : busy ? "Classifying…" : "Classify"}
            </button>
            {error && (
              <p className="flex items-center gap-2 text-sm font-semibold text-red-700" role="alert">
                <CircleAlert className="w-4 h-4 shrink-0" />
                {error}
              </p>
            )}
            <div
              className="flex flex-col gap-1 w-fit p-3 border-2 border-dashed border-quaternary text-sm font-semibold"
              role="status"
              aria-live="polite"
            >
              <span className="flex items-center gap-2 whitespace-nowrap">
                {STATUS[status].icon}
                {STATUS[status].text}
              </span>
              <span className="flex items-center gap-2 whitespace-nowrap">
                <Target className="w-4 h-4 shrink-0 text-primary" />
                {pct(results.test_accuracy)} test accuracy
              </span>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 w-full h-full">
          <TrainingCharts />
        </div>
      </div>
    </div>
  );
};
