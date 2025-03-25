// Get your Jina AI API key for free: https://jina.ai/?sui=apikey
import { JinaClient } from '@jina-ai/client';

export async function searchContextualData(text: string, apiKey: string) {
  const client = new JinaClient({ apiKey });
  
  try {
    const response = await client.search({
      query: text,
      limit: 5,
      filter: {
        type: 'text'
      }
    });
    
    return response.matches.map(match => ({
      text: match.text,
      score: match.score,
      metadata: match.metadata
    }));
  } catch (error) {
    console.error('Jina search error:', error);
    throw error;
  }
}