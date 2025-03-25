import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language } from '../types/translation';

interface LanguageState {
  sourceLanguage: string;
  targetLanguage: string;
  detectedLanguage: string | null;
  availableLanguages: Language[];
  chatHistory: Record<string, Array<{ role: 'user' | 'assistant', content: string }>>;
  translations: Record<string, Record<string, string>>;
}

interface LanguageContextType extends LanguageState {
  setSourceLanguage: (lang: string) => void;
  setTargetLanguage: (lang: string) => void;
  setDetectedLanguage: (lang: string | null) => void;
  addChatMessage: (message: { role: 'user' | 'assistant', content: string }) => void;
  addTranslation: (key: string, language: string, translation: string) => void;
  switchLanguages: () => void;
  getChatHistory: (language: string) => Array<{ role: 'user' | 'assistant', content: string }>;
  getTranslation: (key: string, language: string) => string | null;
  rollbackToState: (state: LanguageState) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LanguageState>({
    sourceLanguage: 'en',
    targetLanguage: 'es',
    detectedLanguage: null,
    availableLanguages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' }
    ],
    chatHistory: {},
    translations: {}
  });

  const setSourceLanguage = useCallback((lang: string) => {
    setState(prev => ({ ...prev, sourceLanguage: lang }));
  }, []);

  const setTargetLanguage = useCallback((lang: string) => {
    setState(prev => ({ ...prev, targetLanguage: lang }));
  }, []);

  const setDetectedLanguage = useCallback((lang: string | null) => {
    setState(prev => ({ ...prev, detectedLanguage: lang }));
  }, []);

  const addChatMessage = useCallback((message: { role: 'user' | 'assistant', content: string }) => {
    setState(prev => {
      const currentHistory = prev.chatHistory[prev.targetLanguage] || [];
      return {
        ...prev,
        chatHistory: {
          ...prev.chatHistory,
          [prev.targetLanguage]: [...currentHistory, message]
        }
      };
    });
  }, []);

  const addTranslation = useCallback((key: string, language: string, translation: string) => {
    setState(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [key]: {
          ...(prev.translations[key] || {}),
          [language]: translation
        }
      }
    }));
  }, []);

  const switchLanguages = useCallback(() => {
    setState(prev => ({
      ...prev,
      sourceLanguage: prev.targetLanguage,
      targetLanguage: prev.sourceLanguage
    }));
  }, []);

  const getChatHistory = useCallback((language: string) => {
    return state.chatHistory[language] || [];
  }, [state.chatHistory]);

  const getTranslation = useCallback((key: string, language: string) => {
    return state.translations[key]?.[language] || null;
  }, [state.translations]);

  const rollbackToState = useCallback((previousState: LanguageState) => {
    setState(previousState);
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        ...state,
        setSourceLanguage,
        setTargetLanguage,
        setDetectedLanguage,
        addChatMessage,
        addTranslation,
        switchLanguages,
        getChatHistory,
        getTranslation,
        rollbackToState
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}