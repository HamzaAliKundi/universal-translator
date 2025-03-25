const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export async function generateSpeech(text: string, apiKey: string, voiceId = '21m00Tcm4TlvDq8ikWAM'): Promise<Blob> {
  if (!apiKey?.trim()) {
    throw new Error('ElevenLabs API key is required');
  }

  try {
    // Validate input
    if (!text?.trim()) {
      throw new Error('Text is required for speech generation');
    }

    // Add error handling for text length
    if (text.length > 5000) {
      text = text.slice(0, 4997) + '...';
    }

    // Generate the audio using the non-streaming endpoint for better reliability
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate speech';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `Failed to generate speech: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const audioBlob = await response.blob();
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Generated audio is empty');
    }

    return audioBlob;
  } catch (error) {
    console.error('ElevenLabs API error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to generate audio. Please check your API key and try again.');
  }
}