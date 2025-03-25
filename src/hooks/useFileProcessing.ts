import { useState, useCallback } from "react";
import type { TranslationStatus } from "../types/translation";
import type { AnalysisResult } from "../types/analysis";
import { processDocument } from "../services/documentProcessor";
import { extractTextFromImage } from "../services/textExtraction";
import { analyzeDocument } from "../services/documentAnalysis";
import type { Document } from "../types/document";

export function useFileProcessing(
  sourceLanguage: string,
  targetLanguage: string
) {
  const [status, setStatus] = useState<TranslationStatus>({
    status: "idle",
    progress: 0,
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File): Promise<Document | null> => {
      if (isProcessing) return null;

      setIsProcessing(true);
      try {
        setStatus({ status: "uploading", progress: 0 });
        const text = await extractTextFromImage(file);
        setStatus({ status: "processing", progress: 50 });

        const processedResult = await processDocument(
          text,
          sourceLanguage,
          targetLanguage,
          import.meta.env.VITE_OPENAI_API_KEY
        );

        setResult(processedResult.analysisResult);
        setStatus({ status: "completed", progress: 100 });

        return {
          id: processedResult.documentId,
          name: file.name,
          uploadDate: new Date(),
          size: file.size,
          type: file.type,
          originalText: text,
          translatedText: processedResult.translatedText,
        };
      } catch (error) {
        console.error("File processing error:", error);
        setStatus({
          status: "error",
          progress: 0,
          error:
            error instanceof Error ? error.message : "Failed to process file",
        });
        setResult(null);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [sourceLanguage, targetLanguage, isProcessing]
  );

  const handlePreviewDocument = useCallback(async (originalText: string) => {
    try {
      const analysisResult = await analyzeDocument(
        originalText,
        import.meta.env.VITE_OPENAI_API_KEY
      );
      setResult(analysisResult);
    } catch (error) {
      console.error("Error analyzing document:", error);
    }
  }, []);

  return {
    status,
    result,
    isProcessing,
    handleFileSelect,
    handlePreviewDocument,
    setResult,
  };
}
