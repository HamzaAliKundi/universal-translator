import React, { useState, useCallback, useRef } from "react";
import { File, Trash2 } from "lucide-react";
import { Document } from "../types/document";
import { motion, AnimatePresence } from "framer-motion";
import { generatePDF } from "../services/pdfGenerator";

interface DocumentListProps {
  documents: Document[];
  selectedDocuments: Set<string>;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  onPreviewDocument: (doc: Document) => void;
  onTitleEdit: (id: string, newTitle: string) => void;
  generateDefaultName: (index: number) => string;
  documentsPerPage: number;
  onDocumentsPerPageChange: (value: number) => void;
}

export function DocumentList({
  documents,
  selectedDocuments,
  onSelect,
  onDelete,
  onToggleExpand,
  hasMore,
  onLoadMore,
  isLoadingMore,
  onPreviewDocument,
  onTitleEdit,
  generateDefaultName,
  documentsPerPage,
  onDocumentsPerPageChange,
}: DocumentListProps) {
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const [downloadingDocs, setDownloadingDocs] = useState<Set<string>>(
    new Set()
  );
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [showTranslation, setShowTranslation] = useState<
    Record<string, boolean>
  >({});
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePreview = useCallback(
    (doc: Document) => {
      onPreviewDocument(doc);
      // Scroll to preview section smoothly
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);
    },
    [onPreviewDocument]
  );

  const handleDownload = async (doc: Document) => {
    if (downloadingDocs.has(doc.id)) return;

    try {
      setDownloadingDocs((prev) => new Set([...prev, doc.id]));
      await generatePDF(doc);
    } catch (error) {
      console.error("Error downloading document:", error);
    } finally {
      setDownloadingDocs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(doc.id);
        return newSet;
      });
    }
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <File className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          No documents yet
        </h3>
        <p className="text-sm text-gray-500">Upload documents to get started</p>
      </div>
    );
  }

  // console.log(documents);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-200">
        <AnimatePresence>
          {documents?.map((doc, index) => (
            <motion.div
              key={`doc-${doc.id}-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="group"
            >
              <div className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <motion.button
                      onClick={() => handlePreview(doc)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
                    >
                      <File className="w-5 h-5 text-blue-600" />
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <motion.button
                        onClick={() => handlePreview(doc)}
                        whileHover={{ scale: 1.02 }}
                        className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors"
                      >
                        {doc.name || generateDefaultName(index)}
                      </motion.button>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString()} ·{" "}
                        {(doc.size / 1024).toFixed(1)}KB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <motion.button
                      onClick={() => onDelete(doc._id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
          >
            {isLoadingMore ? "Loading more..." : "Load more"}
          </button>
        </div>
      )}
      <div ref={previewRef} />
    </div>
  );
}
