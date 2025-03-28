import { Globe } from "lucide-react";
import { TranslationToggle } from "./TranslationToggle";

interface HeaderProps {
  userEmail: string | undefined;
  isTranslating: boolean;
  showTranslation: boolean;
  toggleTranslation: () => void;
  isProcessing: boolean;
  onSignOut: () => void;
}

export function Header({
  userEmail,
  isTranslating,
  showTranslation,
  toggleTranslation,
  isProcessing,
  onSignOut,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 sm:h-16 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Universal Translator
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            {userEmail && (
              <span className="text-xs sm:text-sm text-gray-600 text-center">{userEmail}</span>
            )}
            <div className="flex items-center gap-2 sm:gap-4">
              <TranslationToggle
                isTranslating={isTranslating}
                showTranslation={showTranslation}
                onToggle={toggleTranslation}
                disabled={isProcessing}
              />
              <button
                onClick={onSignOut}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 px-2 py-1 sm:px-3"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
