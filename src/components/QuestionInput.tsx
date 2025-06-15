import React, { KeyboardEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { VALIDATION } from '@/lib/constants';

interface QuestionInputProps {
  question: string;
  onQuestionChange: (question: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  canSubmit: boolean;
}

const QuestionInput: React.FC<QuestionInputProps> = ({
  question,
  onQuestionChange,
  onSubmit,
  isLoading,
  canSubmit,
}) => {
  const characterCount = question.length;
  const isNearLimit = characterCount > VALIDATION.QUESTION.MAX_LENGTH * 0.8;
  const isOverLimit = characterCount > VALIDATION.QUESTION.MAX_LENGTH;

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (canSubmit) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Question Input */}
      <div className="relative">
        <textarea
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="What would you like to know? Ask a question about the selected subreddit..."
          rows={4}
          disabled={isLoading}
          className={cn(
            "w-full px-4 py-3 pr-12 text-sm resize-none",
            "bg-white dark:bg-gray-700 border rounded-lg",
            "placeholder-gray-500 dark:placeholder-gray-400",
            "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "transition-colors duration-200",
            isOverLimit 
              ? "border-red-500 dark:border-red-400" 
              : "border-gray-300 dark:border-gray-600",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        />
        
        {/* Character counter */}
        <div className={cn(
          "absolute bottom-2 right-2 text-xs",
          isOverLimit 
            ? "text-red-500 dark:text-red-400"
            : isNearLimit 
              ? "text-yellow-500 dark:text-yellow-400"
              : "text-gray-400 dark:text-gray-500"
        )}>
          {characterCount}/{VALIDATION.QUESTION.MAX_LENGTH}
        </div>
      </div>

      {/* Validation Messages */}
      {isOverLimit && (
        <p className="text-sm text-red-500 dark:text-red-400 animate-fade-in">
          Question is too long. Please keep it under {VALIDATION.QUESTION.MAX_LENGTH} characters.
        </p>
      )}

      {question.length > 0 && question.length < VALIDATION.QUESTION.MIN_LENGTH && (
        <p className="text-sm text-yellow-500 dark:text-yellow-400 animate-fade-in">
          Question should be at least {VALIDATION.QUESTION.MIN_LENGTH} characters long.
        </p>
      )}

      {/* Example Questions */}
      {question.length === 0 && (
        <div className="space-y-2 animate-fade-in">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 Example questions:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "What are the current trends in AI development?",
              "How do beginners get started with investing?",
              "What programming languages are most in demand?",
              "What are the best practices for remote work?",
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => onQuestionChange(example)}
                className="text-left p-2 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                &ldquo;{example}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <span>Press Cmd/Ctrl + Enter to submit</span>
          {question.length > 0 && (
            <span>
              ~{Math.ceil(question.length / 5)} words
            </span>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-sm",
            "transition-all duration-200 transform",
            canSubmit
              ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
              : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed",
            isLoading && "animate-pulse"
          )}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Getting Answer...</span>
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>Ask AI</span>
            </>
          )}
        </button>
      </div>

      {/* Helpful Tips */}
      {question.length > 50 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fade-in">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> The more specific your question, the better the AI can analyze relevant discussions and provide insights.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionInput; 