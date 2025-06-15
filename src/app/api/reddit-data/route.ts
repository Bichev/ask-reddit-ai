import { NextRequest, NextResponse } from 'next/server';
import { CONFIG } from '@/lib/constants';
import { handleApiError } from '@/lib/utils';
import type { RedditDataRequest, RedditDataResponse, RedditPost, RedditComment } from '@/types';

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

  // Fetch top submissions from a subreddit
  async fetchTopSubmissions(subreddit: string, timeframe: string, limit: number): Promise<{ posts: RedditPost[], comments: RedditComment[] }> {
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

      const posts: RedditPost[] = [];
      const allComments: RedditComment[] = [];

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
        comments: allComments.sort((a, b) => b.score - a.score)
      };
    } catch (error) {
      console.error(`❌ Error fetching from r/${subreddit}:`, error);
      throw error;
    }
  }

  // Fetch comments for a submission
  async fetchComments(submissionId: string, limit: number = 10): Promise<RedditComment[]> {
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

      const comments: RedditComment[] = [];
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

      return comments;
    } catch (error) {
      console.error(`❌ Error fetching comments for ${submissionId}:`, error);
      return [];
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Reddit OAuth connection...');
      const accessToken = await this.getAccessToken();
      
      const response = await fetch('https://oauth.reddit.com/r/test/hot?limit=1', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': this.config.userAgent
        }
      });

      const success = response.ok;
      console.log(success ? '✅ Reddit OAuth connection successful' : '❌ Reddit OAuth connection failed');
      return success;
    } catch (error) {
      console.error('❌ Reddit OAuth connection test failed:', error);
      return false;
    }
  }
}

// Create a singleton instance
const redditService = new RedditOAuthService();

export async function POST(request: NextRequest) {
  try {
    const body: RedditDataRequest = await request.json();
    const { subreddit, timeframe = CONFIG.REDDIT.DEFAULT_TIMEFRAME, limit = CONFIG.REDDIT.DEFAULT_LIMIT } = body;

    if (!subreddit) {
      return NextResponse.json(
        { success: false, error: 'Subreddit name is required' },
        { status: 400 }
      );
    }

    // Validate limit
    const validatedLimit = Math.min(Math.max(limit, 1), CONFIG.REDDIT.MAX_LIMIT);

    const { posts, comments } = await redditService.fetchTopSubmissions(subreddit, timeframe, validatedLimit);

    const response: RedditDataResponse = {
      success: true,
      data: {
        posts,
        comments,
        subreddit,
        fetchedAt: Date.now(),
      }
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Reddit API Error:', error);
    
    const appError = handleApiError(error);
    const response: RedditDataResponse = {
      success: false,
      error: appError.message,
    };

    // Return appropriate HTTP status based on error type
    let status = 500;
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        status = 404;
      } else if (error.message.includes('private') || error.message.includes('banned')) {
        status = 403;
      } else if (error.message.includes('credentials')) {
        status = 401;
      }
    }

    return NextResponse.json(response, { status });
  }
}

// Health check endpoint
export async function GET() {
  try {
    const isConnected = await redditService.testConnection();
    
    return NextResponse.json({
      success: isConnected,
      message: isConnected ? 'Reddit API connection successful' : 'Reddit API connection failed',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Reddit API Health Check Failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Reddit API connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 