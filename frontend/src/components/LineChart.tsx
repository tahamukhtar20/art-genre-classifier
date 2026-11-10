type Series = { label: string; data: number[]; color: string };

const W = 400;
const H = 190;
const PAD = { top: 10, right: 10, bottom: 26, left: 38 };

/** Rounded tick values covering [min, max]. */
function ticks(min: number, max: number, count = 4): number[] {
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  const out = [+(Math.floor(min / step) * step).toFixed(6)];
  while (out[out.length - 1] < max) out.push(+(out[out.length - 1] + step).toFixed(6));
  return out;
}

/**
 * A small dependency-free line chart for per-epoch curves. `marker` draws a dashed vertical
 * line before that epoch (1-based), e.g. where fine-tuning starts.
 */
export const LineChart = ({ series, marker, format }: { series: Series[]; marker?: number; format: (v: number) => string }) => {
  const n = series[0].data.length;
  const all = series.flatMap((s) => s.data);
  const yt = ticks(Math.min(...all), Math.max(...all));
  const [lo, hi] = [yt[0], yt[yt.length - 1]];
  const x = (i: number) => PAD.left + (i / (n - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * (H - PAD.top - PAD.bottom);

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
        {series.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto text-[10px] fill-quaternary" role="img">
        {yt.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className="stroke-quaternary/10" />
            <text x={PAD.left - 6} y={y(v)} textAnchor="end" dominantBaseline="middle">
              {format(v)}
            </text>
          </g>
        ))}
        {series[0].data.map((_, i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle">
            {i + 1}
          </text>
        ))}
        {marker && (
          <line
            x1={(x(marker - 2) + x(marker - 1)) / 2}
            x2={(x(marker - 2) + x(marker - 1)) / 2}
            y1={PAD.top}
            y2={H - PAD.bottom}
            strokeDasharray="4 3"
            className="stroke-quaternary/50"
          />
        )}
        {series.map((s) => (
          <g key={s.label}>
            <polyline
              points={s.data.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            {s.data.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r={3} fill={s.color}>
                <title>{`${s.label}, epoch ${i + 1}: ${format(v)}`}</title>
              </circle>
            ))}
          </g>
        ))}
      </svg>
    </figure>
  );
};
