import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Languages } from 'lucide-react';

interface TranslationWindowProps {
  originalText: string;
  translatedText: string | null;
  sourceLanguage: string;
  targetLanguage: string;
}

export function TranslationWindow({
  originalText,
  translatedText,
  sourceLanguage,
  targetLanguage
}: TranslationWindowProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Translation Preview</h2>
        </div>
      </div>

      <div className="flex-1 overflow-hidden grid grid-rows-2 gap-4 p-4">
        {/* Original Text Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Original Text ({sourceLanguage.toUpperCase()})
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-4 h-4" />
              {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 h-[calc(100%-2rem)] overflow-y-auto">
            <p className="text-gray-700 whitespace-pre-wrap">{originalText}</p>
          </div>
        </div>

        {/* Translated Text Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Translated Text ({targetLanguage.toUpperCase()})
            </h3>
            {translatedText && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-4 h-4" />
                {new Date().toLocaleTimeString()}
              </div>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 h-[calc(100%-2rem)] overflow-y-auto">
            {translatedText ? (
              <p className="text-gray-700 whitespace-pre-wrap">{translatedText}</p>
            ) : (
              <p className="text-gray-500 italic">No translation available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}