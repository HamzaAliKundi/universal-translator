import React, { useCallback, useState } from 'react';
import { Upload, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setIsProcessing(true);
      try {
        await onFileSelect(file);
      } finally {
        // Let the parent component control the processing state
        setIsProcessing(false);
      }
    }
    setIsDragging(false);
  }, [onFileSelect]);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        await onFileSelect(file);
      } finally {
        // Let the parent component control the processing state
        setIsProcessing(false);
      }
    }
  }, [onFileSelect]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`
          relative w-full p-8 border-2 border-dashed rounded-2xl text-center
          transition-all duration-300 cursor-pointer overflow-hidden
          ${isDragging 
            ? 'border-primary bg-blue-50 scale-102' 
            : 'border-gray-200 hover:border-primary bg-white'
          }
        `}
      >
        <input
          type="file"
          onChange={handleChange}
          accept=".jpg,.jpeg,.png,.tiff"
          className="hidden"
          id="file-upload"
          disabled={isProcessing}
        />
        <label 
          htmlFor="file-upload" 
          className={`cursor-pointer ${isProcessing ? 'pointer-events-none' : ''}`}
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Loader className="w-8 h-8 text-primary animate-spin" />
                </div>
                <p className="mt-4 text-sm text-gray-600">Processing your file...</p>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Drop your file here
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse from your computer
                </p>
                <p className="text-xs text-gray-400">
                  Supported formats: JPG, PNG, TIFF (Max 50MB)
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </label>

        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-50 bg-opacity-90 backdrop-blur-sm
                         flex items-center justify-center"
            >
              <div className="text-lg font-semibold text-primary">
                Drop your file to start
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}