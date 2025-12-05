import { tool } from 'ai';
import { z } from 'zod';

export interface ClaimBusterSentence {
  index: number;
  sentence: string;
  claim_score: number;
  label: 'CHECKWORTHY' | 'NOT CHECKWORTHY';
}

export const checkClaimsFromSentences = tool({
  description:
    'This tool analyzes a given English text and evaluates each sentence for its "checkworthiness." It is designed to assist with fact-checking by determining how likely each sentence is to require external verification. The tool takes a single string of text in English as input. If the input text is in another language, you must translate it into English before using this tool. The tool returns a formatted string with details about each sentence, including its numerical score. The higher the score, the more likely the sentence needs external fact-checking.',
  parameters: z.object({
    text: z.string(),
  }),
  execute: async ({ text }) => {
    const response = await fetch(
      'https://idir.uta.edu/claimbuster/api/v2/score/text/sentences/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAIM_BUSTER_API_KEY || '',
        },
        body: JSON.stringify({ input_text: text }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ClaimBuster API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log(data);

    // Format the results into a string
    const formattedResults = data.results
      .map((item: any) => {
        return `The claim "${item.text}" has a claim score of ${(1 - item.score).toFixed(2)}`;
      })
      .join(' '); // Separate each sentence block with a blank line

    return formattedResults;
  },
});
