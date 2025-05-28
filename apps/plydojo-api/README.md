# PlyDojo API

This package contains the AWS Lambda functions that power the PlyDojo backend API.

## Structure

The API is organized into domain-specific modules:

### Authentication (`auth/`)
- `login.ts` - User login with JWT token generation
- `register.ts` - User registration with email verification
- `verifyEmail.ts` - Email verification handler
- `resendVerification.ts` - Resend verification email
- `requestPasswordReset.ts` - Password reset request

### Games (`games/`)
- `createGame.ts` - Create new chess game
- `getGame.ts` - Retrieve game state
- `makeMove.ts` - Process chess moves
- `sendChat.ts` - AI tutor chat messages
- `analyzeGame.ts` - Post-game analysis
- `getHistory.ts` - User's game history

### Users (`users/`)
- `getProfile.ts` - Get user profile
- `updateProfile.ts` - Update user profile
- `changePassword.ts` - Change user password

### Settings (`settings/`)
- `getSettings.ts` - Get user preferences
- `updateSettings.ts` - Update user preferences

### Notifications (`notifications/`)
- `getNotifications.ts` - Get user notifications
- `markRead.ts` - Mark notifications as read
- `deleteNotification.ts` - Delete notification

## Development

```bash
# Install dependencies
pnpm install

# Type check
pnpm typecheck

# Build
pnpm build
```

## Environment Variables

Lambda functions have access to these environment variables (set by SST):

- `USERS_TABLE_NAME` - DynamoDB users table name
- `GAMES_TABLE_NAME` - DynamoDB games table name
- `CHAT_TABLE_NAME` - DynamoDB chat table name
- `SETTINGS_TABLE_NAME` - DynamoDB settings table name
- `NOTIFICATIONS_TABLE_NAME` - DynamoDB notifications table name

## Secrets

Sensitive values are managed through SST secrets:

- `OPENAI_API_KEY` - OpenAI API key for AI tutoring
- `JWT_SECRET` - JWT signing secret
- `STRIPE_API_KEY` - Stripe API key for subscriptions

## API Endpoints

All endpoints are deployed through API Gateway v2 with the following structure:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify/{token}` - Email verification
- `POST /api/auth/resend-verification` - Resend verification
- `POST /api/auth/password-reset/request` - Password reset

### Games
- `GET /api/games/{gameId}` - Get game
- `POST /api/games` - Create game
- `POST /api/games/{gameId}/moves` - Make move
- `POST /api/games/{gameId}/chat` - Send chat message

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

### Notifications
- `GET /api/notifications` - Get notifications

## Implementation Status

All functions are currently placeholder implementations returning 501 (Not Implemented). They will be completed according to the development plan priorities:

- Priority 2.1: Authentication functions
- Priority 3.2-3.4: Game functions
- Priority 4.1-4.2: User and settings functions
- Priority 6.1: Notifications functions 