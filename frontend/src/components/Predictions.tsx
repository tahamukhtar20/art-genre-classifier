import type { CSSProperties } from "react";
import { GENRES, GENRE_LABEL, GENRE_SHORT, type Scores } from "../lib/genres";

/** daisyUI radial-progress ring; its size and value come from CSS variables. */
const Ring = ({ value, size, thickness, className }: { value: number; size: string; thickness: string; className: string }) => (
  <div
    className={`radial-progress transition-all duration-300 ${className}`}
    style={{ "--value": value * 100, "--size": size, "--thickness": thickness } as CSSProperties}
    role="progressbar"
    aria-valuenow={Math.round(value * 100)}
  >
    {`${Math.round(value * 100)}%`}
  </div>
);

/** The top genre in a big ring, the other four in small ones; placeholders until there is a result. */
export const Predictions = ({ scores }: { scores: Scores | null }) => {
  const ranked = scores ? [...GENRES].sort((a, b) => scores[b] - scores[a]) : null;
  const top = ranked?.[0];
  const rest = ranked ? ranked.slice(1) : GENRES.slice(1);

  return (
    <div className="max-w-2xl w-full flex md:flex-row flex-col-reverse justify-between gap-4 p-6 border-2 rounded-3xl shadow-lg border-quaternary">
      <div className="flex flex-col justify-between items-center w-full gap-4">
        <div className="text-2xl md:block hidden font-semibold text-start w-full">Predictions</div>
        <div className="grid grid-cols-4 w-full gap-2">
          {rest.map((genre) => (
            <div className="flex flex-col items-center gap-2" key={genre}>
              <Ring
                value={scores?.[genre] ?? 0}
                size="4rem"
                thickness="0.5rem"
                className={scores ? "text-red-800" : "text-quaternary/20"}
              />
              <span className="font-semibold text-sm whitespace-nowrap">{GENRE_SHORT[genre]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center items-center md:pr-4 pt-4 gap-2 shrink-0">
        {top && scores ? (
          <>
            <Ring value={scores[top]} size="8rem" thickness="1rem" className="text-green-800" />
            <span className="font-semibold text-2xl whitespace-nowrap">{GENRE_LABEL[top]}</span>
          </>
        ) : (
          <>
            <div className="w-32 aspect-square rounded-full border-[1rem] border-quaternary/10 grid place-items-center text-3xl font-semibold text-quaternary/30">
              ?
            </div>
            <span className="font-semibold text-lg text-quaternary/60 whitespace-nowrap">No prediction yet</span>
          </>
        )}
      </div>
      <div className="text-2xl md:hidden block font-semibold text-start w-full">Predictions</div>
    </div>
  );
};
