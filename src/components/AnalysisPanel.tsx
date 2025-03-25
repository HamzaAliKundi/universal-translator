import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Lightbulb, AlertTriangle } from 'lucide-react';
import { AnalysisResult } from '../types/analysis';

interface AnalysisPanelProps {
  result: AnalysisResult | null;
  documentContent: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export function AnalysisPanel({
  result,
  documentContent,
  sourceLanguage,
  targetLanguage
}: AnalysisPanelProps) {
  if (!result) return null;

  // Calculate metrics
  const wordCount = documentContent.split(/\s+/).length;
  const sentenceCount = documentContent.split(/[.!?]+/).length;
  const avgWordsPerSentence = Math.round(wordCount / sentenceCount);
  const complexityScore = Math.min(100, Math.round((avgWordsPerSentence / 20) * 100));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Analysis & Metrics</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Metrics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Document Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{wordCount}</div>
                <div className="text-sm text-gray-600">Words</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{sentenceCount}</div>
                <div className="text-sm text-gray-600">Sentences</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{avgWordsPerSentence}</div>
                <div className="text-sm text-gray-600">Avg. Words/Sentence</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{complexityScore}%</div>
                <div className="text-sm text-gray-600">Complexity Score</div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Revision Suggestions</h3>
            <div className="space-y-2">
              {complexityScore > 70 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    Consider simplifying sentences for better readability
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  Key terms could be emphasized for clarity
                </div>
              </div>
            </div>
          </div>

          {/* Quality Assessment */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Quality Assessment</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Clarity</span>
                  <span className="text-sm font-medium text-gray-900">85%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    className="h-full bg-blue-600"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Coherence</span>
                  <span className="text-sm font-medium text-gray-900">90%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '90%' }}
                    className="h-full bg-blue-600"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Translation Accuracy</span>
                  <span className="text-sm font-medium text-gray-900">95%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '95%' }}
                    className="h-full bg-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}