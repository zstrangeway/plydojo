# PlyDojo Development Plan

## Last Updated
2025-05-27

## Overview
This document outlines the development roadmap for PlyDojo, prioritized by feature importance based on the canonical screen requirements defined in screensList.md. Features should be completed in the order listed to ensure the most critical functionality is developed first.

## 1. Project Setup and Infrastructure

### 1.1 Frontend Setup
- [ ] Initialize Next.js application in `apps/plydojo-web`
- [ ] Configure Tailwind CSS and shadcn/ui per screensList.md development notes
- [ ] Set up pnpm workspace structure
- [ ] Create UI component library in `packages/plydojo-ui`
- [ ] Configure ESLint and Prettier
- [ ] Set up React Context API for state management
- [ ] Create common layout components (header, navigation, etc.)

### 1.2 Backend Infrastructure
- [ ] Configure SST for serverless deployment in `apps/plydojo-infra`
- [ ] Set up AWS services (Lambda, API Gateway, DynamoDB, S3)
- [ ] Create DynamoDB schema for all entity types (see Data Model section below)
- [ ] Create Lambda function structure in `apps/plydojo-api`
- [ ] Configure authentication using AWS Cognito
- [ ] Set up CloudFront CDN for static assets
- [ ] Configure logging and monitoring via CloudWatch
- [ ] Set up AWS SES for email delivery

### 1.3 DevOps
- [ ] Create CI/CD pipeline using GitHub Actions
- [ ] Configure Development, Staging, and Production environments
- [ ] Set up SST deployment pipeline
- [ ] Implement environment-specific configuration management

## 2. Authentication System (Per screensList.md Authentication flows)

### 2.1 Login Functionality - `/login`
- [ ] Create Login Screen UI per screensList.md specifications
- [ ] Implement login form with email and password fields
- [ ] Develop login Lambda function (`plydojo-{env}-auth-login`)
- [ ] Implement JWT token generation and httpOnly cookie storage
- [ ] Create API endpoint (`POST /api/auth/login`) per screensList.md requirements
- [ ] Add rate limiting (5 attempts per minute)
- [ ] Implement "Forgot Password?" inline form display
- [ ] Handle error states and user feedback per specified flows
- [ ] Test login functionality (unit, integration, E2E)

### 2.2 Registration Functionality - `/register`
- [ ] Create Registration Screen UI with visual progress indicator
- [ ] Implement registration form with password strength indicator
- [ ] Develop registration Lambda function (`plydojo-{env}-auth-register`)
- [ ] Create API endpoint (`POST /api/auth/register`)
- [ ] Add email verification flow with 24-hour token expiration
- [ ] Implement terms of service acceptance functionality
- [ ] Create verification pending screen redirect
- [ ] Handle validation and error states per screensList.md flows
- [ ] Test registration functionality (unit, integration, E2E)

### 2.3 Email Verification Flow
- [ ] Create Verification Pending Screen (`/verify/pending`) with 5-minute resend timer
- [ ] Create Verification Success Screen (`/verify/success`) with progress completion
- [ ] Create Verification Error Screen (`/verify/error`) with recovery options
- [ ] Develop email verification Lambda function (`plydojo-{env}-auth-verifyEmail`)
- [ ] Implement resend verification functionality (`plydojo-{env}-auth-resendVerification`)
- [ ] Create API endpoints for verification flows
- [ ] Set up AWS SES email sending integration
- [ ] Implement token generation and validation with 24-hour expiration
- [ ] Test all verification flows per screensList.md specifications

### 2.4 Password Recovery
- [ ] Implement password reset request Lambda function (`plydojo-{env}-auth-requestPasswordReset`)
- [ ] Create API endpoint (`POST /api/auth/password-reset/request`)
- [ ] Implement password reset email flow
- [ ] Add rate limiting to prevent enumeration attacks
- [ ] Test password recovery flow per screensList.md specifications

## 3. Core Game Experience (Per screensList.md Core Game Experience)

### 3.1 Dashboard - `/`
- [ ] Create Dashboard UI per screensList.md layout specifications
- [ ] Implement "Start New Game" with difficulty level selection prompt
- [ ] Create "Resume Game" section with in-progress games list
- [ ] Add "Recent Games" section with game result display
- [ ] Develop statistics panel (games played, win/loss record)
- [ ] Create navigation sidebar/header with profile and notifications icons
- [ ] Implement API integration for game data retrieval
- [ ] Test dashboard functionality per specified user flows

