import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader } from 'lucide-react';
import { useAppState, useAppActions } from '../../context/AppContext';
import ChatMessage from './ChatMessage';
import LoadingSpinner from '../ui/LoadingSpinner';

const ChatPanel = () => {
  const { chatMessages, isLoading } = useAppState();
  const { sendChatMessage } = useAppActions();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');

    try {
      await sendChatMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const examplePrompts = [
    'Create a modern login form with validation',
    'Build a responsive navbar with dropdown menu',
    'Make a todo list with drag and drop',
    'Generate a pricing page with cards',
    'Create a dashboard with charts',
    'Build a contact form with email validation'
  ];

  const handleExampleClick = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-background-primary">
      {/* Header */}
      <div className="flex-shrink-0 bg-background-secondary border-b border-dark-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
            <p className="text-sm text-dark-500">Describe what you want to build</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="mb-8">
              <div className="h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Welcome to Weblify.AI
              </h3>
              <p className="text-dark-500 max-w-md">
                Describe the React application you want to build, and I'll generate the code for you.
              </p>
            </div>

            <div className="w-full max-w-2xl">
              <h4 className="text-sm font-medium text-dark-600 mb-3">Try these examples:</h4>
              <div className="grid gap-2">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(prompt)}
                    className="text-left p-3 bg-background-secondary hover:bg-background-tertiary border border-dark-200 rounded-lg transition-colors text-sm text-dark-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 p-4">
                <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <Loader className="h-4 w-4 text-white animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="bg-background-secondary rounded-lg p-3">
                    <div className="flex items-center gap-2 text-dark-500">
                      <LoadingSpinner size="small" />
                      <span className="text-sm">Generating your code...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-background-secondary border-t border-dark-200 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the React component or app you want to build..."
              className="textarea-primary min-h-[50px] max-h-32 resize-none"
              disabled={isLoading}
              rows="1"
              style={{
                height: 'auto',
                minHeight: '50px',
                maxHeight: '128px'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-primary px-4 py-2 h-[50px] flex items-center gap-2"
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-2 text-xs text-dark-500 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;