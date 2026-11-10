import results from "../results.json";

/** The model's classes, in its output order (see the training notebook). */
export const GENRES = ["abstract", "cityscape", "portrait", "landscape", "animal-painting"] as const;
export type Genre = (typeof GENRES)[number];
export type Scores = Record<Genre, number>;

export const GENRE_LABEL: Record<Genre, string> = {
  abstract: "Abstract",
  cityscape: "Cityscape",
  portrait: "Portrait",
  landscape: "Landscape",
  "animal-painting": "Animal painting",
};

/** Short names for tight spots (the small prediction rings). */
export const GENRE_SHORT: Record<Genre, string> = { ...GENRE_LABEL, "animal-painting": "Animals" };

/** Test accuracy for each genre: the diagonal of the confusion matrix over its row total. */
export const perGenreAccuracy = GENRES.map((genre, i) => {
  const row = results.confusion_matrix[i];
  return { genre, accuracy: row[i] / row.reduce((a, b) => a + b, 0) };
});

export const pct = (x: number, digits = 1) => `${(x * 100).toFixed(digits)}%`;

export { results };
