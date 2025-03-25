import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface TranslationContextType {
  isTranslating: boolean;
  showTranslation: boolean;
  toggleTranslation: () => void;
  translateContent: (content: string) => Promise<string>;
  sourceLanguage: string;
  targetLanguage: string;
  setSourceLanguage: (lang: string) => void;
  setTargetLanguage: (lang: string) => void;
  error: string | null;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ 
  children,
  apiKey 
}: { 
  children: React.ReactNode;
  apiKey: string;
}) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');

  const { 
    translateContent,
    isTranslating,
    error
  } = useTranslation({
    apiKey,
    sourceLanguage,
    targetLanguage
  });

  const toggleTranslation = useCallback(async () => {
    setShowTranslation(prev => !prev);
  }, []);

  return (
    <TranslationContext.Provider value={{
      isTranslating,
      showTranslation,
      toggleTranslation,
      translateContent,
      sourceLanguage,
      targetLanguage,
      setSourceLanguage,
      setTargetLanguage,
      error
    }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
}