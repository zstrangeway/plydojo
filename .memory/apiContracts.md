# PlyDojo API Contracts

## Last Updated
2025-05-27

This document outlines the API contracts for the PlyDojo chess tutoring application based on the canonical requirements defined in screensList.md.

## Data Type Specifications

### Common Data Types
- **Timestamp**: ISO8601 format string (e.g., "2025-05-27T14:30:00.000Z")
- **Rating**: Integer between 0-3000 (ELO-based system)
- **GameId**: UUID string format
- **UserId**: UUID string format

### Validation Constraints
- **Email**: Valid email format, max 254 characters
- **Password**: 8-72 characters, must contain uppercase, lowercase, number
- **Name**: 1-50 characters, alphanumeric plus spaces, hyphens, underscores
- **Avatar URL**: Valid HTTPS URL, max 500 characters

## Authentication API

### Login
- **Endpoint:** `POST /api/auth/login`
- **Request:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "status": "active"
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "message": "Invalid credentials"
  }
  ```
- **Authorization:** None
- **Notes:** 
  - JWT token set as httpOnly cookie per screensList.md requirements
  - Rate limiting (5 attempts per minute)
  - Password reset functionality handled inline on login screen

### Registration
- **Endpoint:** `POST /api/auth/register`
- **Request:**
  ```json
  {
    "email": {
      "type": "string",
      "format": "email",
      "maxLength": 254,
      "required": true
    },
    "password": {
      "type": "string",
      "minLength": 8,
      "maxLength": 72,
      "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
      "required": true
    },
    "passwordConfirmation": {
      "type": "string",
      "mustMatch": "password",
      "required": true
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50,
      "pattern": "^[a-zA-Z0-9\\s\\-_]+$",
      "required": true
    },
    "acceptedTerms": {
      "type": "boolean",
      "mustBe": true,
      "required": true
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "verificationRequired": true
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "message": "Registration failed",
    "errors": {
      "email": ["Email already in use"],
      "password": ["Password too weak"]
    }
  }
  ```
- **Authorization:** None
- **Processing:**
  - Creates account in "pending" state per screensList.md flows
  - Generates 24-hour verification token
  - Sends verification email via AWS SES

### Email Verification
- **Endpoint:** `GET /api/auth/verify-email/:token`
- **Parameters:** token in URL
- **Response:** Redirect to `/verify/success` or `/verify/error` per screensList.md
- **Processing:**
  - Updates user status to "active" if valid
  - Invalidates token after use
  - 24-hour token expiration

### Resend Verification
- **Endpoint:** `POST /api/auth/verify-email/resend`
- **Request:**
  ```json
  {
    "email": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Verification email sent"
  }
  ```
- **Authorization:** None
- **Notes:**
  - Rate limited (1 request per 5 minutes) per screensList.md
  - Invalidates previous tokens for this user

### Password Reset Request
- **Endpoint:** `POST /api/auth/password-reset/request`
- **Request:**
  ```json
  {
    "email": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password reset email sent"
  }
  ```
- **Authorization:** None
- **Notes:**
  - Same response regardless of email existence (security)
  - Rate limited to prevent enumeration attacks

## Game Management API

### Create New Game
- **Endpoint:** `POST /api/games`
- **Request:**
  ```json
  {
    "difficultyLevel": 1,
    "opponentModel": "stockfish",
    "tutorModel": "openai"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "gameId": "string",
    "redirect": "/game/:gameId"
  }
  ```
- **Authorization:** Authenticated User
- **Processing:**
  - Initialize new chess game per screensList.md requirements
  - Randomly assign player color
  - Set difficulty and model configurations

### Get Game State
- **Endpoint:** `GET /api/games/:gameId`
- **Parameters:** gameId in URL
- **Response:**
  ```json
  {
    "game": {
      "id": "string",
      "fen": "string",
      "pgn": "string",
      "playerColor": "white",
      "difficulty": 1,
      "opponentModel": "stockfish",
      "tutorModel": "openai",
      "status": "active",
      "outcome": null,
      "createdAt": "timestamp",
      "lastMoveAt": "timestamp"
    },
    "chatHistory": [
      {
        "id": "string",
        "sender": "tutor",
        "message": "string",
        "timestamp": "number",
        "relatedMoveIndex": 0
      }
    ]
  }
  ```
- **Authorization:** Authenticated User (owner of game)
- **Notes:** Returns complete state for frontend initialization per screensList.md

### Make Move
- **Endpoint:** `POST /api/games/:gameId/moves`
- **Request:**
  ```json
  {
    "move": "e2e4",
    "timestamp": 1621500000000,
    "type": "move"
  }
  ```
- **Special Move Types:**
  ```json
  {
    "type": "undo",
    "timestamp": 1621500000000
  }
  ```
  ```json
  {
    "type": "resign",
    "timestamp": 1621500000000
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "gameState": {
      "fen": "string",
      "pgn": "string",
      "status": "active",
      "lastMove": "e2e4"
    },
    "opponentMove": {
      "move": "e7e5",
      "timestamp": 1621500000000
    },
    "tutorComment": {
      "message": "Good opening move!",
      "timestamp": 1621500000000
    }
  }
  ```
- **Authorization:** Authenticated User (owner of game)
- **Processing:**
  - Validates move per chess.js rules
  - Generates AI opponent response using configured opponentModel
  - May include proactive tutor commentary

### Update Game Settings
- **Endpoint:** `PATCH /api/games/:gameId`
- **Request:**
  ```json
  {
    "difficulty": 2,
    "opponentModel": "stockfish",
    "tutorModel": "openai"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "game": {
      "id": "string",
      "difficulty": 2,
      "opponentModel": "stockfish",
      "tutorModel": "openai"
    }
  }
  ```
- **Authorization:** Authenticated User (owner of game)
- **Validation Rules:**
  - Opponent model changes only allowed before game starts or between moves
  - Tutor model changes allowed at any time during game
  - Difficulty changes apply to future opponent moves only
  - Cannot change settings for completed games
- **Notes:** Changes take effect immediately for tutor, on next move for opponent

### Send Chat Message
- **Endpoint:** `POST /api/games/:gameId/chat`
- **Request:**
  ```json
  {
    "message": "What should I do next?",
    "timestamp": 1621500000000
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "userMessage": {
      "id": "string",
      "sender": "user",
      "message": "What should I do next?",
      "timestamp": 1621500000000
    },
    "tutorResponse": {
      "id": "string",
      "sender": "tutor",
      "message": "Consider developing your knights before bishops.",
      "timestamp": 1621500000001,
      "relatedMoveIndex": 3
    }
  }
  ```
- **Authorization:** Authenticated User (owner of game)
- **Processing:**
  - Uses configured tutorModel for response generation
  - Includes game context (current position, move history)
  - Content filtering to keep discussions chess-focused

### Get Game Analysis
- **Endpoint:** `GET /api/games/:gameId/analysis`
- **Parameters:** 
  - `depth` (optional, default 20)
- **Response:**
  ```json
  {
    "gameId": "string",
    "analysis": {
      "moves": [
        {
          "moveNumber": 1,
          "move": "e4",
          "evaluation": 0.3,
          "bestMove": "e4",
          "isBlunder": false,
          "alternatives": [
            {"move": "d4", "evaluation": 0.2},
            {"move": "Nf3", "evaluation": 0.1}
          ]
        }
      ],
      "mistakes": [
        {
          "moveNumber": 5,
          "move": "Nf6??",
          "evaluation": -2.1,
          "explanation": "This move loses material"
        }
      ],
      "keyPositions": [
        {
          "moveNumber": 8,
          "explanation": "Opening transition to middlegame"
        }
      ]
    }
  }
  ```
- **Authorization:** Authenticated User (owner of game)

### Analyze Variation
- **Endpoint:** `POST /api/games/:gameId/analysis/variation`
- **Request:**
  ```json
  {
    "fen": "starting position",
    "moves": ["e4", "e5", "Nf3"],
    "depth": 20
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "analysis": {
      "finalPosition": "fen string",
      "evaluation": 0.5,
      "bestMove": "Nc3",
      "explanation": "This variation leads to a slight advantage for white"
    }
  }
  ```
- **Authorization:** Authenticated User (owner of game)

### Export Game
- **Endpoint:** `GET /api/games/:gameId/export`
- **Parameters:**
  - `format` (pgn or pdf)
- **Response:** File download with appropriate headers
- **Authorization:** Authenticated User (owner of game)

### Export Multiple Games
- **Endpoint:** `GET /api/games/export`
- **Parameters:**
  - `gameIds[]` (array of game IDs)
  - `format` (pgn only for multiple games)
- **Response:** PGN file download
- **Authorization:** Authenticated User (owner of all games)

### Get Game History
- **Endpoint:** `GET /api/games/history`
- **Parameters:**
  - `page` (integer, min: 1, default: 1)
  - `limit` (integer, min: 1, max: 100, default: 20)
  - `outcome` (enum: "win"|"loss"|"draw"|"resigned", optional)
  - `opponentType` (enum: "stockfish"|"llm"|"custom", optional)
  - `dateFrom` (ISO8601 timestamp, optional)
  - `dateTo` (ISO8601 timestamp, optional)
  - `search` (string, max: 100 characters, optional)
  - `sortBy` (enum: "recent"|"rating"|"duration", default: "recent")
- **Response:**
  ```json
  {
    "games": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2025-05-27T14:30:00.000Z",
        "outcome": "win",
        "opponentType": "stockfish",
        "opening": "Sicilian Defense",
        "duration": 1800,
        "ratingChange": 15,
        "finalPosition": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "hasNext": true,
      "hasPrevious": false
    }
  }
  ```
- **Authorization:** Authenticated User

## User Management API

### Get Profile
- **Endpoint:** `GET /api/profile`
- **Response:**
  ```json
  {
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "avatar": "url",
      "createdAt": "timestamp",
      "rating": 1200
    },
    "statistics": {
      "gamesPlayed": 150,
      "wins": 75,
      "losses": 60,
      "draws": 15,
      "winRate": 0.5,
      "ratingHistory": [
        {"date": "timestamp", "rating": 1200}
      ],
      "favoriteOpenings": [
        {"opening": "Sicilian Defense", "count": 25}
      ],
      "achievements": [
        {"id": "first_win", "title": "First Victory", "unlockedAt": "timestamp"}
      ]
    },
    "subscription": {
      "plan": "free",
      "status": "active",
      "features": ["basic_analysis"]
    }
  }
  ```
- **Authorization:** Authenticated User

### Update Profile
- **Endpoint:** `PATCH /api/profile`
- **Request:**
  ```json
  {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50,
      "pattern": "^[a-zA-Z0-9\\s\\-_]+$",
      "optional": true
    },
    "avatar": {
      "type": "string",
      "format": "url",
      "protocol": "https",
      "maxLength": 500,
      "fileTypes": ["image/jpeg", "image/png", "image/webp"],
      "maxFileSize": "5MB",
      "dimensions": "min: 64x64, max: 1024x1024",
      "optional": true
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "user": {
      "id": "string",
      "name": "string",
      "avatar": "url"
    }
  }
  ```
- **Authorization:** Authenticated User

### Change Password
- **Endpoint:** `POST /api/profile/password`
- **Request:**
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password updated successfully"
  }
  ```
