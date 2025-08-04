# Summer - AI YouTube Summarizer

A Next.js application that provides AI-powered summaries of YouTube videos from your favorite channels. Built with Firebase, Google AI (Gemini), and YouTube Data API.

## 🚀 Features

- **Google Authentication**: Secure sign-in with Google accounts
- **YouTube Channel Management**: Monitor your subscribed channels
- **AI-Powered Summaries**: Generate bullet-point summaries using Google Gemini
- **Real-time Data**: Fetch latest videos from monitored channels
- **Responsive Design**: Beautiful UI built with ShadCN components
- **Firebase Integration**: User data and preferences stored securely

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Authentication**: NextAuth.js with Google OAuth
- **Storage**: Local Storage (development) / Database (production)
- **AI**: Google Gemini 2.0 Flash via Genkit
- **APIs**: YouTube Data API v3

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Google Cloud Project** with YouTube Data API enabled
4. **Google AI API Key** for Gemini
5. **Firebase Project** (or use the existing one)

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd summer
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your API keys:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# YouTube Data API v3 Key
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here

# Google AI API Key (for Gemini)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# NextAuth.js Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 3. Get API Keys

#### YouTube Data API v3
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Add the key to your `.env.local`

#### Google AI API (Gemini)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env.local`

### 4. Google OAuth Setup

To enable Google authentication:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:9002/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
6. Copy the Client ID and Client Secret to your `.env.local`

### 5. Run the Application

```bash
# Development mode
npm run dev

# Start Genkit (for AI features)
npm run genkit:dev
```

## 🤖 AI Summary Generation

The application now supports real AI-powered video summaries! Here's how it works:

### How It Works

1. **Video Transcript Fetching**: Uses the `youtube-transcript-api` library to extract captions from YouTube videos
2. **AI Processing**: Sends the transcript to Google Gemini 2.0 Flash for intelligent summarization
3. **Real-time Generation**: Click the "AI Summary" button on any video card to generate a new summary
4. **Error Handling**: Graceful fallbacks if transcripts aren't available or AI service is down

### API Keys Required

Make sure you have these environment variables set:

```env
# Required for AI summaries
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Required for YouTube data
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
```

### Testing the AI Summaries

1. Start the development server: `npm run dev`
2. Sign in with your Google account
3. Navigate to the dashboard
4. Click the "AI Summary" button on any video card
5. Watch as the AI generates a real summary from the video transcript!

### Troubleshooting

- **"No transcript available"**: Some videos don't have captions. Try videos with auto-generated or manual captions
- **"AI service temporarily unavailable"**: Check your `GOOGLE_AI_API_KEY` is valid and has quota remaining
- **"Failed to generate AI summary"**: Check the browser console for detailed error messages

The app will be available at `http://localhost:9002`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Protected dashboard routes
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Login page
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   └── ui/               # ShadCN UI components
├── lib/                  # Utilities and services
│   ├── auth.ts           # Firebase authentication
│   ├── firebase.ts       # Firebase configuration
│   ├── user-service.ts   # User data management
│   └── youtube.ts        # YouTube API integration
└── ai/                   # AI/Genkit integration
    ├── flows/            # AI workflows
    └── genkit.ts         # Genkit configuration
```

## 🔄 Application Flow

1. **Authentication**: Users sign in with Google via NextAuth.js
2. **Channel Sync**: Fetch user's YouTube subscriptions using OAuth access token
3. **Channel Management**: Toggle monitoring for specific channels
4. **Video Fetching**: Get recent videos from monitored channels
5. **AI Summarization**: Generate summaries using Gemini AI
6. **Dashboard Display**: Show summaries in a beautiful card layout

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_YOUTUBE_API_KEY`
   - `GOOGLE_AI_API_KEY`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL` (set to your domain)
   - `NEXTAUTH_SECRET`
4. Update Google OAuth redirect URIs to include your production domain
5. Deploy!

**Live Demo**: [https://summer-eight-drab.vercel.app/](https://summer-eight-drab.vercel.app/)

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run genkit:dev   # Start Genkit AI server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

### Adding New Features

1. **New AI Flows**: Add to `src/ai/flows/`
2. **New Components**: Add to `src/components/`
3. **New Services**: Add to `src/lib/`
4. **New Pages**: Add to `src/app/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
