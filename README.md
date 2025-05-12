# Sigma Hub - Professional Social Network

A modern, feature-rich professional social networking platform built with React, TypeScript, and Firebase.

## 🌟 Features

### Core Features
- **Authentication System**
  - Email/Password authentication
  - Google Sign-in
  - Secure session management
  - Protected routes

- **User Profiles**
  - Professional profile creation
  - Customizable profile sections
  - Profile completion progress
  - Skills and expertise showcase
  - Professional headline
  - Profile visibility settings

- **Networking**
  - Connection management
  - Connection requests
  - Professional network visualization
  - Mutual connections display
  - Network growth analytics

- **Messaging System**
  - Real-time chat using Pusher
  - Message status indicators
  - Typing indicators
  - Message reactions
  - Reply functionality
  - Media sharing
  - Read receipts
  - Online status

- **Feed & Content**
  - Dynamic post creation
  - Rich text formatting
  - Media attachments
  - Post interactions (likes, comments)
  - Post sharing
  - Content filtering
  - Infinite scroll

- **Job Board**
  - Job posting creation
  - Job search functionality
  - Application tracking
  - Job recommendations
  - Company profiles

### Technical Features
- **Modern UI/UX**
  - Responsive design
  - Dark/Light theme support
  - Smooth animations
  - Intuitive navigation
  - Mobile-first approach

- **Performance**
  - Optimized Firebase reads/writes
  - Efficient caching system
  - Lazy loading
  - Code splitting
  - Image optimization

- **Security**
  - Firebase security rules
  - Protected API endpoints
  - Secure data handling
  - Input validation
  - XSS protection

## 🛠️ Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Shadcn UI
  - Framer Motion
  - React Query
  - React Router

- **Backend**
  - Firebase
    - Authentication
    - Firestore
    - Storage
    - Cloud Functions
  - Pusher (Real-time features)

- **Development Tools**
  - Vite
  - ESLint
  - Prettier
  - TypeScript
  - Git

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Pusher account

### Installation

1. Clone the repository
```bash
git clone https://github.com/aj05hacker/sigma_hub_social.git
cd sigma_hub_social
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase and Pusher credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_PUSHER_APP_ID=your_pusher_app_id
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_SECRET=your_pusher_secret
VITE_PUSHER_CLUSTER=your_pusher_cluster
```

4. Start the development server
```bash
npm run dev
```

## 📦 Deployment

The project is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel for automatic deployments.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Firebase](https://firebase.google.com/) for the backend services
- [Pusher](https://pusher.com/) for real-time features
