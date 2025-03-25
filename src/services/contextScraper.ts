// Get your Jina AI API key for free: https://jina.ai/?sui=apikey
import { JinaClient } from '@jina-ai/client';
import OpenAI from 'openai';

interface ScrapingResult {
  relevantContent: string[];
  summary: string;
  confidence: number;
}

export async function scrapeAndAnalyzeContext(
  text: string,
  jinaKey: string,
  openaiKey: string
): Promise<ScrapingResult> {
  const client = new JinaClient({ apiKey: jinaKey });
  const openai = new OpenAI({ 
    apiKey: openaiKey,
    dangerouslyAllowBrowser: true
  });
  
  try {
    // Get relevant content using Jina
    const searchResponse = await client.search({
      query: text,
      limit: 5,
      filter: {
        type: 'text'
      }
    });
    
    const relevantContent = searchResponse.matches.map(match => match.text);
    
    // Use OpenAI to analyze and make decisions about the scraped content
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing and summarizing contextual information. Evaluate the relevance and importance of the provided content."
        },
        {
          role: "user",
          content: `
            Original text: ${text}
            
            Scraped relevant content:
            ${relevantContent.join('\n\n')}
            
            Please:
            1. Analyze the relevance of each piece of content
            2. Provide a concise summary of the most relevant information
            3. Assign a confidence score (0-1) based on the quality and relevance of the found content
          `
        }
      ],
      temperature: 0.3
    });
    
    const analysis = analysisResponse.choices[0].message.content;
    if (!analysis) {
      throw new Error('No analysis received from OpenAI');
    }
    
    // Extract confidence score from the analysis
    const confidenceMatch = analysis.match(/confidence score: (0\.\d+)/i);
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;
    
    return {
      relevantContent,
      summary: analysis,
      confidence
    };
  } catch (error) {
    console.error('Context scraping error:', error);
    if (error instanceof Error) {
      throw new Error(`Context analysis failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred during context analysis');
  }
}