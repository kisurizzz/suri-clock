# SuriClock

A React Native mobile application for employee time tracking with geolocation.

## Features

- Employee account creation and authentication
- Clock in/out functionality with geolocation tracking
- Admin dashboard for data visualization
- Firebase backend for data storage
- Cost-effective implementation for small businesses

## Project Structure

```
suri-clock/
├── app/                    # Main application code
│   ├── components/         # Reusable UI components
│   ├── screens/            # Screen components
│   │   ├── auth/           # Authentication screens
│   │   ├── employee/       # Employee screens
│   │   └── admin/          # Admin screens
│   ├── navigation/         # Navigation configuration
│   ├── services/           # Firebase and other services
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── constants/          # Constants and config
├── assets/                 # Static assets
└── App.tsx                 # Root component
```

## Getting Started

1. Clone this repository
2. Install dependencies with `npm install`
3. Run the app with `npm start`

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication, Firestore, and Firebase Storage
3. Add your Firebase configuration to `app/services/firebase.ts`

## License

This project is licensed under the MIT License. 