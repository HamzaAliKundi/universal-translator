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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Universal Translator
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-sm text-gray-600">{userEmail}</span>
            )}
            <TranslationToggle
              isTranslating={isTranslating}
              showTranslation={showTranslation}
              onToggle={toggleTranslation}
              disabled={isProcessing}
            />
            <button
              onClick={onSignOut}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