- **Authorization:** Authenticated User

### Update Subscription
- **Endpoint:** `PATCH /api/profile/subscription`
- **Request:**
  ```json
  {
    "plan": "premium",
    "paymentMethod": "stripe_token"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "subscription": {
      "plan": "premium",
      "status": "active",
      "nextBilling": "timestamp",
      "features": ["advanced_analysis", "unlimited_games"]
    }
  }
  ```
- **Authorization:** Authenticated User

## Settings API

### Get Settings
- **Endpoint:** `GET /api/settings`
- **Response:**
  ```json
  {
    "appPreferences": {
      "language": {
        "type": "string",
        "enum": ["en", "es", "fr", "de", "it", "pt", "ru", "zh"],
        "default": "en"
      },
      "theme": {
        "type": "string", 
        "enum": ["light", "dark", "auto"],
        "default": "light"
      },
      "autoSave": {
        "type": "boolean",
        "default": true
      },
      "timezone": {
        "type": "string",
        "format": "timezone",
        "default": "UTC"
      }
    },
    "boardSettings": {
      "colorScheme": {
        "type": "string",
        "enum": ["brown", "green", "blue", "purple", "marble", "wood"],
        "default": "brown"
      },
      "pieceSet": {
        "type": "string",
        "enum": ["classic", "modern", "fantasy", "staunton", "alpha"],
        "default": "classic"
      },
      "animationSpeed": {
        "type": "string",
        "enum": ["slow", "normal", "fast", "instant"],
        "default": "normal"
      },
      "showCoordinates": {
        "type": "boolean",
        "default": true
      },
      "highlightMoves": {
        "type": "boolean",
        "default": true
      },
      "showLegalMoves": {
        "type": "boolean",
        "default": false
      },
      "boardOrientation": {
        "type": "string",
        "enum": ["auto", "white", "black"],
        "default": "auto"
      }
    },
    "audioSettings": {
      "masterVolume": {
        "type": "number",
        "min": 0.0,
        "max": 1.0,
        "step": 0.1,
        "default": 0.8
      },
      "moveSound": {
        "type": "boolean",
        "default": true
      },
      "captureSound": {
        "type": "boolean", 
        "default": true
      },
      "checkSound": {
        "type": "boolean",
        "default": true
      },
      "notificationSound": {
        "type": "boolean",
        "default": true
      },
      "soundPack": {
        "type": "string",
        "enum": ["classic", "modern", "vintage", "electronic"],
        "default": "classic"
      }
    },
    "notificationSettings": {
      "emailGameReminders": {
        "type": "boolean",
        "default": true
      },
      "emailWeeklyReport": {
        "type": "boolean",
        "default": false
      },
      "emailNewFeatures": {
        "type": "boolean",
        "default": true
      },
      "inAppNotifications": {
        "type": "boolean",
        "default": true
      },
      "gameInvites": {
        "type": "boolean",
        "default": true
      },
      "tutorProactiveComments": {
        "type": "boolean",
        "default": true
      },
      "achievementNotifications": {
        "type": "boolean",
        "default": true
      }
    },
    "privacySettings": {
      "profileVisibility": {
        "type": "string",
        "enum": ["public", "friends", "private"],
        "default": "public"
      },
      "gameHistoryVisibility": {
        "type": "string",
        "enum": ["public", "friends", "private"],
        "default": "friends"
      },
      "onlineStatus": {
        "type": "string",
        "enum": ["visible", "friends", "invisible"],
        "default": "visible"
      },
      "dataUsage": {
        "type": "string",
        "enum": ["essential", "analytics", "all"],
        "default": "analytics"
      },
      "allowDataExport": {
        "type": "boolean",
        "default": true
      }
    }
  }
  ```
