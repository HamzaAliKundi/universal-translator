import React from 'react';
import { Languages, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TranslationToggleProps {
  isTranslating: boolean;
  showTranslation: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function TranslationToggle({
  isTranslating,
  showTranslation,
  onToggle,
  disabled = false
}: TranslationToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      disabled={disabled || isTranslating}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full
        transition-all duration-200
        ${showTranslation 
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {isTranslating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Loader className="w-4 h-4 animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Languages className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="text-sm font-medium">
        {isTranslating ? 'Translating...' : showTranslation ? 'Show Original' : 'Translate'}
      </span>
    </motion.button>
  );
}