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
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
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
GEMINI_API_KEY=your_gemini_api_key_here
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

### 4. Firebase Setup (Optional)

The app is pre-configured with a Firebase project. If you want to use your own:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Google provider)
4. Enable Firestore Database
5. Update the config in `src/lib/firebase.ts`

### 5. Run the Application

```bash
# Development mode
npm run dev

# Start Genkit (for AI features)
npm run genkit:dev
```

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

1. **Authentication**: Users sign in with Google via Firebase
2. **Channel Sync**: Fetch user's YouTube subscriptions
3. **Channel Management**: Toggle monitoring for specific channels
4. **Video Fetching**: Get recent videos from monitored channels
5. **AI Summarization**: Generate summaries using Gemini AI
6. **Dashboard Display**: Show summaries in a beautiful card layout

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

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
