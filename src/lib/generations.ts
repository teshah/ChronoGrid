export type Generation = {
  name: string;
  nickname: string;
  startYear: number;
  endYear: number;
  definingTrait: string;
};

export const generationCohorts: Generation[] = [
  { name: 'Generation Alpha', nickname: 'Alphas', startYear: 2013, endYear: 2025, definingTrait: "As children of Millennials, they are the first generation born entirely in the 21st century, completely integrated with technology from birth." },
  { name: 'Generation Z', nickname: 'Zoomers', startYear: 1997, endYear: 2012, definingTrait: "True digital natives who grew up with smartphones and social media as the norm, they value authenticity and social justice." },
  { name: 'Millennials (Gen Y)', nickname: 'Pioneers', startYear: 1981, endYear: 1996, definingTrait: "Digital pioneers who came of age during the internet explosion and were shaped by events like 9/11 and the 2008 recession." },
  { name: 'Generation X', nickname: 'Independents', startYear: 1965, endYear: 1980, definingTrait: "Bridged the gap between the analog and digital worlds, they grew up with a sense of independence as \"latchkey kids.\"." },
  { name: 'Baby Boomers', nickname: 'Boomers', startYear: 1946, endYear: 1964, definingTrait: "A massive post-WWII generation associated with major social changes, economic optimism, and the Civil Rights Movement." },
  { name: 'The Silent Generation', nickname: 'Silents', startYear: 1928, endYear: 1945, definingTrait: "Growing up during the Great Depression and WWII, they are known for their conformity, thriftiness, and respect for authority." },
  { name: 'The Greatest Generation', nickname: 'Heroes', startYear: 1901, endYear: 1927, definingTrait: "Came of age during the Great Depression and went on to fight in World War II, characterized by resilience and civic duty." },
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

export type GenerationSource = {
  sourceType: string;
  examples: string;
  role: string;
};

export const generationSources: GenerationSource[] = [
    { sourceType: 'Primary Research Center', examples: 'Pew Research Center', role: 'Establishes the standard birth year ranges and definitions based on extensive demographic analysis.' },
    { sourceType: 'Sociologists & Demographers', examples: 'Strauss & Howe', role: 'Originate generational theories and coin key terms (e.g., "Millennial").' },
    { sourceType: 'Marketing & Research Firms', examples: 'Nielsen, Gallup', role: 'Study consumer and workplace behavior, shaping the business perception of each cohort.' },
    { sourceType: 'Media & Authors', examples: 'Douglas Coupland', role: 'Popularize the names, nicknames, and defining cultural traits (e.g., "Generation X").' },
    { sourceType: 'Government Agencies', examples: 'U.S. Census Bureau', role: 'Provide the raw statistical and demographic data that other researchers use for their analysis.' }
];
