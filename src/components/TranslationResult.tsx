import React, { useState } from 'react';
import { Volume2, Settings } from 'lucide-react';
import { TranslationResult, AudioSettings } from '../types/translation';

interface TranslationResultProps {
  result: TranslationResult;
}

export function TranslationResultView({ result }: TranslationResultProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(
    result.audioSettings || {
      stability: 0.5,
      similarityBoost: 0.75,
      speed: 1.0,
      pitch: 1.0
    }
  );

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900 mb-2">Original Text</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{result.originalText}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900 mb-2">Translated Text</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{result.translatedText}</p>
        </div>
      </div>
      
      {result.audioUrl && (
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-gray-700" />
              <h3 className="font-medium text-gray-900">Audio Translation</h3>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <Settings className="w-4 h-4" />
              Audio Settings
            </button>
          </div>

          {showSettings && (
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stability ({audioSettings.stability})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={audioSettings.stability}
                  onChange={(e) => setAudioSettings({
                    ...audioSettings,
                    stability: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Similarity Boost ({audioSettings.similarityBoost})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={audioSettings.similarityBoost}
                  onChange={(e) => setAudioSettings({
                    ...audioSettings,
                    similarityBoost: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speed ({audioSettings.speed}x)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={audioSettings.speed}
                  onChange={(e) => setAudioSettings({
                    ...audioSettings,
                    speed: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pitch ({audioSettings.pitch})
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={audioSettings.pitch}
                  onChange={(e) => setAudioSettings({
                    ...audioSettings,
                    pitch: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <audio controls className="w-full">
            <source src={result.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      
      <div className="text-sm text-gray-500">
        Translation confidence score: {(result.confidenceScore * 100).toFixed(1)}%
      </div>
    </div>
  );
}