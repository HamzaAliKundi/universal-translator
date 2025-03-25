import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, HelpCircle, MessageSquare } from 'lucide-react';
import { ChatMessage, ChatState, AnalysisResult } from '../types/analysis';
import OpenAI from 'openai';
import { motion, AnimatePresence } from 'framer-motion';
import { translateText } from '../services/openai';

interface ChatInterfaceProps {
  documentContent: string;
  apiKey: string;
  analysisResult: AnalysisResult;
  sourceLanguage: string;
  targetLanguage: string;
}

export function ChatInterface({ 
  documentContent, 
  apiKey, 
  analysisResult,
  sourceLanguage,
  targetLanguage
}: ChatInterfaceProps) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false
  });
  const [input, setInput] = useState('');
  const [translatedQuestions, setTranslatedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Translate relevant questions when language changes
  useEffect(() => {
    const translateQuestions = async () => {
      if (sourceLanguage === targetLanguage) {
        setTranslatedQuestions(analysisResult.relevantQuestions);
        return;
      }

      try {
        const translated = await Promise.all(
          analysisResult.relevantQuestions.map(q => 
            translateText(q, sourceLanguage, targetLanguage, apiKey)
          )
        );
        setTranslatedQuestions(translated);
      } catch (error) {
        console.error('Error translating questions:', error);
        setTranslatedQuestions(analysisResult.relevantQuestions);
      }
    };

    translateQuestions();
  }, [analysisResult.relevantQuestions, sourceLanguage, targetLanguage, apiKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatState.messages]);

  const handleSuggestedQuestion = (question: string) => {
    if (!chatState.isLoading) {
      setInput(question);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatState.isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true
    }));
    setInput('');

    try {
      const openai = new OpenAI({ 
        apiKey,
        dangerouslyAllowBrowser: true
      });

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant helping with document analysis. Here's the context:
            
            Document Summary: ${analysisResult.summary}
            
            Key Action Items:
            ${analysisResult.actionItems.map(item => '- ' + item.text).join('\n')}
            
            Full Content: ${documentContent}
            
            Provide helpful, concise answers based on this content. If asked about something not in the document, politely explain that you can only answer questions about the provided content.`
          },
          ...chatState.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: "user", content: input }
        ],
        temperature: 0.7
      });

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.choices[0].message.content || 'I apologize, but I could not generate a response.',
        timestamp: new Date()
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false
      }));
    } catch (error) {
      console.error('Chat error:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get response. Please try again.'
      }));
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">AI Assistant</h2>
            <p className="text-sm text-gray-500">Ask questions about your document</p>
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      {translatedQuestions.length > 0 && chatState.messages.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-medium text-blue-900">Suggested Questions</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {translatedQuestions.map((question, index) => (
              <motion.button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="px-3 py-1.5 text-sm bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {question}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence>
          {chatState.messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-100'
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                } shadow-lg`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                <span className="text-[10px] opacity-75 mt-1.5 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {chatState.isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the document..."
            className="w-full px-4 py-3 pr-12 text-sm bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <button
            type="submit"
            disabled={chatState.isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        {chatState.error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-xs mt-2"
          >
            {chatState.error}
          </motion.p>
        )}
      </div>
    </div>
  );
}