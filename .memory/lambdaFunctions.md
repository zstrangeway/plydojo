# PlyDojo Lambda Functions Implementation Document

## Document Information
**Project:** PlyDojo Chess Tutoring Platform  
**Document Type:** Technical Implementation Specification  
**Version:** 2.0  
**Last Updated:** 2025-05-27  
**Aligned with:** screensList.md, apiContracts.md, developmentPlan.md

## 1. Introduction

This document specifies the AWS Lambda functions required to implement the PlyDojo API contracts as defined in screensList.md. It outlines the logical organization of functions, deployment strategies, security considerations, and implementation details for each endpoint.

## 2. Architecture Overview

PlyDojo uses a serverless architecture with AWS Lambda functions organized by service domain, deployed via SST in the `apps/plydojo-api` directory.

### 2.1 High-Level Architecture

```
┌─────────────┐    ┌──────────────┐    ┌──────────────────┐
│ API Gateway │───►│ Authorizer   │───►│ Lambda Functions │
└─────────────┘    └──────────────┘    └──────────────────┘
       ▲                                         │
       │                                         ▼
┌─────────────┐                         ┌──────────────┐
│   Clients   │◄────────────────────────┤  DynamoDB    │
└─────────────┘                         └──────────────┘
                                                 ▲
                                                 │
                                        ┌──────────────┐
                                        │ External APIs│
                                        │ (OpenAI, SES)│
                                        └──────────────┘
```

## 3. Lambda Function Organization

### 3.1 Service-based Structure

```
apps/plydojo-api/
├── auth/             # Authentication functions
├── games/            # Game management functions
├── users/            # User profile functions
├── settings/         # User settings functions
├── notifications/    # Notification functions
├── shared/           # Shared utilities and middleware
└── types/            # TypeScript type definitions
```

### 3.2 Naming Convention

Lambda functions follow this naming pattern:
```
plydojo-{env}-{service}-{action}
```

Examples:
- `plydojo-dev-auth-login`
- `plydojo-prod-games-makeMove`
- `plydojo-staging-users-getProfile`

## 4. Lambda Functions Specification

### 4.1 Authentication Service (`auth/`)

#### 4.1.1 LoginFunction
- **Endpoint:** `POST /api/auth/login`
- **Function Name:** `plydojo-{env}-auth-login`
- **Purpose:** Authenticate users per screensList.md login flow
- **Implementation Details:**
  - Validate email/password input per API contracts
  - Compare password with hashed password in Users table
  - Generate JWT token with httpOnly cookie storage
  - Return user information and redirect to dashboard
  - Handle rate limiting (5 attempts per minute)
  - Support inline password reset flow display
- **Key Dependencies:**
  - JWT library for token generation
  - bcrypt for password verification
  - Rate limiting middleware

#### 4.1.2 RegisterFunction
- **Endpoint:** `POST /api/auth/register`
- **Function Name:** `plydojo-{env}-auth-register`
- **Purpose:** Create new user accounts per screensList.md registration flow
- **Implementation Details:**
  - Validate email format and password strength
  - Check for existing accounts with the same email
  - Hash password securely using bcrypt
  - Create user record in "pending" state
  - Generate 24-hour verification token
  - Send verification email via AWS SES
  - Return userId and verification requirement
- **Key Dependencies:**
  - AWS SES for email sending
  - bcrypt for password hashing
  - Token generation utility

#### 4.1.3 VerifyEmailFunction
- **Endpoint:** `GET /api/auth/verify-email/:token`
- **Function Name:** `plydojo-{env}-auth-verifyEmail`
- **Purpose:** Validate email verification tokens per screensList.md verification flows
- **Implementation Details:**
  - Validate token authenticity and 24-hour expiration
  - Update user status from "pending" to "active"
  - Invalidate token after use
  - Redirect to `/verify/success` or `/verify/error` per screensList.md
- **Key Dependencies:**
  - Token verification utility
  - DynamoDB user status updates

