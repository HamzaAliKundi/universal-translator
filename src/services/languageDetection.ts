import OpenAI from 'openai';

export async function detectLanguage(text: string, apiKey: string): Promise<string> {
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
          content: "You are a language detection expert. Respond only with the ISO 639-1 language code."
        },
        {
          role: "user",
          content: `Detect the language of this text: "${text}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 2
    });

    const detectedLanguage = response.choices[0].message.content?.trim().toLowerCase();
    return detectedLanguage || 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English on error
  }
}