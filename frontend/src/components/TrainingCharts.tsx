import { GENRE_LABEL, perGenreAccuracy, pct, results } from "../lib/genres";
import { LineChart } from "./LineChart";

const PINK = "#EF9FBC";
const TEAL = "#65C3C8";

/** Learning curves from the training run, plus test accuracy for each genre. */
export const TrainingCharts = () => {
  const h = results.history;
  const fineTune = results.stage1_epochs + 1;

  return (
    <div className="w-full h-full flex flex-col gap-8 justify-center" id="training">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold">Training</h2>
        <p className="text-sm">
          Epochs 1 to {results.stage1_epochs} train only the new classification head. From epoch{" "}
          {fineTune} (dashed line), the last 30 layers of ResNet152 are fine-tuned too.
        </p>
      </div>
      <LineChart
        series={[
          { label: "Training accuracy", data: h.accuracy, color: PINK },
          { label: "Validation accuracy", data: h.val_accuracy, color: TEAL },
        ]}
        marker={fineTune}
        format={(v) => pct(v, 0)}
      />
      <LineChart
        series={[
          { label: "Training loss", data: h.loss, color: PINK },
          { label: "Validation loss", data: h.val_loss, color: TEAL },
        ]}
        marker={fineTune}
        format={(v) => v.toFixed(1)}
      />
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-semibold">Test accuracy by genre</h3>
        {perGenreAccuracy.map(({ genre, accuracy }) => (
          <div key={genre} className="grid grid-cols-[8.5rem_1fr_3.5rem] items-center gap-3 text-sm font-semibold">
            <span className="whitespace-nowrap">{GENRE_LABEL[genre]}</span>
            <div className="h-3 rounded-full border-2 border-dashed border-quaternary overflow-hidden">
              <div className="h-full bg-primary" style={{ width: pct(accuracy) }} />
            </div>
            <span className="text-end tabular-nums">{pct(accuracy)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
