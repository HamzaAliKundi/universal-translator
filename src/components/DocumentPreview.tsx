// import { translateText } from "../services/openai";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, Download, X, Loader, Share2 } from "lucide-react";
import type { Document } from "../types/document";
import { generatePDF } from "../services/pdfGenerator";
import { getDocument } from "../utils/api";

interface DocumentPreviewProps {
  document: Document | null;
  onClose: () => void;
  apiKey: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export function DocumentPreview({
  document,
  onClose,
  // apiKey,
  sourceLanguage,
  targetLanguage,
}: DocumentPreviewProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [documentData, setDocumentData] = useState<Document | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [translatedContent, setTranslatedContent] = useState<string | null>(
    null
  );
  const [shareSupported] = useState(() => {
    try {
      return navigator.canShare?.() ?? false;
    } catch {
      return false;
    }
  });


  useEffect(() => {
    const loadDocument = async () => {
      if (!document?.id && !document?._id) return;

      setIsLoading(true);
      try {
        const data = await getDocument(document.id || document._id);

        if (data) {
          setDocumentData({
            ...document,
            originalText: data.original_text,
            translatedText: data.translated_text,
            uploadDate: new Date(data.created_at),
          });

          // Set translated content directly from API response
          if (data.translated_text) {
            setTranslatedContent(data.translated_text);
          }
        }
      } catch (error) {
        console.error("Error loading document:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [document, sourceLanguage, targetLanguage]);

  const handleCopy = async () => {
    if (!documentData) return;

    const textToCopy = showTranslation
      ? translatedContent
      : documentData.originalText;

    try {
      await navigator.clipboard.writeText(textToCopy || "");
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const handleShare = async () => {
    if (!documentData) return;

    const textToShare = showTranslation
      ? translatedContent
      : documentData.originalText;
    const title = documentData.name || "Shared Document";

    try {
      if (shareSupported) {
        const shareData = {
          title,
          text: textToShare || "",
          ...(window.location.href && { url: window.location.href }),
        };

        if (navigator.canShare?.(shareData)) {
          await navigator.share(shareData);
        } else {
          await handleCopy();
        }
      } else {
        await handleCopy();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      console.error("Error sharing document:", error);
      await handleCopy();
    }
  };

  const handleGeneratePDF = async () => {
    if (!documentData) return;

    try {
      setIsGeneratingPDF(true);
      await generatePDF(documentData);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!document) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Document Preview
          </h2>
          <span className="text-sm text-gray-500">
            {`${new Date(
              document?.uploadDate || document?.createdAt
            ).toLocaleDateString("en-US")}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {shareSupported ? "Share" : "Copy"}
          </button>
          {copyStatus === "copied" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-16 right-4 bg-black bg-opacity-80 text-white text-sm px-3 py-1 rounded-full"
            >
              Copied to clipboard!
            </motion.div>
          )}
          {documentData?.translatedText && (
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Languages className="w-4 h-4" />
              {showTranslation ? "Show Original" : "Show Translation"}
            </button>
          )}
          <button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF || isLoading || !documentData}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Generate PDF
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-[400px]"
            >
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key={showTranslation ? "translation" : "original"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  {showTranslation ? "Translated Text" : "Original Text"}
                </h3>
                <span className="text-xs text-gray-500">
                  {(document.size / 1024).toFixed(1)}KB
                </span>
              </div>
              <div className="h-[400px] bg-gray-50 rounded-lg p-4 overflow-y-auto border border-gray-200">
                {documentData ? (
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {showTranslation
                      ? translatedContent
                      : documentData.originalText}
                  </pre>
                ) : (
                  <div className="text-gray-500 text-center">
                    No content available
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