#### 4.1.4 ResendVerificationFunction
- **Endpoint:** `POST /api/auth/verify-email/resend`
- **Function Name:** `plydojo-{env}-auth-resendVerification`
- **Purpose:** Regenerate verification emails per screensList.md verification pending screen
- **Implementation Details:**
  - Find user by email
  - Invalidate previous tokens for this user
  - Generate new 24-hour verification token
  - Send verification email via AWS SES
  - Implement rate limiting (1 request per 5 minutes) per screensList.md
- **Key Dependencies:**
  - AWS SES for email sending
  - Rate limiting middleware
  - Token generation utility

#### 4.1.5 RequestPasswordResetFunction
- **Endpoint:** `POST /api/auth/password-reset/request`
- **Function Name:** `plydojo-{env}-auth-requestPasswordReset`
- **Purpose:** Generate password reset tokens per screensList.md login flow
- **Implementation Details:**
  - Process email input
  - Generate secure, time-limited reset token
  - Send password reset email with token link
  - Implement rate limiting to prevent enumeration attacks
  - Return same response regardless of email existence (security)
- **Key Dependencies:**
  - AWS SES for email sending
  - Token generation utility
  - Rate limiting middleware

### 4.2 Games Service (`games/`)

#### 4.2.1 CreateGameFunction
- **Endpoint:** `POST /api/games`
- **Function Name:** `plydojo-{env}-games-createGame`
- **Purpose:** Initialize new chess games per screensList.md dashboard flow
- **Implementation Details:**
  - Initialize new chess game in starting position using chess.js
  - Randomly assign player color per API contracts
  - Set difficulty and model configurations (opponentModel, tutorModel)
  - Create game record in Games table with model selections
  - Return game ID and redirect URL to `/game/:gameId`
- **Key Dependencies:**
  - chess.js for game initialization
  - Random color assignment logic
  - DynamoDB Games table operations

#### 4.2.2 GetGameFunction
- **Endpoint:** `GET /api/games/:gameId`
- **Function Name:** `plydojo-{env}-games-getGame`
- **Purpose:** Retrieve full game state per screensList.md main game screen requirements
- **Implementation Details:**
  - Validate user has access to requested game
  - Retrieve game state (FEN, PGN, status, model configurations)
  - Retrieve chat history from Chat table
  - Return complete state for frontend initialization per API contracts
- **Key Dependencies:**
  - Authorization checking utility
  - DynamoDB Games and Chat table operations

#### 4.2.3 MakeMoveFunction
- **Endpoint:** `POST /api/games/:gameId/moves`
- **Function Name:** `plydojo-{env}-games-makeMove`
- **Purpose:** Process player moves per screensList.md game controls flow
- **Implementation Details:**
  - Validate move legality using chess.js in current position
  - Handle special move types per API contracts:
    - Standard moves: Update game state and generate AI opponent response
    - Undo: Revert to previous position
    - Resignation: End game with resignation result
  - Use configured opponentModel for AI move generation
  - Check for game end conditions (checkmate, stalemate, draw)
  - May generate proactive tutor commentary
  - Update Games table with new position
- **Key Dependencies:**
  - chess.js for move validation
  - OpponentModelFactory for AI move generation
  - TutorModelFactory for commentary
  - Game state management utilities

#### 4.2.4 UpdateGameSettingsFunction
- **Endpoint:** `PATCH /api/games/:gameId`
- **Function Name:** `plydojo-{env}-games-updateSettings`
- **Purpose:** Update game settings per screensList.md model selection dropdowns
- **Implementation Details:**
  - Validate user ownership of game
  - Update settings in Games table (difficulty, opponentModel, tutorModel)
  - Switch model implementations if selection changed
  - Apply changes to current game state if applicable
  - Return updated game information with new model configurations
- **Key Dependencies:**
  - Authorization checking utility
  - OpponentModelFactory for engine switching
  - TutorModelFactory for tutor model switching

