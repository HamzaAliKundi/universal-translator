import OpenAI from 'openai';

interface AnalysisResult {
  relevantContent: string[];
  summary: string;
  confidence: number;
}

export async function analyzeContext(
  text: string,
  openaiKey: string
): Promise<AnalysisResult> {
  const openai = new OpenAI({ 
    apiKey: openaiKey,
    dangerouslyAllowBrowser: true
  });
  
  try {
    // Split text into chunks for analysis
    const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // Get embeddings for the chunks
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: chunks.slice(0, 10) // Limit to first 10 chunks for efficiency
    });
    
    // Use GPT to analyze the content
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing and summarizing text content. Evaluate the relevance and importance of the provided content."
        },
        {
          role: "user",
          content: `
            Text content:
            ${chunks.join('\n\n')}
            
            Please:
            1. Identify the most relevant sections
            2. Provide a concise summary
            3. Assign a confidence score (0-1) based on the quality and coherence of the content
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
    
    // Get the most relevant chunks based on embedding similarity
    const relevantChunks = chunks
      .slice(0, 5)
      .filter(chunk => chunk.trim().length > 20);
    
    return {
      relevantContent: relevantChunks,
      summary: analysis,
      confidence
    };
  } catch (error) {
    console.error('Context analysis error:', error);
    if (error instanceof Error) {
      throw new Error(`Context analysis failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred during context analysis');
  }
}