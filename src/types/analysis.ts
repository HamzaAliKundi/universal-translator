export interface AnalysisResult {
  summary: string;
  relevantQuestions: string[];
  actionItems: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    audioUrl?: string;
  }>;
  translations: Record<string, {
    summary: string;
    actionItems: Array<{
      id: string;
      text: string;
    }>;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
}