import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatInterface } from './ChatInterface';
import { TranslationWindow } from './TranslationWindow';
import { AnalysisPanel } from './AnalysisPanel';
import { FileUploadDrawer } from './FileUploadDrawer';
import { AnalysisResult } from '../types/analysis';

interface MultiWindowLayoutProps {
  documentContent: string;
  translatedContent: string | null;
  analysisResult: AnalysisResult | null;
  apiKey: string;
  sourceLanguage: string;
  targetLanguage: string;
  onFileSelect: (file: File) => Promise<void>;
  isProcessing: boolean;
}

export function MultiWindowLayout({
  documentContent,
  translatedContent,
  analysisResult,
  apiKey,
  sourceLanguage,
  targetLanguage,
  onFileSelect,
  isProcessing
}: MultiWindowLayoutProps) {
  return (
    <div className="grid grid-cols-2 grid-rows-[1fr,1fr] gap-4 h-[calc(100vh-6rem)] p-4">
      {/* Top Right Window - Translation Preview */}
      <div className="col-start-2 row-start-1">
        <TranslationWindow
          originalText={documentContent}
          translatedText={translatedContent}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
        />
      </div>

      {/* Top Left Window - Chat Assistant */}
      <div className="col-start-1 row-start-1">
        <ChatInterface
          documentContent={documentContent}
          apiKey={apiKey}
          analysisResult={analysisResult || undefined}
        />
      </div>

      {/* Bottom Window - Analysis Panel */}
      <div className="col-span-2 row-start-2">
        <AnalysisPanel
          result={analysisResult}
          documentContent={documentContent}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
        />
      </div>

      {/* Upload UI */}
      <FileUploadDrawer
        onFileSelect={onFileSelect}
        isProcessing={isProcessing}
      />
    </div>
  );
}