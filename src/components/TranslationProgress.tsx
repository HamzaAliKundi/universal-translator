import React from 'react';
import { TranslationStatus } from '../types/translation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface TranslationProgressProps {
  status: TranslationStatus;
}

export function TranslationProgress({ status }: TranslationProgressProps) {
  if (status.status === 'idle') return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
      >
        <div className="space-y-3">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {status.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              {(status.status === 'processing' || status.status === 'uploading') && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader className="w-5 h-5 text-blue-500" />
                </motion.div>
              )}
              <span className="text-sm font-medium text-gray-900 capitalize">
                {status.status}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${status.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {status.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-100 rounded-md p-3"
              >
                <p className="text-sm text-red-600">
                  {status.error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completion Message */}
          <AnimatePresence mode="wait">
            {status.status === 'completed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-gray-500"
              >
                Document processed successfully
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}