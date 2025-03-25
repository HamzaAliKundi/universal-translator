import { useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translateText } from '../services/openai';

interface UseMultilingualChatProps {
  apiKey: string;
}

export function useMultilingualChat({ apiKey }: UseMultilingualChatProps) {
  const {
    sourceLanguage,
    targetLanguage,
    addChatMessage,
    addTranslation,
    getChatHistory,
    getTranslation
  } = useLanguage();

  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateMessage = useCallback(async (
    message: string,
    fromLang: string,
    toLang: string
  ) => {
    try {
      setIsTranslating(true);
      setError(null);

      const translation = await translateText(
        message,
        fromLang,
        toLang,
        apiKey
      );

      // Cache the translation
      const key = `${message}_${fromLang}_${toLang}`;
      addTranslation(key, toLang, translation);

      return translation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  }, [apiKey, addTranslation]);

  const sendMessage = useCallback(async (
    message: string,
    role: 'user' | 'assistant' = 'user'
  ) => {
    try {
      // First, translate the message if needed
      let translatedMessage = message;
      if (sourceLanguage !== targetLanguage) {
        translatedMessage = await translateMessage(message, sourceLanguage, targetLanguage);
      }

      // Add the message to chat history
      addChatMessage({
        role,
        content: translatedMessage
      });

      return translatedMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [sourceLanguage, targetLanguage, translateMessage, addChatMessage]);

  const getMessageTranslation = useCallback((
    message: string,
    fromLang: string,
    toLang: string
  ) => {
    const key = `${message}_${fromLang}_${toLang}`;
    return getTranslation(key, toLang);
  }, [getTranslation]);

  return {
    isTranslating,
    error,
    sendMessage,
    translateMessage,
    getMessageTranslation,
    chatHistory: getChatHistory(targetLanguage)
  };
}