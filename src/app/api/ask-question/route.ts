import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CONFIG } from '@/lib/constants';
import { handleApiError, extractRedditContent } from '@/lib/utils';
import type { AskQuestionRequest, AskQuestionResponse, AIResponse, SubredditData } from '@/types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Reddit OAuth2 service for client credentials authentication
class RedditOAuthService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private config: {
    clientId: string;
    clientSecret: string;
    userAgent: string;
  };

  constructor() {
    this.config = {
      clientId: process.env.REDDIT_CLIENT_ID || '',
      clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
      userAgent: 'ask-rddt-ai by /u/Witty_Ticket_4101'
    };

    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error('Reddit API credentials not configured. Please set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET');
    }
  }

  // Get OAuth2 access token using client credentials
  private async getAccessToken(): Promise<string> {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken;
      }

      console.log('🔑 Requesting new Reddit OAuth2 token...');

      // Get new access token using client credentials
      const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
      
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'User-Agent': this.config.userAgent,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Reddit OAuth failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      
      if (!this.accessToken) {
        throw new Error('No access token received from Reddit API');
      }
      
      // Token expires in 1 hour, set expiry to 50 minutes to be safe
      this.tokenExpiry = new Date(Date.now() + (50 * 60 * 1000));
      
      console.log('✅ Reddit OAuth2 token obtained successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Error getting Reddit access token:', error);
      throw new Error(`Failed to authenticate with Reddit API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fetch Reddit data directly
  async fetchSubredditData(subreddit: string, timeframe: string = '24h', limit: number = 25): Promise<SubredditData> {
    try {
      const accessToken = await this.getAccessToken();
      
      const timeMap: Record<string, string> = {
        '24h': 'day',
        '48h': 'day',
        'week': 'week',
      };

      console.log(`📥 Fetching submissions from r/${subreddit} via OAuth...`);
      
      const response = await fetch(
        `https://oauth.reddit.com/r/${subreddit}/top?t=${timeMap[timeframe] || 'day'}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': this.config.userAgent
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Subreddit r/${subreddit} not found`);
        }
        if (response.status === 403) {
          throw new Error(`Subreddit r/${subreddit} is private or banned`);
        }
        throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data?.data?.children) {
        throw new Error(`No data received from r/${subreddit}`);
      }

      const posts = [];
      const allComments = [];

      // Process submissions
      for (const child of data.data.children.slice(0, limit)) {
        const post = child.data;
        
        if (!post.stickied) {
          posts.push({
            id: post.id,
            title: post.title,
            selftext: post.selftext || '',
            author: post.author || '[deleted]',
            score: post.score || 0,
            num_comments: post.num_comments || 0,
            created_utc: post.created_utc,
            url: post.url,
            subreddit: post.subreddit,
            permalink: post.permalink,
            upvote_ratio: post.upvote_ratio || 0,
          });

          // Fetch comments for top posts
          if (posts.length <= 5) {
            try {
              const comments = await this.fetchComments(post.id, 10);
              allComments.push(...comments);
            } catch (error) {
              console.error(`Error fetching comments for post ${post.id}:`, error);
            }
          }
        }
      }

      console.log(`📊 Fetched ${posts.length} posts and ${allComments.length} comments from r/${subreddit}`);
      
      return {
        posts: posts.sort((a, b) => b.score - a.score),
        comments: allComments.sort((a, b) => b.score - a.score),
        subreddit,
        fetchedAt: Date.now()
      };
    } catch (error) {
      console.error(`❌ Error fetching from r/${subreddit}:`, error);
      throw error;
    }
  }

  // Fetch comments for a submission
  async fetchComments(submissionId: string, limit: number = 10) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(
        `https://oauth.reddit.com/comments/${submissionId}?limit=${limit}&sort=top&depth=2`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': this.config.userAgent
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching comments: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data?.[1]?.data?.children) {
        return [];
      }

      const comments = [];
      const commentListing = data[1].data.children;

      for (const comment of commentListing.slice(0, limit)) {
        if (comment.kind === 't1' && comment.data.body && 
            comment.data.body !== '[deleted]' && 
            comment.data.body !== '[removed]') {
          comments.push({
            id: comment.data.id,
            body: comment.data.body,
            author: comment.data.author || '[deleted]',
            score: comment.data.score || 0,
            created_utc: comment.data.created_utc,
            depth: 0,
          });
        }
      }

      return comments.filter(c => c.score > 0).slice(0, limit);
    } catch (error) {
      console.error(`Error fetching comments for ${submissionId}:`, error);
      return [];
    }
  }
}

