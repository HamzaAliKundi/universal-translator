import React from 'react';
import { Languages, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslationContext } from '../contexts/TranslationContext';

export function GlobalTranslationToggle() {
  const { isTranslating, showTranslation, toggleTranslation } = useTranslationContext();

  return (
    <motion.button
      onClick={toggleTranslation}
      disabled={isTranslating}
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center gap-2 px-4 py-2 rounded-full shadow-lg
        transition-all duration-200
        ${showTranslation 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-white text-gray-900 hover:bg-gray-50'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {isTranslating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Loader className="w-5 h-5 animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="icon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Languages className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="text-sm font-medium">
        {isTranslating ? 'Translating...' : showTranslation ? 'Show Original' : 'Translate'}
      </span>
    </motion.button>
  );
}