- **Authorization:** Authenticated User

### Update Settings
- **Endpoint:** `PATCH /api/settings`
- **Request:**
  ```json
  {
    "appPreferences": {
      "theme": "dark"
    },
    "boardSettings": {
      "showCoordinates": false
    }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "updatedSettings": {
      "appPreferences": {
        "theme": "dark"
      },
      "boardSettings": {
        "showCoordinates": false
      }
    }
  }
  ```
- **Authorization:** Authenticated User
- **Notes:** Settings take effect immediately per screensList.md

## Notifications API

### Get Notifications
- **Endpoint:** `GET /api/notifications`
- **Parameters:**
  - `filter` (all, unread)
  - `page` (pagination)
  - `limit` (items per page)
- **Response:**
  ```json
  {
    "notifications": [
      {
        "id": "string",
        "type": "game_invite",
        "content": "You have a new game invitation",
        "timestamp": "number",
        "read": false,
        "actionUrl": "/game/123"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "hasNext": false
    }
  }
  ```
- **Authorization:** Authenticated User

### Mark Notification as Read
- **Endpoint:** `PATCH /api/notifications/:id`
- **Request:**
  ```json
  {
    "read": true
  }
  ```
- **Response:**
  ```json
  {
    "success": true
  }
  ```
- **Authorization:** Authenticated User

