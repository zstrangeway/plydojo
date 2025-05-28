# System Patterns

## Last Updated
2025-05-28

## Architecture Overview
PlyDojo follows a serverless architecture using SST (Serverless Stack) with a modern React frontend.

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│  Frontend   │◄────►│   Backend   │◄────►│  External   │
│  (React)    │      │  (AWS/SST)  │      │  Services   │
│             │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
```

## AI Interaction Model

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│    User     │◄────►│  Opponent   │◄────►│    Tutor    │
│  (Player)   │      │  Model AI   │      │  Model AI   │
│             │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Interaction Flow
1. User makes a chess move on the board
2. Opponent Model AI analyzes the board and responds with a move
3. Tutor Model AI observes the exchange and provides coaching through chat
4. User can ask questions in chat to receive chess-focused guidance
5. System filters conversation to maintain chess focus

### AI Component Responsibilities
- **Opponent Model**: Responsible for game play decisions, move selection, and difficulty adaptation
  - **Implementation Options**:
    - Stockfish Engine (default): Traditional chess engine with configurable strength
    - LLM-based Engine (future): Using large language models for more human-like play
    - Custom Models (future): Specialized or user-trained models
- **Tutor Model**: Responsible for move analysis, instructional content, and responding to user questions
  - **Implementation Options**:
    - OpenAI (default): Using GPT models for chess tutoring
    - Other LLM providers (future): Alternative language model options
- **Content Filter**: Ensures all conversations remain focused on chess-related topics
  - **Implementation Approach**:
    - Keyword-based filtering for obvious off-topic content
    - AI-based classification to determine chess relevance (confidence threshold: 0.7)
    - Whitelist of chess-related terms and concepts
    - Automatic response for filtered content: "Let's keep our discussion focused on chess. How can I help you improve your game?"
    - Logging of filtered attempts for system improvement

## Key Design Patterns

### Frontend Patterns
- **Component-based architecture**: UI elements are broken down into reusable components using shadcn/ui
- **State management**: React Context API for global state across components
- **Container/Presenter pattern**: Separating logic from presentation components
- **Custom hooks**: For reusable logic across components (game state, authentication, settings)
- **Split-screen layout**: Chessboard (60%) on left, chat interface (40%) on right per screensList.md

### UI Component Organization
**Domain-First Atomic Design**: Components in `packages/plydojo-ui` are organized by business domain first, then atomic design principles

**Structure Pattern:**
```
packages/plydojo-ui/src/
├── auth/
│   ├── atoms/          # Basic auth building blocks (LoginButton, FormInput)
│   ├── molecules/      # Auth component combinations (LoginForm, SignupForm)
│   └── organisms/      # Complete auth sections (AuthModal, UserProfile)
├── game/
│   ├── atoms/          # Basic game pieces (ChessSquare, PieceIcon, MoveButton)
│   ├── molecules/      # Game combinations (BoardRow, MoveHistory, GameStatus)
│   └── organisms/      # Complete game sections (ChessBoard, GamePanel)
├── chat/
│   ├── atoms/          # Basic chat elements (MessageBubble, SendButton)
│   ├── molecules/      # Chat combinations (ChatInput, MessageGroup)
│   └── organisms/      # Complete chat sections (ChatInterface, TutorPanel)
├── common/
│   ├── atoms/          # Universal building blocks (Button, Input, Icon, Badge)
│   ├── molecules/      # Common combinations (SearchBox, Dropdown, Modal)
│   └── organisms/      # Common sections (Header, Navigation, Footer)
└── templates/          # Page-level component layouts
```

**Rationale for Domain-First Organization:**
- Developers work within specific business domains (auth, game, chat)
- Easier to find all related components for feature development
- Scales better as domains grow and evolve
- Aligns with domain-driven design principles
- More intuitive for collaborative development

**Atomic Design Guidelines:**
- **Atoms**: Basic building blocks, no dependencies on other components
- **Molecules**: Simple combinations of atoms, serve single purposes
- **Organisms**: Complex combinations, represent distinct sections of interface
- **Templates**: Page-level layouts, define content structure without specific content

### Backend Patterns
- **Serverless functions**: Lambda functions organized by service domain (auth, games, users, settings, notifications)
- **Event-driven architecture**: Using DynamoDB streams for workflow triggers
- **Data access layer**: DynamoDB with GSI for efficient user queries
- **Authentication middleware**: JWT tokens with httpOnly cookies for securing API routes
- **Factory pattern**: OpponentModelFactory and TutorModelFactory for AI model selection

### Cross-cutting Concerns
- **Error handling**: Standardized error response format across all Lambda functions
- **Logging**: CloudWatch structured logging with game context for traceability
- **Configuration management**: Environment-based configuration via SST
- **Rate limiting**: Implemented per endpoint (5 login attempts/minute, 1 email verification/5 minutes)

## Major Technical Decisions

### State Management - 2025-05-23
**Context**: Need to manage game state, user authentication, and settings across React components
**Decision**: Use React Context API instead of Redux or other state management libraries
**Rationale**: Simpler setup for initial scope, adequate for current complexity, aligns with modern React practices
**Consequences**: Easier initial development, potential refactor needed if state complexity grows significantly

### Database Choice - 2025-05-23
**Context**: Need scalable database for users, games, chat, settings, and notifications
**Decision**: DynamoDB with GSI for user-based queries
**Rationale**: Serverless-first approach, automatic scaling, cost-effective for usage patterns
**Consequences**: NoSQL query limitations, need careful schema design, excellent performance and cost scaling

### Authentication Architecture - 2025-05-23
**Context**: Need secure authentication that works well with serverless and frontend
**Decision**: AWS Cognito with JWT tokens stored as httpOnly cookies
**Rationale**: Serverless-native, secure cookie storage, integrates well with API Gateway
**Consequences**: Platform lock-in to AWS, excellent security and integration benefits

### AI Model Architecture - 2025-05-23
**Context**: Need flexible system for different opponent and tutor AI models
**Decision**: Factory pattern with OpponentModelFactory and TutorModelFactory
**Rationale**: Enables easy model switching, clean separation of concerns, future extensibility
**Consequences**: Slightly more complex initial setup, excellent flexibility for future model additions

## Domain Model

### Core Entities
- **User**: Registered user with profile, authentication, and subscription data
- **Game**: Chess game with FEN position, PGN history, and AI model configurations
- **Chat**: Tutoring conversation messages linked to specific games
- **Settings**: User preferences for app, board, audio, notifications, and privacy
- **Notifications**: User notifications with read status and action URLs

### Key Relationships
- A User can have multiple Games (GSI: USER#{userId} -> GAME#{gameId})
- A Game has one Chat thread (PK: GAME#{gameId}, SK: CHAT#{timestamp})
- A Game has OpponentModel and TutorModel configurations stored in game metadata
- A User has one Settings record (PK: USER#{userId}, SK: SETTINGS)
- A User has multiple Notifications (PK: USER#{userId}, SK: NOTIFICATION#{timestamp}#{notificationId})

## API Design
- RESTful API design for core CRUD operations per apiContracts.md
- Real-time features via polling (no WebSocket for MVP):
  - AI tutor proactive commentary: 5-second polling during active games
  - Game state updates: Client polls after each move for opponent response
  - Notifications: 30-second polling when user is active
- JWT authentication with httpOnly cookie storage
- Consistent error response format across all endpoints
- AI model API integration for opponent (Stockfish) and tutor (OpenAI) models

## Performance Considerations
- Client-side caching strategies for game state and user settings
- Code splitting and lazy loading for Next.js application
- Stockfish engine optimizations with configurable depth (default 20)
- AI response time targets: chess moves <5 seconds, chat responses <10 seconds
- DynamoDB access patterns optimized for user-based queries with GSI

## Security Model
- JWT-based authentication with httpOnly cookies
- User-based authorization checking for all resources
- Input validation and sanitization for all user inputs
- Rate limiting per endpoint specifications in apiContracts.md
- Content filtering for chat to maintain chess-focused discussions
- Chess move validation using chess.js to prevent invalid game states

## Testing Strategy
- Unit tests for core business logic (game rules, AI integration, authentication)
- Integration tests for API endpoints with DynamoDB
- E2E tests for critical user flows per screensList.md
- Performance testing for Stockfish engine and OpenAI integration
- Chess-specific testing for move validation and game state management

### Chess Rule Test Scenarios
**Basic Move Validation:**
- Standard piece movement (pawn, rook, knight, bishop, queen, king)
- Capture moves and blocked paths
- Invalid moves (off-board, through pieces, wrong piece movement)

**Special Moves:**
- En passant capture (valid and invalid scenarios)
- Castling (kingside and queenside, with blocking/checking conditions)
- Pawn promotion (all piece options)
- King in check (forced moves, escape options)

**Game State Validation:**
- Checkmate detection (multiple scenarios)
- Stalemate detection
- Draw conditions (50-move rule, threefold repetition, insufficient material)
- FEN string parsing and generation accuracy
- PGN generation and move history accuracy

**Edge Cases:**
- Discovered check scenarios
- Pin validation (absolute and relative pins)
- Double check situations
- Under-promotion scenarios
- Complex castling restrictions (king/rook moved previously, through check)

## Data Architecture

### DynamoDB Tables
- **Users**: PK: USER#{userId}, SK: METADATA (user profile and auth data)
- **Games**: PK: GAME#{gameId}, SK: METADATA (game state and configuration)
- **Games GSI**: PK: USER#{userId}, SK: GAME#{gameId} (user's games)
- **Chat**: PK: GAME#{gameId}, SK: CHAT#{timestamp}#{messageId} (conversation history)
- **Settings**: PK: USER#{userId}, SK: SETTINGS (user preferences)
- **Notifications**: PK: USER#{userId}, SK: NOTIFICATION#{timestamp}#{notificationId} (user notifications)

### Email Service
- AWS SES for all email functionality (verification, password reset, notifications)
- Template-based emails with proper security and deliverability

## Development Workflow Patterns

### Commit Message Conventions
Following [Conventional Commits](https://www.conventionalcommits.org/) standard for consistent, semantic commit messages with task ID references.

**Format:**
```
<type>(task-id): <description>
<type>(scope/task-id): <description>

