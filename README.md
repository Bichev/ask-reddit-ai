# 🤖 Ask Reddit AI

> Get AI-powered answers from Reddit discussions using OpenAI GPT-4o-mini and the Reddit API

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0+-38B2AC)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991)](https://openai.com/)

A beautiful, responsive web application that lets users ask questions about any subreddit and receive AI-powered answers based on recent Reddit discussions. Features intelligent rate limiting and professional disclaimers for production use.

## ✨ Features

### 🎯 Core Features
- **Smart Subreddit Selection**: Choose from popular subreddits or enter any custom subreddit
- **AI-Powered Analysis**: Get comprehensive answers using OpenAI's GPT-4o-mini model
- **Real-time Reddit Data**: Fetches the latest posts and comments from the past 24-48 hours
- **Beautiful UI**: Modern, responsive design with dark mode support
- **Trending Questions**: Discover popular questions with a curated selection
- **Answer Sharing**: Copy answers to clipboard or share on Twitter
- **Local Storage**: Save your favorite answers for later reference

### 🚀 Advanced Features
- **Rate Limiting**: 3 requests per 24 hours in production to manage OpenAI costs
- **Development Mode**: Unlimited requests for localhost development
- **Professional Disclaimers**: Clear informational/entertainment purpose notices
- **Contact Integration**: LinkedIn and GitHub links for user inquiries
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Error Handling**: Graceful error handling with user-friendly messages
- **OAuth2 Integration**: Direct Reddit API authentication without refresh tokens

### 🛡️ Production Features
- **Cost Management**: Built-in rate limiting to control OpenAI API costs
- **User Communication**: Clear contact information and upgrade paths
- **Professional Footer**: Attribution and contact links
- **Development Detection**: Automatic unlimited access for localhost

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Heroicons, React Hot Toast
- **APIs**: OpenAI GPT-4o-mini, Reddit API (OAuth2 Client Credentials)
- **State Management**: React hooks with localStorage persistence
- **Authentication**: Reddit OAuth2 client credentials flow

## 📋 Prerequisites

Before you begin, ensure you have the following:

1. **Node.js** (v18.0.0 or higher)
2. **npm** or **yarn** package manager
3. **Reddit API credentials** (Client ID and Secret)
4. **OpenAI API key**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ask-reddit-ai.git
cd ask-reddit-ai
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Reddit API Configuration (OAuth2 Client Credentials)
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Get Reddit API Credentials

1. Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Choose **"web app"** as the app type (not script)
4. Set redirect URI to `http://localhost:3000` (required but not used)
5. Copy your `client_id` and `client_secret`

**Note**: We use OAuth2 client credentials flow, so no refresh token is needed!

### 5. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key to your `.env.local` file

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Reddit API Setup (Simplified)

### Step 1: Create a Reddit App

1. Log in to Reddit and go to https://www.reddit.com/prefs/apps
2. Scroll down and click "Create App" or "Create Another App"
3. Fill in the details:
   - **Name**: Ask Reddit AI (or any name you prefer)
   - **App type**: Select **"web app"** (important!)
   - **Description**: AI-powered Reddit discussion analyzer
   - **About URL**: Leave blank or add your project URL
   - **Redirect URI**: `http://localhost:3000` (required field)
4. Click "Create app"

### Step 2: Get Client Credentials

After creating the app, you'll see:
- **Client ID**: The string under your app name (looks like `abcdef123456`)
- **Client Secret**: The "secret" field

That's it! No token generation needed - we use OAuth2 client credentials flow.

## 📁 Project Structure

```
ask-reddit-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── ask-question/  # OpenAI integration
│   │   │   └── reddit-data/   # Reddit OAuth2 integration
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   ├── components/            # React components
│   │   ├── AnswerDisplay.tsx  # AI answer display
│   │   ├── Disclaimer.tsx     # Rate limit & disclaimer
│   │   ├── Footer.tsx         # Professional footer
│   │   ├── LoadingSpinner.tsx # Loading animations
│   │   ├── QuestionInput.tsx  # Question input form
│   │   ├── SubredditSelector.tsx # Subreddit selection
│   │   └── TrendingQuestions.tsx # Trending questions
│   ├── lib/                   # Utility functions
│   │   ├── constants.ts       # App constants
│   │   └── utils.ts           # Helper functions & rate limiting
│   └── types/                 # TypeScript types
│       └── index.ts           # Type definitions
├── public/                    # Static assets
├── .env.local                 # Environment variables
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

## 🎨 Component Architecture

### Core Components

- **`SubredditSelector`**: Dropdown with popular subreddits and custom input
- **`QuestionInput`**: Smart textarea with validation and submission
- **`AnswerDisplay`**: Rich answer formatting with metadata
- **`TrendingQuestions`**: Curated question suggestions
- **`LoadingSpinner`**: Animated loading states
- **`Disclaimer`**: Rate limiting status and disclaimers
- **`Footer`**: Professional contact information and attribution

### API Routes

- **`/api/reddit-data`**: OAuth2 Reddit API integration
- **`/api/ask-question`**: OpenAI GPT-4o-mini processing

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REDDIT_CLIENT_ID` | Reddit app client ID | ✅ |
| `REDDIT_CLIENT_SECRET` | Reddit app secret | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |

### Rate Limiting Configuration

Edit `src/lib/constants.ts` to customize:

```typescript
export const CONFIG = {
  RATE_LIMIT: {
    MAX_REQUESTS: 3,        // Requests per day
    RESET_HOURS: 24,        // Reset period
  },
  // ... other settings
};
```

### Reddit Data Limits

- **Posts**: 25 default, 100 maximum
- **Comments**: 10 per post from top 5 posts (max 50 total)
- **Sorting**: By score (highest first)
- **Timeframe**: 24h, 48h, or week

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   ```
   REDDIT_CLIENT_ID=your_client_id
   REDDIT_CLIENT_SECRET=your_client_secret
   OPENAI_API_KEY=your_openai_key
   ```
4. Deploy automatically on every push

### Production Features

- **Automatic Rate Limiting**: 3 requests per 24 hours
- **Professional Disclaimers**: Clear informational purpose notices
- **Contact Information**: LinkedIn and GitHub integration
- **Development Detection**: Unlimited requests on localhost

## 🛡️ Rate Limiting & Cost Management

### Development Mode (localhost)
- ✅ Unlimited requests
- 🟢 Green "Development Mode" disclaimer
- 🔧 Full access for testing

### Production Mode (deployed)
- 📊 3 requests per 24 hours per user
- 🔵 Blue disclaimer with contact information
- 💰 Cost-controlled OpenAI usage
- 📞 Clear upgrade/contact paths

### Contact Information
- **LinkedIn**: [Vladimir Bichev](https://www.linkedin.com/in/vladimir-bichev-383b1525/)
- **GitHub**: [ask-reddit-ai](https://github.com/Bichev/ask-reddit-ai)
- **Email**: baker@sobrd.com

## 🧪 Development

### Running in Development

```bash
npm run dev
```

- Unlimited requests on localhost
- Full debugging capabilities
- Hot reload enabled

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

### Building for Production

```bash
npm run build
npm run start
```

## 🔍 Troubleshooting

### Common Issues

**Reddit API Not Working**
- Verify your credentials in `.env.local`
- Check if your Reddit app is set to "web app" type
- Ensure client ID and secret are correct

**OpenAI API Errors** 
- Confirm your API key is active
- Check your OpenAI usage limits
- GPT-4o-mini should be available for all accounts

**Rate Limiting Issues**
- Check browser localStorage for rate limit data
- Clear localStorage to reset in development
- Contact developer for production limit increases

**Build Errors**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Add proper error handling
- Test rate limiting functionality
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for the GPT-4o-mini model
- [Reddit](https://www.reddit.com/) for the comprehensive API
- [Next.js](https://nextjs.org/) team for the fantastic framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Heroicons](https://heroicons.com/) for the beautiful icons

## 📧 Support & Contact

For questions, feature requests, or collaboration:

- **LinkedIn**: [Vladimir Bichev](https://www.linkedin.com/in/vladimir-bichev-383b1525/)
- **GitHub**: [ask-reddit-ai](https://github.com/Bichev/ask-reddit-ai)
- **Email**: baker@sobrd.com

For technical issues:
1. Check the [troubleshooting section](#-troubleshooting)
2. Search existing [GitHub issues](https://github.com/yourusername/ask-reddit-ai/issues)
3. Create a new issue with detailed information

---

<div align="center">
  <p>Made with ❤️ and AI • For informational and entertainment purposes</p>
  <p>
    <a href="#-ask-reddit-ai">Back to top</a>
  </p>
</div>