### Mark All Notifications as Read
- **Endpoint:** `PATCH /api/notifications/read-all`
- **Response:**
  ```json
  {
    "success": true,
    "updated": 5
  }
  ```
- **Authorization:** Authenticated User

### Delete Notification
- **Endpoint:** `DELETE /api/notifications/:id`
- **Response:**
  ```json
  {
    "success": true
  }
  ```
- **Authorization:** Authenticated User

## Data Models

### User Model
```json
{
  "id": {
    "type": "string",
    "format": "uuid"
  },
  "email": {
    "type": "string",
    "format": "email",
    "maxLength": 254
  },
  "name": {
    "type": "string",
    "minLength": 1,
    "maxLength": 50,
    "pattern": "^[a-zA-Z0-9\\s\\-_]+$"
  },
  "passwordHash": {
    "type": "string",
    "internal": true
  },
  "status": {
    "type": "string",
    "enum": ["pending", "active", "suspended", "deleted"]
  },
  "createdAt": {
    "type": "string",
    "format": "iso8601"
  },
  "emailVerified": {
    "type": "boolean"
  },
  "rating": {
    "type": "integer",
    "min": 0,
    "max": 3000,
    "default": 1200
  },
  "subscription": {
    "plan": {
      "type": "string",
      "enum": ["free", "premium", "pro"]
    },
    "status": {
      "type": "string", 
      "enum": ["active", "canceled", "past_due", "expired"]
    },
    "features": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "basic_analysis",
          "advanced_analysis", 
          "unlimited_games",
          "priority_support",
          "custom_openings",
          "detailed_statistics",
          "game_export",
          "multiple_ai_models",
          "tournament_mode"
        ]
      }
    },
    "billingCycle": {
      "type": "string",
      "enum": ["monthly", "yearly"]
    },
    "nextBilling": {
      "type": "string",
      "format": "iso8601"
    }
  }
}
```