#### 4.2.5 SendChatFunction
- **Endpoint:** `POST /api/games/:gameId/chat`
- **Function Name:** `plydojo-{env}-games-sendChat`
- **Purpose:** Process user messages per screensList.md chat interface flow
- **Implementation Details:**
  - Store user message in Chat table
  - Get game's configured tutorModel from Games table
  - Generate context for AI tutor including:
    - Current position from game FEN
    - Move history from game PGN
    - Previous chat messages from Chat table
  - Call appropriate LLM API based on tutorModel configuration
  - Store tutor response in Chat table
  - Return both user message and tutor response per API contracts
  - Handle chess-focused content filtering
- **Key Dependencies:**
  - TutorModelFactory for LLM integration
  - Message filtering/moderation utilities
  - Context building logic
  - DynamoDB Chat table operations

#### 4.2.6 AnalyzeGameFunction
- **Endpoint:** `GET /api/games/:gameId/analysis`
- **Function Name:** `plydojo-{env}-games-analyzeGame`
- **Purpose:** Run full game analysis per screensList.md game analysis screen
- **Implementation Details:**
  - Retrieve complete game PGN from Games table
  - Process depth parameter (default to 20) per API contracts
  - For each position in game:
    - Run Stockfish analysis at specified depth
    - Store evaluation and best move
  - Identify mistakes (significant evaluation drops)
  - Identify key positions (opening transitions, critical moments)
  - Generate natural language explanations via configured tutorModel
  - Return complete analysis data per API contracts structure
- **Key Dependencies:**
  - Stockfish engine integration
  - PGN parsing utilities
  - TutorModelFactory for explanations
  - Mistake identification algorithms

#### 4.2.7 AnalyzeVariationFunction
- **Endpoint:** `POST /api/games/:gameId/analysis/variation`
- **Function Name:** `plydojo-{env}-games-analyzeVariation`
- **Purpose:** Analyze specific variations per screensList.md analysis exploration flow
- **Implementation Details:**
  - Parse starting position (FEN) and variation moves from request
  - Apply moves using chess.js to generate resulting position
  - Run Stockfish analysis on final position
  - Generate AI explanation of the variation using tutorModel
  - Return analysis with evaluation and explanation per API contracts
- **Key Dependencies:**
  - chess.js for move application
  - Stockfish engine integration
  - TutorModelFactory for explanations

#### 4.2.8 ExportGamesFunction
- **Endpoint:** `GET /api/games/:gameId/export` and `GET /api/games/export`
- **Function Name:** `plydojo-{env}-games-exportGames`
- **Purpose:** Generate game exports per screensList.md export functionality
- **Implementation Details:**
  - For single game: Retrieve game and analysis data from Games table
  - For multiple games: Validate user access to all requested games
  - Based on format parameter (PGN or PDF for single, PGN for multiple):
    - PGN: Generate annotated PGN with comments
    - PDF: Generate formatted PDF with positions and analysis
  - Set appropriate content headers for download
  - Return file for download
- **Key Dependencies:**
  - PGN generation utilities
  - PDF generation library (for PDF format)
  - Authorization checking for multiple games

#### 4.2.9 GetGameHistoryFunction
- **Endpoint:** `GET /api/games/history`
- **Function Name:** `plydojo-{env}-games-getHistory`
- **Purpose:** Retrieve paginated game history per screensList.md history screen
- **Implementation Details:**
  - Process query parameters (pagination, filters, search) per API contracts
  - Query Games table for user's games with specified filters
  - Apply search filter if provided (opening names, dates)
  - Format response with game summary data per API contracts structure
  - Include pagination metadata (page, limit, total, hasNext)
- **Key Dependencies:**
  - DynamoDB query operations with GSI for user games
  - Pagination utilities
  - Search functionality implementation

### 4.3 Users Service (`users/`)

#### 4.3.1 GetProfileFunction
- **Endpoint:** `GET /api/profile`
- **Function Name:** `plydojo-{env}-users-getProfile`
- **Purpose:** Retrieve user profile per screensList.md profile screen requirements
- **Implementation Details:**
  - Get basic user information from Users table
  - Calculate statistics from game history:
    - Games played, wins, losses, draws, win rate
    - Rating history from game records
    - Favorite openings from game data analysis
  - Get achievements earned from user record
  - Get subscription status and features from Users table
  - Return comprehensive profile data per API contracts structure
