import { Line } from "react-chartjs-2";
import { CategoryScale, Chart, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import { GENRE_LABEL, perGenreAccuracy, pct, results } from "../lib/genres";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const PINK = "#EF9FBC";
const TEAL = "#65C3C8";

const line = (label: string, data: number[], color: string) => ({
  label,
  data,
  fill: false,
  backgroundColor: color,
  borderColor: color,
});

const options = { responsive: true, scales: { y: { beginAtZero: false } } };

/** Learning curves from the training run, plus test accuracy for each genre. */
export const TrainingCharts = () => {
  const h = results.history;
  const labels = h.loss.map((_, i) => `Epoch ${i + 1}`);

  return (
    <div className="w-full h-full flex flex-col gap-8 justify-center" id="training">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold">Training</h2>
        <p className="text-sm">
          Epochs 1 to {results.stage1_epochs} train only the new classification head. From epoch{" "}
          {results.stage1_epochs + 1}, the last 30 layers of ResNet152 are fine-tuned too.
        </p>
      </div>
      <div className="min-h-[10rem]">
        <Line
          data={{
            labels,
            datasets: [line("Training accuracy", h.accuracy, PINK), line("Validation accuracy", h.val_accuracy, TEAL)],
          }}
          options={options}
        />
      </div>
      <div className="min-h-[10rem]">
        <Line
          data={{ labels, datasets: [line("Training loss", h.loss, PINK), line("Validation loss", h.val_loss, TEAL)] }}
          options={options}
        />
      </div>
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
