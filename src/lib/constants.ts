import { PopularSubreddit, TrendingQuestion } from '@/types';

// Popular subreddits with descriptions
export const POPULAR_SUBREDDITS: PopularSubreddit[] = [
  {
    name: 'AskReddit',
    description: 'Open-ended questions for discussion',
    subscribers: '45M',
  },
  {
    name: 'technology',
    description: 'Latest tech news and discussions',
    subscribers: '14M',
  },
  {
    name: 'programming',
    description: 'Computer programming discussions',
    subscribers: '5M',
  },
  { 
    name: 'wallstreetbets',
    description: 'Wall Street Bets discussions',
    subscribers: '1.5M',
  },
  { name: 'cursor',
    description: 'Cursor discussions',
    subscribers: '500M',
  },
  {
    name: 'science',
    description: 'Science news and research',
    subscribers: '28M',
  },
  {
    name: 'investing',
    description: 'Investment strategies and market analysis',
    subscribers: '2M',
  },
  {
    name: 'entrepreneur',
    description: 'Entrepreneurship and startup discussions',
    subscribers: '1M',
  },
  {
    name: 'MachineLearning',
    description: 'ML research and applications',
    subscribers: '2.5M',
  },
  {
    name: 'cryptocurrency',
    description: 'Crypto news and analysis',
    subscribers: '6M',
  },
  {
    name: 'startups',
    description: 'Startup ecosystem discussions',
    subscribers: '1.5M',
  },
  {
    name: 'datascience',
    description: 'Data science and analytics',
    subscribers: '1.8M',
  },
];

// Sample trending questions
export const TRENDING_QUESTIONS: TrendingQuestion[] = [
  {
    id: '1',
    question: 'What are the most promising AI startups in 2024?',
    subreddit: 'MachineLearning',
    popularity: 95,
    tags: ['ai', 'startups', '2024'],
  },
  {
    id: '2',
    question: 'How do successful entrepreneurs handle failure?',
    subreddit: 'entrepreneur',
    popularity: 88,
    tags: ['entrepreneurship', 'failure', 'mindset'],
  },
  {
    id: '3',
    question: 'What programming languages should I learn in 2024?',
    subreddit: 'programming',
    popularity: 92,
    tags: ['programming', 'career', '2024'],
  },
  {
    id: '4',
    question: 'Best investment strategies for beginners?',
    subreddit: 'investing',
    popularity: 85,
    tags: ['investing', 'beginners', 'strategy'],
  },
  {
    id: '5',
    question: 'What are the biggest technology trends this year?',
    subreddit: 'technology',
    popularity: 90,
    tags: ['technology', 'trends', 'innovation'],
  },
];

// Configuration constants
export const CONFIG = {
  REDDIT: {
    DEFAULT_LIMIT: 25,
    MAX_LIMIT: 100,
    DEFAULT_TIMEFRAME: '24h' as const,
  },
  OPENAI: {
    DEFAULT_MODEL: 'gpt-4o-mini' as const,
    MAX_TOKENS: 4000,
    TEMPERATURE: 0.7,
  },
  UI: {
    DEBOUNCE_DELAY: 300,
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 4000,
  },
  STORAGE: {
    SAVED_ANSWERS_KEY: 'ask-reddit-ai-saved-answers',
    PREFERENCES_KEY: 'ask-reddit-ai-preferences',
    RATE_LIMIT_KEY: 'ask-reddit-ai-rate-limit',
    MAX_SAVED_ANSWERS: 50,
  },
  RATE_LIMIT: {
    MAX_REQUESTS: 3,
    RESET_HOURS: 24,
  },
  CONTACT: {
    LINKEDIN: 'https://www.linkedin.com/in/vladimir-bichev-383b1525/',
    GITHUB: 'https://github.com/Bichev/ask-reddit-ai',
    EMAIL: 'baker@sobrd.com', // Replace with your email
  },
} as const;

// API endpoints
export const API_ENDPOINTS = {
  ASK_QUESTION: '/api/ask-question',
  FETCH_REDDIT_DATA: '/api/reddit-data',
  HEALTH_CHECK: '/api/health',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  SUBREDDIT_NOT_FOUND: 'Subreddit not found. Please check the spelling and try again.',
  QUESTION_TOO_SHORT: 'Please enter a question with at least 5 characters.',
  QUESTION_TOO_LONG: 'Question is too long. Please keep it under 500 characters.',
  NO_REDDIT_DATA: 'No recent posts found in this subreddit. Try a different one.',
  OPENAI_ERROR: 'Failed to generate answer. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment before trying again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

// Validation rules
export const VALIDATION = {
  SUBREDDIT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  QUESTION: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 500,
  },
} as const; 