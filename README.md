# Anime Collection Website

A modern, responsive anime listing website built with Next.js, Firebase, and Cloudinary.

## Features

- 🌐 **Main Page**: Display anime cards grouped by language with hover animations
- 🎨 **Dark & Light Mode**: Toggle between themes with localStorage persistence
- 🛠️ **Admin Panel**: Add new anime with image upload functionality
- ☁️ **Cloudinary Integration**: Seamless image hosting and optimization
- 📱 **Responsive Design**: Mobile-friendly layouts
- 🔍 **Search & Filter**: Find anime by name, language, or sort by episodes
- ⚡ **Loading States**: Beautiful skeleton loaders and progress indicators

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Firebase Firestore
- **Image Storage**: Cloudinary
- **Deployment**: Vercel (recommended)

## Setup Instructions

### 1. Clone and Install

\`\`\`bash
git clone <your-repo>
cd anime-collection
npm install
\`\`\`

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Get your config keys from Project Settings

### 3. Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Settings > Upload
3. Create an unsigned upload preset
4. Note your cloud name and upload preset

### 4. Environment Variables

Create `.env.local` file:

\`\`\`env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see your app!

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Firebase Hosting

\`\`\`bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
\`\`\`

## Usage

### Adding Anime

1. Go to `/admin`
2. Click "Add Anime"
3. Fill in the form with anime details
4. Upload an image
5. Submit the form

### Features

- **Search**: Use the search bar to find anime by name
- **Filter**: Filter by language or sort by newest/most episodes
- **Theme**: Toggle between light and dark modes
- **Responsive**: Works on all device sizes

## Project Structure

\`\`\`
├── app/
│   ├── admin/page.tsx          # Admin panel
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/
│   ├── anime-card.tsx          # Individual anime card
│   ├── anime-form.tsx          # Add anime form
│   ├── loading-skeleton.tsx    # Loading states
│   └── theme-toggle.tsx        # Theme switcher
├── contexts/
│   └── theme-context.tsx       # Theme management
├── lib/
│   ├── firebase.ts             # Firebase config
│   └── cloudinary.ts           # Cloudinary upload
└── scripts/
    └── sample-data.json        # Sample data structure
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes!