### 3.2 Game Board and Controls - `/game/:gameId`
- [ ] Implement interactive chessboard using react-chessboard (60% screen width)
- [ ] Integrate chess.js for game rules and validation
- [ ] Create game controls (restart, undo, resign) below board
- [ ] Implement move history panel beside or below board
- [ ] Add time controls/clock functionality
- [ ] Create difficulty settings UI
- [ ] Implement model selection dropdowns:
  - [ ] Opponent Model: Stockfish (default), LLM (future), Custom (future)
  - [ ] Tutor Model: OpenAI (default), other LLMs (future)
- [ ] Develop game state management using React Context
- [ ] Implement GetGameFunction (`plydojo-{env}-games-getGame`)
- [ ] Create API endpoint (`GET /api/games/:gameId`)
- [ ] Test chessboard and controls per screensList.md user flows

### 3.3 Game Creation and Move Processing
- [ ] Implement CreateGameFunction (`plydojo-{env}-games-createGame`)
- [ ] Create MakeMoveFunction (`plydojo-{env}-games-makeMove`)
- [ ] Create API endpoints (`POST /api/games` and `POST /api/games/:gameId/moves`)
- [ ] Implement game initialization with random color assignment
- [ ] Develop move validation and processing per screensList.md flows
- [ ] Add special move handling (undo with API call, resignation)
- [ ] Create game status tracking and completion overlay
- [ ] Implement OpponentModelFactory for Stockfish integration
- [ ] Test game creation and move processing per specified flows

### 3.4 AI Tutor Chat Interface (40% screen width)
- [ ] Create chat interface UI in right panel per screensList.md layout
- [ ] Implement message input field at bottom of chat panel
- [ ] Develop chat history management with message review capability
- [ ] Create API endpoint (`POST /api/games/:gameId/chat`)
- [ ] Implement SendChatFunction (`plydojo-{env}-games-sendChat`)
- [ ] Integrate with OpenAI API for AI tutoring
- [ ] Add content filtering to keep discussions chess-focused
- [ ] Implement context-aware tutoring based on game state
- [ ] Create TutorModelFactory for OpenAI integration
- [ ] Test chat functionality and AI responses per screensList.md flows

### 3.5 Game Settings and AI Model Selection
- [ ] Create UI for changing game difficulty per screensList.md
- [ ] Implement AI model selection dropdowns per specifications
- [ ] Develop UpdateGameSettingsFunction (`plydojo-{env}-games-updateSettings`)
- [ ] Create API endpoint (`PATCH /api/games/:gameId`)
- [ ] Implement OpponentModelFactory for selecting different engines
- [ ] Create TutorModelFactory for different tutoring AI options
- [ ] Handle model switching during gameplay per screensList.md flows
- [ ] Test settings and model selection functionality

### 3.6 Game Analysis - `/game/:gameId/analysis`
- [ ] Create Game Analysis Screen UI per screensList.md specifications
- [ ] Implement move history with integrated engine evaluation
- [ ] Create visualization of alternative moves on board
- [ ] Develop position evaluation graph over time
- [ ] Add mistake highlights in move list
- [ ] Implement key position explanations from AI tutor
- [ ] Create AnalyzeGameFunction (`plydojo-{env}-games-analyzeGame`)
- [ ] Implement AnalyzeVariationFunction (`plydojo-{env}-games-analyzeVariation`)
- [ ] Create API endpoints for analysis per screensList.md requirements
- [ ] Add depth setting controls and export functionality
- [ ] Test analysis functionality per specified user flows

## 4. User Profile & Settings (Per screensList.md User Profile & Settings)

### 4.1 User Profile - `/profile`
- [ ] Create Profile Screen UI per screensList.md layout specifications
- [ ] Implement user information section with avatar and rating
- [ ] Create statistics section with games played and rating progress graph
- [ ] Add achievement badges functionality
- [ ] Implement favorite openings display
- [ ] Develop inline profile editing capability
- [ ] Create GetProfileFunction (`plydojo-{env}-users-getProfile`)
- [ ] Implement UpdateProfileFunction (`plydojo-{env}-users-updateProfile`)
- [ ] Create API endpoints for profile management per screensList.md
- [ ] Test profile functionality per specified user flows

### 4.2 User Settings - `/settings`
- [ ] Create Settings Screen UI with left sidebar categories per screensList.md
- [ ] Implement settings categories:
  - [ ] Application Preferences (language, theme, display options)
  - [ ] Board Customization (colors, piece sets, animations, coordinates)
  - [ ] Audio Settings (volume, sound effects, notifications)
  - [ ] Notification Preferences (email, in-app, game reminders)
  - [ ] Privacy Controls (visibility, data usage, account management)
