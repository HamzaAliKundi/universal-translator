import { useEffect, useState } from "react";
import { LanguageSelector } from "./components/LanguageSelector";
import { TranslationProgress } from "./components/TranslationProgress";
import { AnalysisResultView } from "./components/AnalysisResult";
import { DocumentList } from "./components/DocumentList";
import { FileUpload } from "./components/FileUpload";
import { Loader } from "lucide-react";
import { LandingPage } from "./components/LandingPage";
import { AuthModal } from "./components/AuthModal";
import { useTranslationContext } from "./contexts/TranslationContext";
import { DocumentPreview } from "./components/DocumentPreview";
import { useAuth } from "./hooks/useAuth";
import { useDocuments } from "./hooks/useDocuments";
import { useFileProcessing } from "./hooks/useFileProcessing";
import { Header } from "./components/Header";
import PaymentPage from "./components/PaymentPage";
import { hasPaid } from "./utils/api";

export default function App() {
  const { isTranslating, showTranslation, toggleTranslation } =
    useTranslationContext();
  const { isAuthenticated, isAuthLoading, user, handleSignOut, initAuth } =
    useAuth();
  const {
    documentState,
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
  } = useDocuments(isAuthenticated);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [remainingsReq, setRemainingsReq] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "analysis">("chat");

  const {
    status,
    result,
    isProcessing,
    handleFileSelect,
    handlePreviewDocument,
    setResult,
  } = useFileProcessing(sourceLanguage, targetLanguage);

  useEffect(() => {
    if (isAuthenticated) {
      loadDocuments(1);
    }
  }, [isAuthenticated]);

  const handleAuthSuccess = (userData: any) => {
    setShowAuthModal(false);
    loadDocuments(1);
  };

  const handleFileUpload = async (file: File) => {
    const newDocument = await handleFileSelect(file);
    if (newDocument) {
      setSelectedDocument(newDocument);
      loadDocuments(1);
    }
  };

  useEffect(() => {
    const checkHasPaid = async () => {
      const data = await hasPaid();
      setIsPaid(data?.hasPaid);
      setRemainingsReq(data?.remainingRequests);
    };
    checkHasPaid();
  }, [isPaymentPopupOpen, isProcessing]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onSignIn={() => setShowAuthModal(true)} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
          initAuth={initAuth}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userEmail={user?.email}
        isTranslating={isTranslating}
        showTranslation={showTranslation}
        toggleTranslation={toggleTranslation}
        isProcessing={isProcessing}
        onSignOut={handleSignOut}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {connectionError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{connectionError}</p>
            <button
              onClick={() => loadDocuments(1)}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <LanguageSelector
              value={sourceLanguage}
              onChange={setSourceLanguage}
              label="Source Language"
            />
            <LanguageSelector
              value={targetLanguage}
              onChange={setTargetLanguage}
              label="Target Language"
            />
          </div>

          {selectedDocument && (
            <DocumentPreview
              document={selectedDocument}
              onClose={() => {
                setSelectedDocument(null);
                setResult(null);
              }}
              apiKey={import.meta.env.VITE_OPENAI_API_KEY}
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
            />
          )}

          {result && selectedDocument && (
            <div className="space-y-8">
              <AnalysisResultView
                result={result}
                onActionToggle={() => {}}
                documentContent={selectedDocument.originalText || ""}
                apiKey={import.meta.env.VITE_OPENAI_API_KEY}
                sourceLanguage={sourceLanguage}
                targetLanguage={targetLanguage}
                onLanguageSwitch={toggleTranslation}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <p className="text-xs font-serif text-neutral-700">
                Remainings Requests : {remainingsReq}
              </p>
              {!isPaid ? (
                <div className="border rounded-xl p-4 py-10 flex flex-col gap-8 text-center items-center justify-center bg-white">
                  <p className="text-sm text-neutral-500 font-sans">
                    You have reached the limit; you need to pay for more.
                  </p>
                  <button
                    onClick={() => setIsPaymentPopupOpen(true)}
                    className="w-fit py-2 px-4 text-white bg-blue-500 hover:bg-blue-700 rounded-md font-medium"
                  >
                    Pay Now
                  </button>
                  <PaymentPage
                    isOpen={isPaymentPopupOpen}
                    onClose={() => setIsPaymentPopupOpen(false)}
                  />
                </div>
              ) : (
                <>
                  <FileUpload onFileSelect={handleFileUpload} />
                  <TranslationProgress status={status} />
                </>
              )}
            </div>

            <div className="space-y-4">
              <DocumentList
                documents={documentState.documents}
                selectedDocuments={documentState.selectedDocuments}
                onSelect={() => {}}
                onDelete={handleDocumentDelete}
                onToggleExpand={() => {}}
                hasMore={hasMore}
                onLoadMore={() => loadDocuments(currentPage + 1)}
                isLoadingMore={isLoadingMore}
                onPreviewDocument={(doc) => {
                  setSelectedDocument(doc);
                  handlePreviewDocument(doc.originalText || "");
                }}
                onTitleEdit={() => {}}
                generateDefaultName={(index) => `Document ${index + 1}`}
                documentsPerPage={documentsPerPage}
                onDocumentsPerPageChange={(value) => {
                  setDocumentsPerPage(value);
                  loadDocuments(1);
                }}
              />
              {documentState.documents.length > 0 && (
                <div className="text-sm text-gray-500 text-center">
                  Showing {documentState.documents.length} of {totalDocuments}{" "}
                  documents
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
