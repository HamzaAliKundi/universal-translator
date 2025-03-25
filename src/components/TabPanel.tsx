import React, { useState } from 'react';
import { MessageSquare, BarChart2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { LiveChat } from './LiveChat';
import { AnalysisPanel } from './AnalysisPanel';
import { DownloadManager } from './DownloadManager';

interface TabPanelProps {
  documentContent: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export function TabPanel({ 
  documentContent, 
  sourceLanguage, 
  targetLanguage 
}: TabPanelProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis' | 'downloads'>('chat');

  const tabs = [
    { id: 'chat', label: 'Live Chat', icon: MessageSquare },
    { id: 'analysis', label: 'Analysis', icon: BarChart2 },
    { id: 'downloads', label: 'Downloads', icon: Download }
  ] as const;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium
                transition-colors relative
                ${activeTab === tab.id 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'chat' && <LiveChat />}
        {activeTab === 'analysis' && (
          <AnalysisPanel
            result={null}
            documentContent={documentContent}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
          />
        )}
        {activeTab === 'downloads' && <DownloadManager />}
      </div>
    </div>
  );
}