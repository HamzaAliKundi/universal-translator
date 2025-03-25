import { AnalysisResult } from '../types/analysis';

interface CachedTranslation {
  content: string;
  timestamp: number;
  language: string;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

class TranslationCache {
  private cache: Map<string, CachedTranslation>;

  constructor() {
    this.cache = new Map();
  }

  private generateKey(content: string, targetLanguage: string): string {
    return `${content}_${targetLanguage}`;
  }

  get(content: string, targetLanguage: string): string | null {
    const key = this.generateKey(content, targetLanguage);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.content;
  }

  set(content: string, translation: string, targetLanguage: string): void {
    const key = this.generateKey(content, targetLanguage);
    this.cache.set(key, {
      content: translation,
      timestamp: Date.now(),
      language: targetLanguage
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const translationCache = new TranslationCache();