- **Key Dependencies:**
  - Statistics calculation utilities
  - Achievement tracking logic
  - DynamoDB Users and Games table operations

#### 4.3.2 UpdateProfileFunction
- **Endpoint:** `PATCH /api/profile`
- **Function Name:** `plydojo-{env}-users-updateProfile`
- **Purpose:** Update user profile per screensList.md inline editing flow
- **Implementation Details:**
  - Validate input for name, avatar URL, etc.
  - Update user record in Users table
  - Return updated user information per API contracts
- **Key Dependencies:**
  - Input validation utilities
  - DynamoDB Users table updates

#### 4.3.3 ChangePasswordFunction
- **Endpoint:** `POST /api/profile/password`
- **Function Name:** `plydojo-{env}-users-changePassword`
- **Purpose:** Update passwords per screensList.md password change modal flow
- **Implementation Details:**
  - Verify current password matches stored hash in Users table
  - Validate new password strength requirements
  - Hash new password using bcrypt
  - Update password in Users table
  - Return success confirmation per API contracts
- **Key Dependencies:**
  - bcrypt for password hashing/verification
  - Password strength validation utilities
  - DynamoDB Users table updates

#### 4.3.4 ManageSubscriptionFunction
- **Endpoint:** `PATCH /api/profile/subscription`
- **Function Name:** `plydojo-{env}-users-manageSubscription`
- **Purpose:** Manage subscription plans per screensList.md subscription management
- **Implementation Details:**
  - Process subscription change request
  - If upgrading/changing plan, process payment via Stripe
  - Update subscription status in Users table
  - Handle downgrade/upgrade logic
  - Set appropriate feature flags
  - Return updated subscription details per API contracts
- **Key Dependencies:**
  - Stripe payment processing integration
  - Subscription management logic
  - DynamoDB Users table updates

### 4.4 Settings Service (`settings/`)

#### 4.4.1 GetSettingsFunction
- **Endpoint:** `GET /api/settings`
- **Function Name:** `plydojo-{env}-settings-getSettings`
- **Purpose:** Retrieve user settings per screensList.md settings screen categories
- **Implementation Details:**
  - Get user settings from Settings table
  - Apply default values for any missing settings
  - Return structured settings object per API contracts with:
    - appPreferences (language, theme, autoSave)
    - boardSettings (colorScheme, pieceSet, animations, coordinates)
    - audioSettings (volume controls, sound effects)
    - notificationSettings (email, in-app, game reminders)
    - privacySettings (visibility, data usage, account controls)
- **Key Dependencies:**
  - Default settings configuration
  - DynamoDB Settings table operations

#### 4.4.2 UpdateSettingsFunction
- **Endpoint:** `PATCH /api/settings`
- **Function Name:** `plydojo-{env}-settings-updateSettings`
- **Purpose:** Update user settings per screensList.md settings save functionality
- **Implementation Details:**
  - Validate partial settings object per API contracts
  - Merge with existing settings from Settings table
  - Update in Settings table with immediate effect per screensList.md
  - Return updated fields per API contracts structure
- **Key Dependencies:**
  - Settings validation utilities
  - Deep merge utility for settings objects
  - DynamoDB Settings table operations

### 4.5 Notifications Service (`notifications/`)

#### 4.5.1 GetNotificationsFunction
- **Endpoint:** `GET /api/notifications`
- **Function Name:** `plydojo-{env}-notifications-getNotifications`
- **Purpose:** Retrieve notifications per screensList.md notifications screen
- **Implementation Details:**
  - Process query parameters (filter for all/unread, pagination)
  - Query Notifications table for user's notifications
  - Apply filter for read status if specified
  - Return notifications list with pagination per API contracts
  - Include notification type icons, content, timestamps, read status
- **Key Dependencies:**
  - DynamoDB Notifications table operations
  - Pagination utilities

