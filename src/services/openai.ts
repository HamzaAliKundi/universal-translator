import OpenAI from 'openai';

export async function translateText(text: string, sourceLanguage: string, targetLanguage: string, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is missing');
  }

  const client = new OpenAI({ 
    apiKey,
    dangerouslyAllowBrowser: true // Required for browser environment
  });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo", // Using gpt-3.5-turbo instead of gpt-4 for better availability
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Maintain the original tone and meaning while ensuring natural flow in the target language.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const translatedText = response.choices[0].message.content;
    if (!translatedText) {
      throw new Error('No translation received');
    }

    return translatedText;
  } catch (error: any) {
    // Handle specific OpenAI error types
    if (error?.status === 429) {
      throw new Error('OpenAI API quota exceeded. Please check your billing details.');
    } else if (error?.status === 401) {
      throw new Error('Invalid OpenAI API key.');
    } else if (error?.status === 503) {
      throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
    }
    
    // Handle general errors
    throw new Error(error?.message || 'Translation failed');
  }
}