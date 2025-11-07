# Birthday Tracker

A simple yet powerful birthday tracking application with automated email reminders.

## Features

- **Firebase Authentication**: Secure login/signup with email and password
- **Birthday Management**: Full CRUD operations for tracking birthdays
- **Timezone Support**: Track birthdays across different timezones
- **Automated Email Reminders**: Get notified 5 minutes before midnight on each person's birthday (in their timezone)
- **Clean, Modern UI**: Simple and elegant interface with dark mode support

## Setup Instructions

### 1. Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Email/Password authentication in Firebase Console
3. Create a Firestore database
4. Add the following environment variables to your Vercel project:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

### 2. Email Setup (Resend)

1. Sign up for a free account at [https://resend.com](https://resend.com)
2. Get your API key
3. Add to Vercel environment variables:

\`\`\`env
RESEND_API_KEY=your_resend_api_key
\`\`\`

### 3. Cron Job Secret

Add a secret for securing the cron job endpoint:

\`\`\`env
CRON_SECRET=your_random_secret_string
\`\`\`

### 4. Firestore Security Rules

Add these security rules to your Firestore database:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Birthdays collection
    match /birthdays/{birthdayId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
\`\`\`

## How It Works

1. **User Registration**: When users sign up, their profile is stored in Firestore
2. **Birthday Tracking**: Users can add birthdays with name, company, date, and timezone
3. **Automated Reminders**: A Vercel Cron Job runs every hour to check for birthdays
4. **Smart Timing**: Emails are sent at 23:55 (5 mins before midnight) in each person's timezone
5. **Email Delivery**: Resend handles the email delivery with a beautiful HTML template

## Deployment

Deploy to Vercel with one click:

1. Connect your GitHub repository to Vercel
2. Add all environment variables
3. Deploy!

The cron job will automatically be set up through the `vercel.json` configuration.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Email**: Resend
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel
