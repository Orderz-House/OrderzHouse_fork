# OrderzHouse Frontend

The frontend application for OrderzHouse, a comprehensive freelance platform built with React and Vite.

## Overview

This React application provides a modern, responsive user interface for the OrderzHouse platform. It includes features for user authentication, project management, freelancer profiles, course enrollment, and real-time messaging.

## Technology Stack

- **React 19**: Latest version of React with concurrent features
- **Vite**: Fast build tool and development server
- **Redux Toolkit**: State management with slices for different features
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Socket.io-client**: Real-time communication
- **Axios**: HTTP client for API requests
- **Framer Motion**: Animation library
- **React Toastify**: Notification system
- **Google OAuth**: Social login integration

## Features

### User Interface
- Responsive design with Tailwind CSS
- Dark/light mode support (via Tailwind)
- Smooth animations with Framer Motion
- Toast notifications for user feedback

### Authentication
- User registration and login
- Google OAuth integration
- JWT token-based authentication
- Protected routes

### Core Features
- **Dashboard**: User-specific dashboard with relevant information
- **Projects**: Browse available projects, create new projects, manage ongoing projects
- **Freelancers**: View freelancer profiles, portfolios, and ratings
- **Courses**: Browse and enroll in courses, track progress
- **Messaging**: Real-time chat system
- **Profile Management**: Edit profile, portfolio, and settings
- **Admin Panel**: Administrative features for platform management

### Components Structure
- `components/`: Reusable UI components
- `admin-components/`: Admin-specific components
- `services/`: API services and utilities
- `slice/`: Redux state slices
- `store/`: Redux store configuration

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint for code quality

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and other assets
│   ├── components/        # Reusable UI components
│   │   ├── about/
│   │   ├── contact/
│   │   ├── login/
│   │   ├── navbar/
│   │   ├── profile/
│   │   ├── projects/
│   │   └── ...
│   ├── services/          # API services
│   ├── slice/             # Redux slices
│   ├── store/             # Redux store
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## Environment Variables

Create a `.env` file in the frontend root with:
```
VITE_API_BASE_URL=https://backend.thi8ah.com
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

## API Integration

The frontend communicates with the backend API through:
- Axios for HTTP requests
- Socket.io for real-time features
- Redux for state management

## Contributing

1. Follow the existing code style
2. Use ESLint rules
3. Test your changes
4. Create descriptive commit messages

## Build Configuration

This project uses Vite with the following plugins:
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint Configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
