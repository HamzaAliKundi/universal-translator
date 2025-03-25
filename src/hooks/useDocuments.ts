import { useCallback, useEffect, useState } from "react";
import type { Document } from "../types/document";
import { deleteDocument, getDocuments } from "../utils/api";

export function useDocuments(isAuthenticated: boolean) {
  const [documentState, setDocumentState] = useState<{
    documents: Document[];
    selectedDocuments: Set<string>;
  }>({
    documents: [],
    selectedDocuments: new Set(),
  });
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [documentsPerPage, setDocumentsPerPage] = useState(5);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const loadDocuments = useCallback(
    async (page = 1) => {
      if (!isAuthenticated) return;

      try {
        setIsLoadingMore(true);
        const result = await getDocuments(page, documentsPerPage);

        setConnectionError(null);

        if (page === 1) {
          setDocumentState((prev) => ({
            ...prev,
            documents: result.documents,
          }));
        } else {
          setDocumentState((prev) => ({
            ...prev,
            documents: [...prev.documents, ...result.documents],
          }));
        }

        setHasMore(result.hasMore);
        setTotalDocuments(result.total);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error loading documents:", error);
        setConnectionError(
          error instanceof Error ? error.message : "Failed to load documents"
        );
      } finally {
        setIsLoadingMore(false);
      }
    },
    [documentsPerPage, isAuthenticated]
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadDocuments(1);
    }
  }, [isAuthenticated, loadDocuments]);

  const handleDocumentDelete = useCallback(
    async (id: string) => {
      try {
        await deleteDocument(id);

        setDocumentState((prev) => ({
          ...prev,
          documents: prev.documents.filter((doc) => doc._id !== id),
        }));

        if (selectedDocument?._id === id) {
          setSelectedDocument(null);
        }
      } catch (error) {
        console.error("Error deleting document:", error);
        setConnectionError(
          error instanceof Error ? error.message : "Failed to delete document"
        );
      }
    },
    [selectedDocument]
  );

  return {
    documentState,
    setDocumentState,
    selectedDocument,
    setSelectedDocument,
    currentPage,
    hasMore,
    isLoadingMore,
    totalDocuments,
    documentsPerPage,
    setDocumentsPerPage,
    connectionError,
    loadDocuments,
    handleDocumentDelete,
  };
}
