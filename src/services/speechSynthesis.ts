export interface VoiceOption {
  name: string;
  lang: string;
  voice: SpeechSynthesisVoice;
}

// Preferred voices by language
const PREFERRED_VOICES: Record<string, string[]> = {
  'en': ['Daniel', 'Samantha', 'Karen', 'Arthur'], // English voices
  'es': ['Monica', 'Juan', 'Diego', 'Jorge'], // Spanish voices
  'fr': ['Thomas', 'Amelie', 'Marie', 'Louis'], // French voices
  'de': ['Anna', 'Klaus', 'Heinrich', 'Marlene'], // German voices
  'it': ['Alice', 'Luca', 'Elsa', 'Giorgio'], // Italian voices
  'pt': ['Joana', 'Felipe', 'Lucia'], // Portuguese voices
  'ru': ['Milena', 'Yuri', 'Ivan'], // Russian voices
  'zh': ['Tingting', 'Lili', 'Hanhan'], // Chinese voices
  'ja': ['Kyoko', 'Otoya', 'Sakura'], // Japanese voices
  'ko': ['Yuna', 'Seoyeon', 'Jihun'] // Korean voices
};

// Get all available voices for a language
export function getAvailableVoices(lang = 'en'): VoiceOption[] {
  if (!window.speechSynthesis) {
    return [];
  }

  const voices = window.speechSynthesis.getVoices();
  const baseLang = lang.split('-')[0]; // Get base language code (e.g., 'en' from 'en-US')
  const preferredVoiceNames = PREFERRED_VOICES[baseLang] || [];

  return voices
    .filter(voice => voice.lang.startsWith(baseLang))
    .sort((a, b) => {
      // Sort by preferred voices first
      const aPreferredIndex = preferredVoiceNames.findIndex(name => 
        a.name.toLowerCase().includes(name.toLowerCase())
      );
      const bPreferredIndex = preferredVoiceNames.findIndex(name => 
        b.name.toLowerCase().includes(name.toLowerCase())
      );

      if (aPreferredIndex !== -1 && bPreferredIndex === -1) return -1;
      if (aPreferredIndex === -1 && bPreferredIndex !== -1) return 1;
      if (aPreferredIndex !== -1 && bPreferredIndex !== -1) {
        return aPreferredIndex - bPreferredIndex;
      }

      // Then prioritize natural-sounding voices
      const aIsNatural = !a.name.toLowerCase().includes('google');
      const bIsNatural = !b.name.toLowerCase().includes('google');
      if (aIsNatural && !bIsNatural) return -1;
      if (!aIsNatural && bIsNatural) return 1;

      return 0;
    })
    .map(voice => ({
      name: voice.name,
      lang: voice.lang,
      voice: voice
    }));
}

export async function generateSpeech(
  text: string, 
  lang = 'en-US',
  voiceIndex = 0
): Promise<SpeechSynthesisUtterance> {
  return new Promise((resolve, reject) => {
    try {
      if (!window.speechSynthesis) {
        throw new Error('Speech synthesis not supported');
      }

      // Wait for voices to be loaded
      const loadVoices = () => {
        const voices = getAvailableVoices(lang.split('-')[0]);
        
        if (voices.length === 0) {
          throw new Error(`No voices available for language: ${lang}`);
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        
        // Use the selected voice or fall back to the first available one
        utterance.voice = voices[Math.min(voiceIndex, voices.length - 1)].voice;
        
        // Optimize voice settings for naturalness
        utterance.rate = 0.9; // Slightly slower for better clarity
        utterance.pitch = 1.0; // Natural pitch
        utterance.volume = 1.0; // Full volume

        // Add breaks for better pacing
        utterance.text = text.replace(/([.!?])\s+/g, '$1\n');

        resolve(utterance);
      };

      // Handle voice loading
      if (window.speechSynthesis.getVoices().length) {
        loadVoices();
      } else {
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
      }
    } catch (error) {
      reject(error);
    }
  });
}

export function stopSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking ?? false;
}