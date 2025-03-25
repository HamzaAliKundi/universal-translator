import { useState, useCallback } from 'react';
import { translateText } from '../services/openai';
import { translationCache } from '../services/translationCache';

interface UseTranslationProps {
  apiKey: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export function useTranslation({ apiKey, sourceLanguage, targetLanguage }: UseTranslationProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateContent = useCallback(async (content: string) => {
    if (!content.trim()) return '';
    
    try {
      // Check cache first
      const cached = translationCache.get(content, targetLanguage);
      if (cached) return cached;

      setIsTranslating(true);
      setError(null);

      const translation = await translateText(
        content,
        sourceLanguage,
        targetLanguage,
        apiKey
      );

      // Cache the result
      translationCache.set(content, translation, targetLanguage);

      return translation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  }, [apiKey, sourceLanguage, targetLanguage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    translateContent,
    isTranslating,
    error,
    clearError
  };
}