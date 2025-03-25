import React, { useState, useCallback } from 'react';
import { Globe, Languages, ChevronDown, Search } from 'lucide-react';
import { Language, COMMON_LANGUAGES } from '../types/translation';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
  onTranslate?: () => void;
  isTranslating?: boolean;
}

export function LanguageSelector({ 
  value, 
  onChange, 
  label,
  onTranslate,
  isTranslating 
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedLanguage = COMMON_LANGUAGES.find(lang => lang.code === value);

  const filteredLanguages = useCallback(() => {
    if (!searchQuery) return COMMON_LANGUAGES;
    
    const query = searchQuery.toLowerCase();
    return COMMON_LANGUAGES.filter(lang => 
      lang.name.toLowerCase().includes(query) || 
      lang.nativeName.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white
                   border border-gray-200 rounded-xl text-left transition-all duration-200
                   hover:border-primary focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-900">
              {selectedLanguage?.name}
            </span>
            <span className="block text-xs text-gray-500">
              {selectedLanguage?.nativeName}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200
                               ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-40 w-full mt-2 bg-white rounded-xl shadow-lg
                         border border-gray-100 overflow-hidden"
            >
              {/* Search input */}
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search languages..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Language list */}
              <div className="max-h-60 overflow-auto">
                {filteredLanguages().map((language) => (
                  <motion.button
                    key={language.code}
                    onClick={() => {
                      onChange(language.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left
                               transition-colors duration-150
                               ${value === language.code 
                                 ? 'bg-blue-50 text-primary' 
                                 : 'text-gray-700 hover:bg-gray-50'
                               }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <span className="block text-sm font-medium">
                        {language.name}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {language.nativeName}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {onTranslate && (
        <motion.button
          onClick={onTranslate}
          disabled={isTranslating}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5
                     bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-xl
                     hover:from-blue-600 hover:to-pink-600 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isTranslating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <Languages className="w-5 h-5" />
          )}
          {isTranslating ? 'Translating...' : 'Translate'}
        </motion.button>
      )}
    </div>
  );
}