### Game Model
```json
{
  "id": {
    "type": "string", 
    "format": "uuid"
  },
  "userId": {
    "type": "string",
    "format": "uuid"
  },
  "fen": {
    "type": "string",
    "format": "fen",
    "description": "Forsyth-Edwards Notation for current position"
  },
  "pgn": {
    "type": "string",
    "format": "pgn",
    "description": "Portable Game Notation for full game"
  },
  "playerColor": {
    "type": "string",
    "enum": ["white", "black"]
  },
  "difficulty": {
    "type": "integer",
    "min": 1,
    "max": 20,
    "description": "Stockfish depth/strength level"
  },
  "opponentModel": {
    "type": "string",
    "enum": ["stockfish", "gpt-4", "claude", "custom"],
    "description": "AI model handling opponent moves"
  },
  "tutorModel": {
    "type": "string", 
    "enum": ["gpt-4", "gpt-3.5-turbo", "claude-3", "claude-3.5"],
    "description": "AI model handling tutoring chat"
  },
  "status": {
    "type": "string",
    "enum": ["active", "completed", "resigned", "abandoned"]
  },
  "outcome": {
    "type": "string",
    "enum": ["win", "loss", "draw", "resigned_by_player", "resigned_by_opponent"],
    "nullable": true
  },
  "createdAt": {
    "type": "string",
    "format": "iso8601"
  },
  "lastMoveAt": {
    "type": "string", 
    "format": "iso8601"
  },
  "moveCount": {
    "type": "integer",
    "min": 0
  },
  "timeControl": {
    "type": "object",
    "properties": {
      "initialMinutes": {"type": "integer", "min": 1, "max": 180},
      "increment": {"type": "integer", "min": 0, "max": 60}
    }
  }
}
```

### Chat Message Model
```json
{
  "id": {
    "type": "string",
    "format": "uuid"
  },
  "gameId": {
    "type": "string", 
    "format": "uuid"
  },
  "sender": {
    "type": "string",
    "enum": ["user", "tutor", "system"]
  },
  "message": {
    "type": "string",
    "minLength": 1,
    "maxLength": 2000
  },
  "timestamp": {
    "type": "string",
    "format": "iso8601"
  },
  "relatedMoveIndex": {
    "type": "integer",
    "min": 0,
    "nullable": true,
    "description": "Move number this message relates to"
  },
  "messageType": {
    "type": "string",
    "enum": ["chat", "analysis", "hint", "correction", "praise"],
    "default": "chat"
  }
}
```

### Settings Model
```json
{
  "userId": {
    "type": "string",
    "format": "uuid"
  },
  "appPreferences": {
    "type": "object",
    "properties": {
      "language": {"type": "string", "enum": ["en", "es", "fr", "de", "it", "pt", "ru", "zh"]},
      "theme": {"type": "string", "enum": ["light", "dark", "auto"]},
      "autoSave": {"type": "boolean"},
      "timezone": {"type": "string", "format": "timezone"}
    }
  },
  "boardSettings": {
    "type": "object", 
    "properties": {
      "colorScheme": {"type": "string", "enum": ["brown", "green", "blue", "purple", "marble", "wood"]},
      "pieceSet": {"type": "string", "enum": ["classic", "modern", "fantasy", "staunton", "alpha"]},
      "animationSpeed": {"type": "string", "enum": ["slow", "normal", "fast", "instant"]},
      "showCoordinates": {"type": "boolean"},
      "highlightMoves": {"type": "boolean"},
      "showLegalMoves": {"type": "boolean"},
      "boardOrientation": {"type": "string", "enum": ["auto", "white", "black"]}
    }
  },
  "audioSettings": {
    "type": "object",
    "properties": {
      "masterVolume": {"type": "number", "min": 0.0, "max": 1.0},
      "moveSound": {"type": "boolean"},
      "captureSound": {"type": "boolean"},
      "checkSound": {"type": "boolean"}, 
      "notificationSound": {"type": "boolean"},
      "soundPack": {"type": "string", "enum": ["classic", "modern", "vintage", "electronic"]}
    }
  },
  "notificationSettings": {
    "type": "object",
    "properties": {
      "emailGameReminders": {"type": "boolean"},
      "emailWeeklyReport": {"type": "boolean"},
      "emailNewFeatures": {"type": "boolean"},
      "inAppNotifications": {"type": "boolean"},
      "gameInvites": {"type": "boolean"},
      "tutorProactiveComments": {"type": "boolean"},
      "achievementNotifications": {"type": "boolean"}
    }
  },
  "privacySettings": {
    "type": "object",
    "properties": {
      "profileVisibility": {"type": "string", "enum": ["public", "friends", "private"]},
      "gameHistoryVisibility": {"type": "string", "enum": ["public", "friends", "private"]}, 
      "onlineStatus": {"type": "string", "enum": ["visible", "friends", "invisible"]},
      "dataUsage": {"type": "string", "enum": ["essential", "analytics", "all"]},
      "allowDataExport": {"type": "boolean"}
    }
  },
  "updatedAt": {
    "type": "string",
    "format": "iso8601"
  }
}
```

### Notification Model
```json
{
  "id": {
    "type": "string",
    "format": "uuid"
  },
  "userId": {
    "type": "string",
    "format": "uuid"
  },
  "type": {
    "type": "string",
    "enum": [
      "game_invite",
      "game_reminder", 
      "achievement_unlocked",
      "rating_milestone",
      "weekly_report",
      "system_announcement",
      "feature_update",
      "payment_reminder"
    ]
  },
  "content": {
    "type": "string",
    "minLength": 1,
    "maxLength": 500
  },
  "read": {
    "type": "boolean",
    "default": false
  },
  "createdAt": {
    "type": "string",
    "format": "iso8601"
  },
  "actionUrl": {
    "type": "string",
    "format": "url",
    "nullable": true,
    "maxLength": 500
  },
  "priority": {
    "type": "string",
    "enum": ["low", "normal", "high", "urgent"],
    "default": "normal"
  },
  "expiresAt": {
    "type": "string", 
    "format": "iso8601",
    "nullable": true
  }
}
```

## Rating System Specification

### Rating Calculation
- **Initial Rating**: 1200 (new users)
- **Rating Range**: 0-3000
- **System**: Modified ELO system
- **K-Factor**: 
  - New players (< 30 games): K=32
  - Intermediate players (30-100 games): K=24  
  - Experienced players (> 100 games): K=16