[optional body]

[optional footer(s)]
```

**Task ID Format:**
- Use development plan task IDs in scope: `(1.1)`, `(2.1)`, `(2.1.1)`, etc.
- Combine with domain scope: `(auth/2.1)`, `(chess/3.2)`, `(ui/1.1)`
- Use `(setup)` for initial project setup work
- Use `(fix)` for bug fixes not tied to specific tasks
- Use `(docs)` for documentation-only changes

**Types:**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code changes that neither fix bugs nor add features
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `build:` - Changes to build system or dependencies
- `ci:` - Changes to CI configuration files and scripts
- `chore:` - Other changes that don't modify src or test files

**Scope Options:**
- Task ID only: `(2.1)`, `(1.3)`, `(3.2.1)`
- Domain + Task ID: `(auth/2.1)`, `(chess/3.2)`, `(infra/1.2)`
- Domain only: `(auth)`, `(chess)`, `(ui)` (when task ID unclear)
- Special scopes: `(setup)`, `(fix)`, `(docs)`

**Examples:**
```
feat(2.1): add login functionality
feat(ui/3.1): create dashboard layout
feat(1.2): implement SST deployment
fix(chess/3.2): resolve move validation bug
feat(2.1.1): setup E2E test infrastructure
docs(api): update endpoint documentation
style(fix): format component files
refactor(chat/3.4): simplify message handling
perf(chess/3.2): optimize Stockfish integration
test(2.1.1): add login flow E2E tests
build(1.1): update Next.js to v15
ci(1.3): add staging deployment workflow
chore(setup): update dependencies
```

**Breaking Changes:**
Use `!` after type/scope to indicate breaking changes:
```
feat!: remove deprecated API endpoints
feat(auth)!: change authentication flow
```

**Squashing Strategy:**
- Squash fix commits into their related feature commits
- Keep feature commits separate for clear development history
- Maintain clean main branch with logical commit boundaries
- Each commit should represent a complete, working feature or fix

**Commit Body Guidelines:**
- Use imperative mood ("add feature" not "added feature")
- Explain what and why, not how
- Reference issues/PRs when relevant
- Keep first line under 72 characters
- Separate body with blank line if used 