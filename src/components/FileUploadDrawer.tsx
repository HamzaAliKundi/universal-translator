import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader } from 'lucide-react';

interface FileUploadDrawerProps {
  onFileSelect: (file: File) => Promise<void>;
  isProcessing: boolean;
}

export function FileUploadDrawer({ onFileSelect, isProcessing }: FileUploadDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileUpload(file);
    }
    setIsDragging(false);
  };

  const handleFileUpload = async (file: File) => {
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await onFileSelect(file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setShowSuccess(true);

      // Auto-close after success
      setTimeout(() => {
        setIsOpen(false);
        setUploadProgress(0);
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(0);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Upload className="w-6 h-6" />
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50"
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                className={`
                  flex-1 border-2 border-dashed rounded-lg
                  flex items-center justify-center relative
                  transition-colors
                  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                `}
              >
                <input
                  type="file"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                />

                <div className="text-center">
                  {isProcessing ? (
                    <div className="space-y-4">
                      <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                      <div className="text-gray-600">Processing document...</div>
                      <div className="w-48 h-2 bg-gray-100 rounded-full mx-auto overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : showSuccess ? (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-green-600 space-y-2"
                    >
                      <div className="text-xl">✓</div>
                      <div>Upload complete!</div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div className="text-gray-600">
                        Drag & drop a file here or click to browse
                      </div>
                      <div className="text-sm text-gray-500">
                        Supported formats: JPG, PNG, PDF, DOC, TXT
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}