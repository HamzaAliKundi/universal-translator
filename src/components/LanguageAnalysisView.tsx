import React, { useState, useEffect } from 'react';
import { Languages, ArrowLeftRight, Globe, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult } from '../types/analysis';
import { translateText } from '../services/openai';
import { generateSpeech, stopSpeech } from '../services/speechSynthesis';

interface LanguageAnalysisViewProps {
  result: AnalysisResult;
  documentContent: string;
  apiKey: string;
  sourceLanguage: string;
  targetLanguage: string;
  onLanguageSwitch: () => void;
}

export function LanguageAnalysisView({
  result,
  documentContent,
  apiKey,
  sourceLanguage,
  targetLanguage,
  onLanguageSwitch
}: LanguageAnalysisViewProps) {
  const [translatedResult, setTranslatedResult] = useState<AnalysisResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'source' | 'target'>('source');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when languages change
    setTranslatedResult(null);
    setActiveLanguage('source');
  }, [sourceLanguage, targetLanguage]);

  const handleTranslate = async () => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    try {
      // Translate summary
      const translatedSummary = await translateText(
        result.summary,
        sourceLanguage,
        targetLanguage,
        apiKey
      );

      // Translate action items
      const translatedActionItems = await Promise.all(
        result.actionItems.map(async (item) => ({
          ...item,
          text: await translateText(item.text, sourceLanguage, targetLanguage, apiKey)
        }))
      );

      // Translate sections
      const translatedSections = await Promise.all(
        result.sections.map(async (section) => ({
          ...section,
          title: await translateText(section.title, sourceLanguage, targetLanguage, apiKey),
          content: await translateText(section.content, sourceLanguage, targetLanguage, apiKey)
        }))
      );

      setTranslatedResult({
        ...result,
        summary: translatedSummary,
        actionItems: translatedActionItems,
        sections: translatedSections
      });
      
      setActiveLanguage('target');
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePlayAudio = async (text: string, language: string) => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      return;
    }

    try {
      const utterance = await generateSpeech(text, language);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  const currentResult = activeLanguage === 'source' ? result : (translatedResult || result);
  const currentLanguage = activeLanguage === 'source' ? sourceLanguage : targetLanguage;

  return (
    <div className="space-y-6">
      {/* Language Controls */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {activeLanguage === 'source' ? 'Source' : 'Target'} Language:
            </span>
            <span className="text-sm font-bold text-blue-600">
              {currentLanguage.toUpperCase()}
            </span>
          </div>
          {detectedLanguage && detectedLanguage !== sourceLanguage && (
            <span className="text-sm text-gray-500">
              Detected: {detectedLanguage.toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Languages className="w-4 h-4" />
            {isTranslating ? 'Translating...' : 'Translate'}
          </button>
          <button
            onClick={onLanguageSwitch}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveLanguage('source')}
          className={`px-4 py-2 font-medium text-sm transition-colors relative
            ${activeLanguage === 'source' 
              ? 'text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'}`}
        >
          {sourceLanguage.toUpperCase()}
          {activeLanguage === 'source' && (
            <motion.div
              layoutId="activeLanguage"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            />
          )}
        </button>
        <button
          onClick={() => setActiveLanguage('target')}
          disabled={!translatedResult}
          className={`px-4 py-2 font-medium text-sm transition-colors relative
            ${activeLanguage === 'target'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700'}
            ${!translatedResult && 'opacity-50 cursor-not-allowed'}`}
        >
          {targetLanguage.toUpperCase()}
          {activeLanguage === 'target' && (
            <motion.div
              layoutId="activeLanguage"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            />
          )}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLanguage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          {/* Summary Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
              <button
                onClick={() => handlePlayAudio(currentResult.summary, currentLanguage)}
                className={`p-2 rounded-full transition-colors
                  ${isPlaying 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700 leading-relaxed">{currentResult.summary}</p>
          </div>

          {/* Action Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Action Items
            </h3>
            <div className="space-y-3">
              {currentResult.actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    readOnly
                    className="mt-1"
                  />
                  <span className="text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Content Breakdown
            </h3>
            <div className="space-y-4">
              {currentResult.sections.map((section) => (
                <div key={section.id} className="space-y-2">
                  <h4 className="font-medium text-gray-900">
                    {section.title}
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}