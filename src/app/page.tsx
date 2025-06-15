'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  SparklesIcon,
  ShareIcon,
  HeartIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';

import { POPULAR_SUBREDDITS, TRENDING_QUESTIONS, CONFIG, API_ENDPOINTS } from '@/lib/constants';
import { 
  validateSubreddit, 
  validateQuestion, 
  debounce, 
  formatForSharing,
  createTwitterUrl,
  copyToClipboard,
  generateId,
  saveToLocalStorage,
  loadFromLocalStorage,
} from '@/lib/utils';
import type { ShareableAnswer, AppState } from '@/types';

// Component imports (will create these next)
import SubredditSelector from '@/components/SubredditSelector';
import QuestionInput from '@/components/QuestionInput';
import TrendingQuestions from '@/components/TrendingQuestions';
import AnswerDisplay from '@/components/AnswerDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>({
    selectedSubreddit: 'AskReddit',
    customSubreddit: '',
    question: '',
    isLoading: false,
    currentAnswer: null,
    savedAnswers: [],
    selectedModel: 'gpt-4',
  });

  // Load saved answers from localStorage on mount
  useEffect(() => {
    const savedAnswers = loadFromLocalStorage<ShareableAnswer[]>(CONFIG.STORAGE.SAVED_ANSWERS_KEY, []);
    setAppState(prev => ({ ...prev, savedAnswers }));
  }, []);

  // Save answers to localStorage when savedAnswers changes
  useEffect(() => {
    if (appState.savedAnswers.length > 0) {
      saveToLocalStorage(CONFIG.STORAGE.SAVED_ANSWERS_KEY, appState.savedAnswers);
    }
  }, [appState.savedAnswers]);

  // Debounced question validation
  const debouncedValidateQuestion = debounce((question: string) => {
    if (question && question.length > 0) {
      const validation = validateQuestion(question);
      if (!validation.isValid && validation.error) {
        // Only show error if user has been typing for a while
        setTimeout(() => {
          if (question === appState.question && !validation.isValid) {
            toast.error(validation.error!);
          }
        }, 1000);
      }
    }
  }, CONFIG.UI.DEBOUNCE_DELAY);

  // Handle question input change
  const handleQuestionChange = (question: string) => {
    setAppState(prev => ({ ...prev, question }));
    debouncedValidateQuestion(question);
  };

  // Handle subreddit selection
  const handleSubredditChange = (subreddit: string) => {
    setAppState(prev => ({ 
      ...prev, 
      selectedSubreddit: subreddit,
      customSubreddit: subreddit === 'custom' ? prev.customSubreddit : '',
    }));
  };

  // Handle custom subreddit input
  const handleCustomSubredditChange = (customSubreddit: string) => {
    setAppState(prev => ({ ...prev, customSubreddit }));
  };

  // Handle trending question selection
  const handleTrendingQuestionSelect = (trendingQuestion: string, subreddit: string) => {
    setAppState(prev => ({
      ...prev,
      question: trendingQuestion,
      selectedSubreddit: subreddit,
      customSubreddit: '',
    }));
  };

  // Submit question to get AI answer
  const handleSubmitQuestion = async () => {
    const currentSubreddit = appState.selectedSubreddit === 'custom' 
      ? appState.customSubreddit 
      : appState.selectedSubreddit;

    // Validate inputs
    const subredditValidation = validateSubreddit(currentSubreddit);
    if (!subredditValidation.isValid) {
      toast.error(subredditValidation.error!);
      return;
    }

    const questionValidation = validateQuestion(appState.question);
    if (!questionValidation.isValid) {
      toast.error(questionValidation.error!);
      return;
    }

    setAppState(prev => ({ ...prev, isLoading: true, currentAnswer: null }));

    try {
      const response = await fetch(API_ENDPOINTS.ASK_QUESTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subreddit: currentSubreddit,
          question: appState.question,
          model: appState.selectedModel,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get answer');
      }

      setAppState(prev => ({ ...prev, currentAnswer: data.data }));
      toast.success('Answer generated successfully!');
    } catch (error) {
      console.error('Error getting answer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get answer');
    } finally {
      setAppState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Save current answer
  const handleSaveAnswer = () => {
    if (!appState.currentAnswer) return;

    const currentSubreddit = appState.selectedSubreddit === 'custom' 
      ? appState.customSubreddit 
      : appState.selectedSubreddit;

    const shareableAnswer: ShareableAnswer = {
      id: generateId(),
      question: appState.question,
      subreddit: currentSubreddit,
      answer: appState.currentAnswer.answer,
      timestamp: Date.now(),
    };

    setAppState(prev => ({
      ...prev,
      savedAnswers: [shareableAnswer, ...prev.savedAnswers.slice(0, CONFIG.STORAGE.MAX_SAVED_ANSWERS - 1)],
    }));

    toast.success('Answer saved!');
  };

  // Share answer
  const handleShareAnswer = async (platform: 'copy' | 'twitter') => {
    if (!appState.currentAnswer) return;

    const currentSubreddit = appState.selectedSubreddit === 'custom' 
      ? appState.customSubreddit 
      : appState.selectedSubreddit;

    const shareText = formatForSharing(
      appState.question,
      currentSubreddit,
      appState.currentAnswer.answer
    );

    if (platform === 'copy') {
      const success = await copyToClipboard(shareText);
      if (success) {
        toast.success('Copied to clipboard!');
      } else {
        toast.error('Failed to copy to clipboard');
      }
    } else if (platform === 'twitter') {
      const twitterUrl = createTwitterUrl(shareText);
      window.open(twitterUrl, '_blank');
    }
  };

  const currentSubreddit = appState.selectedSubreddit === 'custom' 
    ? appState.customSubreddit 
    : appState.selectedSubreddit;

  const canSubmit = Boolean(currentSubreddit && appState.question && !appState.isLoading);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Ask Reddit AI</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered answers from Reddit discussions
                </p>
              </div>
            </div>
            
            {/* Model Selector */}
            <div className="mt-4 sm:mt-0">
              <select
                value={appState.selectedModel}
                onChange={(e) => setAppState(prev => ({ ...prev, selectedModel: e.target.value as 'gpt-4' | 'gpt-3.5-turbo' }))}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="gpt-4">GPT-4 (Better Quality)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subreddit Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Choose a Subreddit
              </h2>
              <SubredditSelector
                selectedSubreddit={appState.selectedSubreddit}
                customSubreddit={appState.customSubreddit}
                onSubredditChange={handleSubredditChange}
                onCustomSubredditChange={handleCustomSubredditChange}
                popularSubreddits={POPULAR_SUBREDDITS}
              />
            </div>

            {/* Question Input */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ask Your Question
              </h2>
              <QuestionInput
                question={appState.question}
                onQuestionChange={handleQuestionChange}
                onSubmit={handleSubmitQuestion}
                isLoading={appState.isLoading}
                canSubmit={canSubmit}
              />
            </div>

            {/* Answer Display */}
            {(appState.currentAnswer || appState.isLoading) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI Response
                  </h2>
                  {appState.currentAnswer && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSaveAnswer}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        title="Save answer"
                      >
                        <HeartIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleShareAnswer('copy')}
                        className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                        title="Copy to clipboard"
                      >
                        <ClipboardDocumentIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleShareAnswer('twitter')}
                        className="p-2 text-gray-500 hover:text-blue-400 transition-colors"
                        title="Share on Twitter"
                      >
                        <ShareIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                {appState.isLoading ? (
                  <LoadingSpinner />
                ) : (
                  appState.currentAnswer && (
                    <AnswerDisplay answer={appState.currentAnswer} />
                  )
                )}
              </div>
            )}
          </div>

          {/* Right Column - Trending Questions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Trending Questions
              </h2>
              <TrendingQuestions
                questions={TRENDING_QUESTIONS}
                onQuestionSelect={handleTrendingQuestionSelect}
              />
            </div>

            {/* Saved Answers */}
            {appState.savedAnswers.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Saved Answers
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {appState.savedAnswers.slice(0, 5).map((answer) => (
                    <div
                      key={answer.id}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => {
                        setAppState(prev => ({
                          ...prev,
                          question: answer.question,
                          selectedSubreddit: answer.subreddit,
                          customSubreddit: '',
                        }));
                      }}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {answer.question}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        r/{answer.subreddit} • {new Date(answer.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
