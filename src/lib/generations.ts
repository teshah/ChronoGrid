export type Generation = {
  name: string;
  nickname: string;
  startYear: number;
  endYear: number;
};

export const generationCohorts: Generation[] = [
  { name: 'Generation Alpha', nickname: 'Alphas', startYear: 2013, endYear: 2025 },
  { name: 'Generation Z', nickname: 'Zoomers', startYear: 1997, endYear: 2012 },
  { name: 'Millennials (Gen Y)', nickname: 'Pioneers', startYear: 1981, endYear: 1996 },
  { name: 'Generation X', nickname: 'Independents', startYear: 1965, endYear: 1980 },
  { name: 'Baby Boomers', nickname: 'Boomers', startYear: 1946, endYear: 1964 },
  { name: 'The Silent Generation', nickname: 'Silents', startYear: 1928, endYear: 1945 },
  { name: 'The Greatest Generation', nickname: 'Heroes', startYear: 1901, endYear: 1927 },
];

export function getGeneration(year: number): Generation | null {
  if (isNaN(year)) return null;

  for (const cohort of generationCohorts) {
    if (year >= cohort.startYear && year <= cohort.endYear) {
      return cohort;
    }
  }
  return null;
}
