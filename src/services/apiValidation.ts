import OpenAI from 'openai';

export async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  if (!apiKey?.trim()) {
    console.error('OpenAI API key is empty or invalid');
    return false;
  }

  try {
    const openai = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true // Required for browser environment
    });
    
    const response = await openai.models.list();
    return response.data.length > 0;
  } catch (error) {
    console.error('OpenAI validation error:', error);
    return false;
  }
}

export async function validateElevenLabsKey(apiKey: string): Promise<boolean> {
  if (!apiKey?.trim()) {
    console.error('ElevenLabs API key is empty or invalid');
    return false;
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey
      }
    });
    return response.ok;
  } catch (error) {
    console.error('ElevenLabs validation error:', error);
    return false;
  }
}