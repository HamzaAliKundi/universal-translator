import React from 'react';
import { MessageSquare, Languages } from 'lucide-react';
import { AnalysisResult } from '../types/analysis';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatInterface } from './ChatInterface';
import { LanguageAnalysisView } from './LanguageAnalysisView';

interface AnalysisResultViewProps {
  result: AnalysisResult;
  onActionToggle: (id: string) => void;
  documentContent: string;
  apiKey: string;
  sourceLanguage: string;
  targetLanguage: string;
  onLanguageSwitch: () => void;
  activeTab: 'chat' | 'analysis';
  onTabChange: (tab: 'chat' | 'analysis') => void;
}

export function AnalysisResultView({ 
  result, 
  onActionToggle, 
  documentContent, 
  apiKey,
  sourceLanguage,
  targetLanguage,
  onLanguageSwitch,
  activeTab,
  onTabChange
}: AnalysisResultViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Analysis Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Languages className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Analysis</h2>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <LanguageAnalysisView
            result={result}
            documentContent={documentContent}
            apiKey={apiKey}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onLanguageSwitch={onLanguageSwitch}
          />
        </div>
      </div>

      {/* Chat Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Chat Assistant</h2>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <ChatInterface
            documentContent={documentContent}
            apiKey={apiKey}
            analysisResult={result}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
          />
        </div>
      </div>
    </div>
  );
}