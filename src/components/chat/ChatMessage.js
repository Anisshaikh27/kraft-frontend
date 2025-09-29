import React from 'react';
import { User, Bot, Copy, FileText } from 'lucide-react';
import { useAppActions } from '../../context/AppContext';

const ChatMessage = ({ message }) => {
  const { setActiveFile, setActiveTab } = useAppActions();
  const isUser = message.role === 'user';
  const isError = message.isError;

  const handleCopyCode = (content) => {
    navigator.clipboard.writeText(content);
    // Could add a toast notification here
  };

  const handleViewFile = (filePath) => {
    setActiveFile(filePath);
    setActiveTab('editor');
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-primary-600' 
          : isError 
          ? 'bg-red-500' 
          : 'bg-background-tertiary'
      }`}>
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-primary-400" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-primary-600 text-white'
            : isError
            ? 'bg-red-900/30 text-red-400 border border-red-800'
            : 'bg-background-secondary text-dark-700 border border-dark-200'
        }`}>
          {/* Message text */}
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          </div>

          {/* Generated Files */}
          {message.files && message.files.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dark-300">
              <div className="text-sm font-medium mb-2 text-dark-600">
                Generated Files:
              </div>
              <div className="space-y-2">
                {message.files.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-background-primary rounded border border-dark-300"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-dark-500" />
                      <span className="text-sm font-mono text-dark-600">
                        {file.path}
                      </span>
                      <span className="text-xs text-dark-500 bg-background-tertiary px-2 py-1 rounded">
                        {file.language || 'text'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCode(file.content)}
                        className="p-1 hover:bg-background-secondary rounded transition-colors"
                        title="Copy code"
                      >
                        <Copy className="h-3 w-3 text-dark-500" />
                      </button>
                      <button
                        onClick={() => handleViewFile(file.path)}
                        className="text-xs px-2 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-xs mt-2 ${
            isUser ? 'text-primary-200' : 'text-dark-500'
          }`}>
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;