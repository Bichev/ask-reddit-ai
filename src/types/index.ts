// Reddit API types
export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  score: number;
  num_comments: number;
  created_utc: number;
  url: string;
  subreddit: string;
  permalink: string;
  upvote_ratio: number;
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  created_utc: number;
  replies?: RedditComment[];
  depth: number;
}

export interface SubredditData {
  posts: RedditPost[];
  comments: RedditComment[];
  subreddit: string;
  fetchedAt: number;
}

// AI Response types
export interface AIResponse {
  answer: string;
  sources: {
    title: string;
    url: string;
    type: 'post' | 'comment';
  }[];
  confidence: number;
  model: string;
  tokens_used?: number;
}

// API Request/Response types
export interface AskQuestionRequest {
  subreddit: string;
  question: string;
  model?: 'gpt-4o-mini' | 'gpt-3.5-turbo';
}

export interface AskQuestionResponse {
  success: boolean;
  data?: AIResponse;
  error?: string;
}

export interface RedditDataRequest {
  subreddit: string;
  timeframe?: '24h' | '48h' | 'week';
  limit?: number;
}

export interface RedditDataResponse {
  success: boolean;
  data?: SubredditData;
  error?: string;
}

// UI Component types
export interface PopularSubreddit {
  name: string;
  description: string;
  subscribers: string;
  icon?: string;
}

export interface TrendingQuestion {
  id: string;
  question: string;
  subreddit: string;
  popularity: number;
  tags: string[];
}

export interface ShareableAnswer {
  question: string;
  subreddit: string;
  answer: string;
  timestamp: number;
  id: string;
}

// App State types
export interface AppState {
  selectedSubreddit: string;
  customSubreddit: string;
  question: string;
  isLoading: boolean;
  currentAnswer: AIResponse | null;
  savedAnswers: ShareableAnswer[];
  selectedModel: 'gpt-4o-mini' | 'gpt-3.5-turbo';
}

// Error types
export interface AppError {
  message: string;
  type: 'reddit_api' | 'openai_api' | 'network' | 'validation' | 'unknown';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
} 