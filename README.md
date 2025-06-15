# 🤖 Ask Reddit AI

> Get AI-powered answers from Reddit discussions using OpenAI and the Reddit API

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0+-38B2AC)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991)](https://openai.com/)

A beautiful, responsive one-page web application that lets users ask questions about any subreddit and receive synthesized AI answers based on recent Reddit discussions.

## ✨ Features

### 🎯 Core Features
- **Smart Subreddit Selection**: Choose from popular subreddits or enter any custom subreddit
- **AI-Powered Analysis**: Get comprehensive answers using GPT-4 or GPT-3.5 Turbo
- **Real-time Reddit Data**: Fetches the latest posts and comments from the past 24-48 hours
- **Beautiful UI**: Modern, responsive design with dark mode support
- **Trending Questions**: Discover popular questions with a curated carousel
- **Answer Sharing**: Copy answers to clipboard or share on Twitter
- **Local Storage**: Save your favorite answers for later reference

### 🚀 Advanced Features
- **Model Selection**: Switch between GPT-4 (better quality) and GPT-3.5 Turbo (faster)
- **Confidence Scoring**: Visual confidence indicators for AI responses
- **Source References**: See which Reddit posts and comments informed the answer
- **Answer Analytics**: Token usage and response metadata
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Error Handling**: Graceful error handling with user-friendly messages

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Heroicons, React Hot Toast
- **APIs**: OpenAI GPT-4/3.5, Reddit API (via Snoowrap)
- **State Management**: React hooks with localStorage persistence
- **Animations**: Framer Motion, custom CSS animations

## 📋 Prerequisites

Before you begin, ensure you have the following:

1. **Node.js** (v18.0.0 or higher)
2. **npm** or **yarn** package manager
3. **Reddit API credentials**
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
# Reddit API Configuration
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here
REDDIT_REFRESH_TOKEN=your_reddit_refresh_token_here

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
```

### 4. Get Reddit API Credentials

1. Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Choose "script" as the app type
4. Set redirect URI to `http://localhost:3000`
5. Copy your `client_id` and `client_secret`
6. Generate a refresh token (see detailed instructions below)

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

## 🔑 Getting Reddit API Credentials (Detailed)

### Step 1: Create a Reddit App

1. Log in to Reddit and go to https://www.reddit.com/prefs/apps
2. Scroll down and click "Create App" or "Create Another App"
3. Fill in the details:
   - **Name**: Ask Reddit AI (or any name you prefer)
   - **App type**: Select "script"
   - **Description**: AI-powered Reddit discussion analyzer
   - **About URL**: Leave blank or add your project URL
   - **Redirect URI**: `http://localhost:3000`
4. Click "Create app"

### Step 2: Get Client Credentials

After creating the app, you'll see:
- **Client ID**: The string under your app name (looks like `abcdef123456`)
- **Client Secret**: The "secret" field

### Step 3: Generate Refresh Token

The easiest way is to use the Reddit API to generate a refresh token:

```bash
# Install the snoowrap library globally for token generation
npm install -g snoowrap

# Or use this Node.js script
node -e "
const snoowrap = require('snoowrap');
const r = new snoowrap({
  userAgent: 'ask-reddit-ai',
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  username: 'YOUR_REDDIT_USERNAME',
  password: 'YOUR_REDDIT_PASSWORD'
});
console.log('Refresh Token:', r.refreshToken);
"
```

**Note**: Replace the placeholders with your actual credentials.

## 📁 Project Structure

```
ask-reddit-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── ask-question/  # OpenAI integration
│   │   │   └── reddit-data/   # Reddit API integration
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   ├── components/            # React components
│   │   ├── AnswerDisplay.tsx  # AI answer display
│   │   ├── LoadingSpinner.tsx # Loading animations
│   │   ├── QuestionInput.tsx  # Question input form
│   │   ├── SubredditSelector.tsx # Subreddit selection
│   │   └── TrendingQuestions.tsx # Trending questions
│   ├── lib/                   # Utility functions
│   │   ├── constants.ts       # App constants
│   │   └── utils.ts           # Helper functions
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
- **`QuestionInput`**: Smart textarea with validation and example questions
- **`AnswerDisplay`**: Rich answer formatting with sources and metadata
- **`TrendingQuestions`**: Curated question suggestions with popularity indicators
- **`LoadingSpinner`**: Animated loading states

### API Routes

- **`/api/reddit-data`**: Fetches posts and comments from Reddit
- **`/api/ask-question`**: Processes questions through OpenAI
- **Health checks**: Built-in API status monitoring

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REDDIT_CLIENT_ID` | Reddit app client ID | ✅ |
| `REDDIT_CLIENT_SECRET` | Reddit app secret | ✅ |
| `REDDIT_REFRESH_TOKEN` | Reddit refresh token | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |

### Customization Options

Edit `src/lib/constants.ts` to customize:

- **Popular Subreddits**: Add/remove default subreddit options
- **Trending Questions**: Update example questions
- **API Limits**: Adjust Reddit post/comment limits
- **UI Settings**: Modify debounce delays, animation durations
- **Storage Settings**: Configure localStorage behavior

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup for Production

Make sure to set these environment variables in your production environment:

```bash
REDDIT_CLIENT_ID=prod_client_id
REDDIT_CLIENT_SECRET=prod_client_secret  
REDDIT_REFRESH_TOKEN=prod_refresh_token
OPENAI_API_KEY=prod_openai_key
NEXTAUTH_URL=https://yourdomain.com
```

## 🧪 Development

### Running Tests

```bash
npm run test
# or
yarn test
```

### Linting

```bash
npm run lint
# or
yarn lint
```

### Type Checking

```bash
npm run type-check
# or
yarn type-check
```

### Building for Production

```bash
npm run build
npm run start
```

## 📊 Usage Analytics

The app tracks:
- Question complexity and response quality
- Popular subreddits and trending topics
- API usage and performance metrics
- User engagement patterns

## 🛡 Security & Privacy

- **No Personal Data Storage**: Questions and answers are not persisted server-side
- **API Key Security**: Environment variables are never exposed to client-side
- **Rate Limiting**: Built-in protection against API abuse
- **Input Validation**: Comprehensive validation for all user inputs

## 🔍 Troubleshooting

### Common Issues

**Reddit API Not Working**
- Verify your credentials in `.env.local`
- Check if your Reddit app is set to "script" type
- Ensure refresh token is valid

**OpenAI API Errors** 
- Confirm your API key is active
- Check your OpenAI usage limits
- Verify model availability (GPT-4 requires API access)

**Build Errors**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

### Debug Mode

Enable debug logging by adding to `.env.local`:

```env
NODE_ENV=development
DEBUG=true
```

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
- Write descriptive commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for the GPT models
- [Reddit](https://www.reddit.com/) for the amazing API
- [Next.js](https://nextjs.org/) team for the fantastic framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Heroicons](https://heroicons.com/) for the beautiful icons

## 📧 Support

If you have any questions or need help, please:

1. Check the [troubleshooting section](#-troubleshooting)
2. Search existing [GitHub issues](https://github.com/yourusername/ask-reddit-ai/issues)
3. Create a new issue with detailed information

---

<div align="center">
  <p>Made with ❤️ and AI</p>
  <p>
    <a href="#-ask-reddit-ai">Back to top</a>
  </p>
</div>