### Rating Change Calculation
```
ExpectedScore = 1 / (1 + 10^((OpponentRating - PlayerRating) / 400))
RatingChange = K * (ActualScore - ExpectedScore)

Where:
- ActualScore: 1 (win), 0.5 (draw), 0 (loss)
- K: K-factor based on experience level
- Minimum change: ±1 point
- Maximum change: ±50 points per game
```

### AI Opponent Ratings by Difficulty
- **Level 1-5**: 800-1200 (Beginner)
- **Level 6-10**: 1200-1600 (Intermediate) 
- **Level 11-15**: 1600-2000 (Advanced)
- **Level 16-20**: 2000-2400 (Expert)

## File Upload Specifications

### Avatar Images
- **Formats**: JPEG, PNG, WebP
- **Max Size**: 5MB
- **Dimensions**: 64x64 to 1024x1024 pixels
- **Aspect Ratio**: 1:1 (square)
- **Processing**: Auto-resize to 256x256 for storage

### Game Exports
- **PGN Files**: Max 1MB per file, 10MB for bulk export
- **PDF Files**: Max 5MB per analysis report
- **Batch Limits**: Max 100 games per export request

## Security Considerations

### Error Response Schema
All API endpoints use a standardized error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message", 
    "details": {
      "field": "specific validation error",
      "value": "invalid input value",
      "constraint": "validation rule violated"
    },
    "timestamp": "2025-05-27T14:30:00.000Z",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_REQUIRED`: JWT token missing or invalid
- `AUTHORIZATION_DENIED`: User lacks permission for resource
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED`: Too many requests from client
- `INVALID_MOVE`: Chess move is not legal in current position
- `GAME_NOT_ACTIVE`: Operation not allowed on completed game
- `EMAIL_ALREADY_EXISTS`: Registration with existing email
- `VERIFICATION_TOKEN_EXPIRED`: Email verification token is expired
- `PASSWORD_TOO_WEAK`: Password doesn't meet strength requirements
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `INVALID_FILE_TYPE`: File type not supported
- `RATING_CALCULATION_ERROR`: Error updating player rating
- `SUBSCRIPTION_REQUIRED`: Feature requires premium subscription
- `INTERNAL_SERVER_ERROR`: Unexpected server error

**HTTP Status Code Mapping:**
- 200: Success responses
- 400: `VALIDATION_ERROR`, `INVALID_MOVE`, `PASSWORD_TOO_WEAK`, `FILE_TOO_LARGE`, `INVALID_FILE_TYPE`
- 401: `AUTHENTICATION_REQUIRED`, `VERIFICATION_TOKEN_EXPIRED`
- 402: `SUBSCRIPTION_REQUIRED` 
- 403: `AUTHORIZATION_DENIED`
- 404: `RESOURCE_NOT_FOUND`
- 409: `EMAIL_ALREADY_EXISTS`, `GAME_NOT_ACTIVE`
- 422: `RATING_CALCULATION_ERROR`
- 429: `RATE_LIMIT_EXCEEDED`
- 500: `INTERNAL_SERVER_ERROR`

### Pagination Defaults
- **Default Page Size**: 20 items
- **Maximum Page Size**: 100 items  
- **Default Sort**: Most recent first
- **Page Numbering**: 1-based indexing

### Rate Limiting Specifications
- **Authentication**: 5 attempts per minute per IP
- **Email verification resend**: 1 per 5 minutes per email
- **Password reset**: 3 requests per hour per IP
- **API endpoints**: 1000 requests per hour per authenticated user
- **Chat messages**: 60 messages per minute per game
- **File uploads**: 10 uploads per minute per user

### Input Validation Rules
- **SQL Injection**: All inputs sanitized and parameterized
- **XSS Prevention**: All user content escaped for HTML output  
- **Chess Move Validation**: All moves validated using chess.js before processing
- **Email Format**: RFC 5322 compliant validation
- **URL Validation**: HTTPS required for external URLs
- **File Upload**: Virus scanning and content-type validation

### Data Protection
- **Encryption**: AES-256 encryption at rest, TLS 1.3 in transit
- **User Data Access**: Role-based access controls
- **Game Data Privacy**: Configurable visibility settings
- **Payment Information**: PCI DSS compliant handling via Stripe
- **Data Retention**: Configurable retention periods per data type
- **GDPR Compliance**: Right to export, delete, and portability 