- [ ] Develop GetSettingsFunction (`plydojo-{env}-settings-getSettings`)
- [ ] Implement UpdateSettingsFunction (`plydojo-{env}-settings-updateSettings`)
- [ ] Create API endpoints for settings management per screensList.md
- [ ] Ensure settings persistence and immediate effect per specifications
- [ ] Test settings functionality per specified user flows

### 4.3 Authentication Management
- [ ] Implement password change modal dialog per screensList.md
- [ ] Create ChangePasswordFunction (`plydojo-{env}-users-changePassword`)
- [ ] Add subscription management functionality
- [ ] Implement ManageSubscriptionFunction (`plydojo-{env}-users-manageSubscription`)
- [ ] Create API endpoints per screensList.md specifications
- [ ] Test authentication management per specified flows

## 5. Game History & Archive (Per screensList.md Game History)

### 5.1 Game History Screen - `/history`
- [ ] Create Game History UI per screensList.md layout specifications
- [ ] Implement filterable list with date range, outcome, opponent type filters
- [ ] Add search functionality for finding specific games
- [ ] Create sort options (recent, rating change, duration)
- [ ] Implement game entry components with all specified details
- [ ] Develop pagination or infinite scroll per screensList.md
- [ ] Create GetHistoryFunction (`plydojo-{env}-games-getHistory`)
- [ ] Implement API endpoint (`GET /api/games/history`)
- [ ] Test history functionality per specified user flows

### 5.2 Game Export
- [ ] Implement game selection for export per screensList.md
- [ ] Create export functionality in PGN format
- [ ] Develop ExportGamesFunction (`plydojo-{env}-games-exportGames`)
- [ ] Create API endpoint (`GET /api/games/export`)
- [ ] Test export functionality per specified flows

## 6. Supporting Features (Per screensList.md Supporting Screens)

### 6.1 Notifications System - `/notifications`
- [ ] Create Notifications Screen UI per screensList.md specifications
- [ ] Implement notification list with type icons and timestamps
- [ ] Add filter tabs for all/unread notifications
- [ ] Create "Mark all as read" functionality
- [ ] Implement individual notification dismissal
- [ ] Develop GetNotificationsFunction (`plydojo-{env}-notifications-getNotifications`)
- [ ] Create MarkNotificationReadFunction (`plydojo-{env}-notifications-markRead`)
- [ ] Create DeleteNotificationFunction (`plydojo-{env}-notifications-deleteNotification`)
- [ ] Implement API endpoints per screensList.md requirements
- [ ] Test notifications functionality per specified user flows

## Data Model (DynamoDB Schema)

### Users Table
```
PK: USER#{userId}
SK: METADATA
Attributes: email, name, passwordHash, status, createdAt, emailVerified, rating, subscription
```

### Games Table
```
PK: GAME#{gameId}
SK: METADATA
Attributes: userId, fen, pgn, playerColor, difficulty, opponentModel, tutorModel, status, outcome, createdAt, lastMoveAt

PK: USER#{userId}
SK: GAME#{gameId}
Attributes: gameId, createdAt, outcome, rating (GSI for user's games)
```

### Chat Table
```
PK: GAME#{gameId}
SK: CHAT#{timestamp}#{messageId}
Attributes: sender, message, relatedMoveIndex, timestamp
```

### Settings Table
```
PK: USER#{userId}
SK: SETTINGS
Attributes: appPreferences, boardSettings, audioSettings, notificationSettings, privacySettings
```

### Notifications Table
```
PK: USER#{userId}
SK: NOTIFICATION#{timestamp}#{notificationId}
Attributes: type, content, read, createdAt
```

## Error Handling Strategy
- Standardized error response format across all APIs
- Client-side error boundaries for graceful failure handling
- Comprehensive input validation with user-friendly error messages
- Rate limiting with appropriate error responses
- Graceful degradation for non-critical features

## Testing Strategy
- Unit tests for all business logic and utilities
- Integration tests for API endpoints and database operations
- End-to-end tests for critical user flows per screensList.md
- Accessibility testing for all screens
- Performance testing for chess engine and AI operations

## Current Status
- Current focus: Project Setup and Infrastructure
- Completed features: 0/150+
- Last updated: 2025-05-24 