// Create a singleton instance
const redditService = new RedditOAuthService();

/**
 * Generate AI response based on Reddit data and user question
 */
async function generateAIResponse(
  question: string,
  redditContent: string,
  subreddit: string,
  model: 'gpt-4o-mini' | 'gpt-3.5-turbo'
): Promise<AIResponse> {
  const systemPrompt = `You are an AI assistant that analyzes Reddit discussions and provides comprehensive, well-structured answers to user questions.

Your task is to:
1. Analyze the provided Reddit posts and comments from r/${subreddit}
2. Synthesize the information to answer the user's question
3. Provide a balanced, informative response based on the community discussions
4. Include relevant insights, trends, and perspectives from the Reddit content
5. Be objective and acknowledge different viewpoints when they exist

Guidelines:
- Focus on factual information and community consensus
- Highlight interesting insights or unique perspectives
- If there are conflicting opinions, present multiple viewpoints
- Keep your response structured and easy to read
- Don't make assumptions beyond what's discussed in the Reddit content
- If the Reddit content doesn't adequately address the question, mention this limitation

Format your response in a clear, readable manner with appropriate paragraphs.`;

  const userPrompt = `Question: ${question}

Reddit Content from r/${subreddit}:
${redditContent}

Please provide a comprehensive answer based on the Reddit discussions above.`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: CONFIG.OPENAI.MAX_TOKENS,
      temperature: CONFIG.OPENAI.TEMPERATURE,
    });

    const answer = completion.choices[0]?.message?.content || 'No response generated';
    
    // Extract sources from the content (simplified - could be enhanced)
    const sources = [
      {
        title: `Recent discussions in r/${subreddit}`,
        url: `https://reddit.com/r/${subreddit}`,
        type: 'post' as const,
      },
    ];

    return {
      answer,
      sources,
      confidence: 0.85, // This could be calculated based on content quality
      model,
      tokens_used: completion.usage?.total_tokens,
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AskQuestionRequest = await request.json();
    const { subreddit, question, model = CONFIG.OPENAI.DEFAULT_MODEL } = body;

    if (!subreddit || !question) {
      return NextResponse.json(
        { success: false, error: 'Subreddit and question are required' },
        { status: 400 }
      );
    }

    // Validate model
    if (!['gpt-4o-mini', 'gpt-3.5-turbo'].includes(model)) {
      return NextResponse.json(
        { success: false, error: 'Invalid model specified' },
        { status: 400 }
      );
    }

    // Fetch Reddit data directly (no HTTP request)
    console.log(`🔍 Processing question for r/${subreddit}: ${question}`);
    const redditData = await redditService.fetchSubredditData(subreddit, '24h', 25);
    
    if (!redditData.posts.length) {
      return NextResponse.json(
        { success: false, error: 'No recent content available for this subreddit' },
        { status: 404 }
      );
    }

    // Extract and prepare content for AI processing
    const redditContent = extractRedditContent(redditData.posts, redditData.comments);

    if (!redditContent || redditContent.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Insufficient recent content in this subreddit' },
        { status: 404 }
      );
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(question, redditContent, subreddit, model);

    const response: AskQuestionResponse = {
      success: true,
      data: aiResponse,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Ask Question API Error:', error);
    
    const appError = handleApiError(error);
    const response: AskQuestionResponse = {
      success: false,
      error: appError.message,
    };

    // Return appropriate HTTP status based on error type
    let status = 500;
    if (error && typeof error === 'object' && 'code' in error && error.code === 'insufficient_quota' || 
        (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('quota'))) {
      status = 429;
    } else if (error && typeof error === 'object' && 'status' in error && error.status === 401 || 
               (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('API key'))) {
      status = 401;
    }

    return NextResponse.json(response, { status });
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Simple test to verify OpenAI API connection
    const testCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    });
    
    return NextResponse.json({
      success: true,
      message: 'OpenAI API connection successful',
      model: testCompletion.model,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('OpenAI API Health Check Failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'OpenAI API connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
} 