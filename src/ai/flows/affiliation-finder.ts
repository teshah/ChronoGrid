'use server';

/**
 * @fileOverview Identifies potential group affiliations based on birth date patterns.
 *
 * - findAffiliations - A function that identifies group affiliations based on provided birth dates.
 * - FindAffiliationsInput - The input type for the findAffiliations function, an array of dates.
 * - FindAffiliationsOutput - The return type for the findAffiliations function, a string describing potential affiliations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindAffiliationsInputSchema = z.array(
  z.string().describe('A date of birth in mm/dd/yyyy, mm/dd/yy, or yyyy-mm-dd format.')
).describe('An array of birth dates to analyze for potential group affiliations.');
export type FindAffiliationsInput = z.infer<typeof FindAffiliationsInputSchema>;

const FindAffiliationsOutputSchema = z.string().describe('A description of potential group affiliations based on the provided birth dates.');
export type FindAffiliationsOutput = z.infer<typeof FindAffiliationsOutputSchema>;

export async function findAffiliations(input: FindAffiliationsInput): Promise<FindAffiliationsOutput> {
  return findAffiliationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findAffiliationsPrompt',
  input: {schema: FindAffiliationsInputSchema},
  output: {schema: FindAffiliationsOutputSchema},
  prompt: `Analyze the following list of birth dates and identify any potential group affiliations based on age ranges and common experiences.

Birth Dates:
{{#each this}}
- {{{this}}}
{{/each}}

Consider age brackets and potential shared life events (e.g., graduation years, significant historical events during their formative years). Provide a concise summary of potential affiliations.  If no affiliations are apparent, state that.
`,
});

const findAffiliationsFlow = ai.defineFlow(
  {
    name: 'findAffiliationsFlow',
    inputSchema: FindAffiliationsInputSchema,
    outputSchema: FindAffiliationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