#### 4.5.2 MarkNotificationReadFunction
- **Endpoint:** `PATCH /api/notifications/:id` and `PATCH /api/notifications/read-all`
- **Function Name:** `plydojo-{env}-notifications-markRead`
- **Purpose:** Mark notifications as read per screensList.md notification management
- **Implementation Details:**
  - For single notification: Update read status in Notifications table
  - For mark all: Update all user's unread notifications to read status
  - Return success confirmation per API contracts
  - Handle both individual and batch operations
- **Key Dependencies:**
  - DynamoDB Notifications table updates
  - Batch operation utilities

#### 4.5.3 DeleteNotificationFunction
- **Endpoint:** `DELETE /api/notifications/:id`
- **Function Name:** `plydojo-{env}-notifications-deleteNotification`
- **Purpose:** Delete notifications per screensList.md dismissal functionality
- **Implementation Details:**
  - Validate user ownership of notification
  - Remove notification from Notifications table
  - Return success confirmation per API contracts
- **Key Dependencies:**
  - Authorization checking utilities
  - DynamoDB Notifications table operations

## 5. Shared Utilities and Middleware

### 5.1 Authentication Middleware
- JWT token validation for protected endpoints
- User context extraction from tokens
- Authorization checking for resource access

### 5.2 Rate Limiting Middleware
- Implementation per API contracts specifications:
  - Authentication: 5 attempts per minute
  - Email verification resend: 1 per 5 minutes
  - Password reset: Standard rate limiting

### 5.3 Model Factories

#### 5.3.1 OpponentModelFactory
- **Purpose:** Abstract opponent AI model selection per screensList.md model dropdowns
- **Models Supported:**
  - stockfish (default): Stockfish.js integration with difficulty levels
  - llm (future): LLM-based chess playing
  - custom (future): Custom model integration
- **Implementation:** Factory pattern for model instantiation and move generation

#### 5.3.2 TutorModelFactory
- **Purpose:** Abstract tutoring AI model selection per screensList.md model dropdowns
- **Models Supported:**
  - openai (default): OpenAI GPT integration
  - other_llm (future): Alternative LLM providers
- **Implementation:** Factory pattern for context building and response generation

### 5.4 Chess Utilities
- chess.js integration for move validation and game state management
- FEN/PGN parsing and generation utilities
- Position analysis and evaluation helpers

### 5.5 Database Utilities
- DynamoDB connection and query helpers
- Data model validation and transformation
- Pagination and filtering utilities

## 6. Error Handling Strategy

### 6.1 Standardized Error Responses
- Consistent error format across all Lambda functions per API contracts
- User-friendly error messages for client display
- Appropriate HTTP status codes

### 6.2 Validation and Security
- Comprehensive input validation with specific error messages
- Authorization checks for all protected resources
- Content filtering for chat messages to maintain chess focus

### 6.3 External Service Handling
- Graceful handling of OpenAI API failures with fallback responses
- Stockfish engine error handling and recovery
- AWS SES email delivery failure handling

## 7. Performance Considerations

### 7.1 Chess Engine Optimization
- Efficient Stockfish integration with appropriate depth limits
- Caching of common opening positions and evaluations
- Worker pool management for concurrent game analysis

### 7.2 Database Optimization
- Appropriate DynamoDB table design with GSIs for user queries
- Efficient query patterns for game history and chat retrieval
- Batch operations where applicable

### 7.3 AI Integration Optimization
- Context optimization for OpenAI API calls
- Response caching for common tutoring scenarios
- Streaming responses for real-time chat experience

## 8. Deployment and Environment Configuration

### 8.1 SST Configuration
- Lambda function definitions in SST stack
- Environment-specific configuration management
- API Gateway integration and routing

### 8.2 Environment Variables
- Database connection configuration
- External API keys (OpenAI, Stripe)
- Feature flags and model configuration
- Email service configuration

### 8.3 Monitoring and Logging
- CloudWatch logs for all Lambda functions
- Performance metrics and error tracking
- User activity monitoring for analytics 