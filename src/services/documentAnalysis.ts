import OpenAI from 'openai';
import { AnalysisResult } from '../types/analysis';

export async function analyzeDocument(
  text: string,
  apiKey: string
): Promise<AnalysisResult> {
  if (!apiKey) {
    throw new Error('OpenAI API key is missing');
  }

  const openai = new OpenAI({ 
    apiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert document analyzer. Analyze the provided text and return a JSON response with:
          1. A comprehensive yet concise executive summary
          2. 3-5 key questions that would be relevant to ask about this content
          3. Key action items and insights
          4. Logical content sections
          
          Format the response as:
          {
            "summary": "executive summary",
            "relevantQuestions": ["question 1", "question 2", "question 3"],
            "actionItems": ["action item 1", "action item 2"],
            "sections": [
              {
                "title": "section title",
                "content": "section content"
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Please analyze this text and provide the response in JSON format: ${text}`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      summary: analysis.summary || 'No summary available',
      relevantQuestions: analysis.relevantQuestions || [],
      actionItems: (analysis.actionItems || []).map((item: string) => ({
        id: crypto.randomUUID(),
        text: item,
        completed: false
      })),
      sections: (analysis.sections || []).map((section: any) => ({
        id: crypto.randomUUID(),
        title: section.title || 'Untitled Section',
        content: section.content || ''
      })),
      translations: {
        es: {
          summary: '',
          relevantQuestions: [],
          actionItems: [],
          sections: []
        }
      }
    };
  } catch (error: any) {
    console.error('Document analysis error:', error);
    if (error?.status === 429) {
      throw new Error('OpenAI API quota exceeded. Please check your billing details.');
    }
    throw new Error(error?.message || 'Document analysis failed');
  }
}