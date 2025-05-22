# Technical Context

## Last Updated
2025-05-27

## Tech Stack

### Frontend
- **Framework**: React with Next.js
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **Chess Libraries**: 
  - react-chessboard for UI
  - chess.js for game logic

### Backend
- **Framework**: SST (Serverless Stack) on AWS
- **Runtime**: Node.js
- **API**: REST API via API Gateway
- **Authentication**: AWS Cognito with JWT tokens stored as httpOnly cookies
- **Email Service**: AWS SES

### Infrastructure
- **Cloud Provider**: AWS
- **Database**: DynamoDB with GSI for user queries
- **Storage**: S3
- **Compute**: Lambda Functions
- **CDN**: CloudFront

### Development
- **Package Manager**: pnpm
- **Monorepo Structure**: Workspace with apps and packages
  - All packages use @plydojo namespace with descriptive names
  - Web app: @plydojo/plydojo-web in apps/plydojo-web
  - API backend: apps/plydojo-api
  - Infrastructure: apps/plydojo-infra
  - UI components: @plydojo/plydojo-ui in packages/plydojo-ui
  - Config packages: @plydojo/eslint-config, @plydojo/typescript-config
- **Testing**: Jest and React Testing Library
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier

### AI and Chess Components
- **Chess Engine**: Stockfish.js for opponent AI and analysis
- **AI Services**: OpenAI API for tutoring (configurable via TutorModelFactory)
- **Model Architecture**: Factory patterns for OpponentModelFactory and TutorModelFactory
- **Analytics**: CloudWatch for performance monitoring

## Development Environment Setup

### Prerequisites
- Node.js (v18+)
- pnpm (v8+)
- AWS CLI configured with appropriate credentials
- OpenAI API key for tutoring functionality

### Local Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Deploy infrastructure
pnpm deploy
```

### Environment Variables
- `OPENAI_API_KEY`: For AI tutoring integration
- `AWS_PROFILE`: AWS profile to use for deployments
- `STRIPE_API_KEY`: For subscription management
- `JWT_SECRET`: For authentication token signing

### SST Environment Configuration
Environment variables are managed through SST's `Config` construct in `apps/plydojo-infra`:

```typescript
// In sst.config.ts
const OPENAI_API_KEY = new Config.Secret(stack, "OPENAI_API_KEY");
const JWT_SECRET = new Config.Secret(stack, "JWT_SECRET");
const STRIPE_API_KEY = new Config.Secret(stack, "STRIPE_API_KEY");

// In Lambda function definitions
const api = new Api(stack, "Api", {
  defaults: {
    function: {
      bind: [OPENAI_API_KEY, JWT_SECRET, STRIPE_API_KEY],
      environment: {
        STAGE: stack.stage,
        REGION: stack.region,
      }
    }
  }
});
```

**Environment-Specific Configuration:**
- **Development**: Uses `.env.local` file for local development
- **Staging**: Uses AWS Parameter Store for sensitive values
- **Production**: Uses AWS Secrets Manager for all secrets

**Secret Management:**
- Secrets never stored in code or config files
- Rotation support for JWT_SECRET and API keys
- Access logging for secret retrieval in production

## Technical Constraints

### Performance
- Chess engine calculations must complete within 5 seconds for standard moves
- Frontend must remain responsive during analysis
- AI responses should be generated within 10 seconds
- Analysis depth configurable (default 20 moves)

### Scalability
- System should handle up to 1000 concurrent users initially
- Database design accommodates growing user data with DynamoDB GSI
- Costs scale linearly with Lambda usage and API calls

### Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Mobile web support for tablets and phones
- No IE11 support required

### Accessibility
- WCAG 2.1 AA compliance target
- Keyboard navigation for all chess interactions
- Screen reader compatibility for game state

## Third-party Dependencies

### Critical Dependencies
- **chess.js**: Core chess logic and validation
- **react-chessboard**: Interactive chess UI
- **OpenAI API**: AI tutoring capabilities
- **Stockfish.js**: Chess engine for analysis

### License Considerations
- All dependencies must be MIT or compatible licenses
- Avoid GPL-licensed libraries without proper review

## Security Requirements
- All user data encrypted at rest in DynamoDB and in transit
- API endpoints implement JWT authentication and authorization
- Rate limiting on authentication and email endpoints
- Content filtering for chess-focused chat interactions
- Regular security audits for dependencies

## Deployment Workflow
- Development: Local environment with SST dev stack
- Staging: AWS staging environment 
- Production: AWS production environment
- Blue/Green deployment strategy via SST

## Monitoring and Observability
- CloudWatch for logs and metrics
- Error tracking via CloudWatch alarms
- Performance monitoring for chess engine operations
- User activity analytics for game statistics

### Performance Monitoring & Alerting
**CloudWatch Alarms:**
- Chess engine response time > 5 seconds (99th percentile)
- AI tutor response time > 10 seconds (95th percentile)
- API Gateway 4xx error rate > 5%
- API Gateway 5xx error rate > 1%
- Lambda function duration > 30 seconds
- DynamoDB throttling events > 0

**Custom Metrics:**
- Chess move validation time
- Stockfish calculation depth and time
- OpenAI API response latency
- Game completion rate
- User session duration

**Dashboard Metrics:**
- Active concurrent users
- Games in progress
- AI tutor chat volume
- Authentication success rate
- Game analysis requests per hour

## Documentation Standards
- JSDoc for API documentation
- README files for each package
- Memory bank documentation for project context
- API contracts documentation for endpoint specifications

## Data Architecture

### DynamoDB Schema
- **Users Table**: User profiles, authentication, subscription data
- **Games Table**: Game state, history, outcomes with GSI for user queries
- **Chat Table**: Tutoring conversations linked to games
- **Settings Table**: User preferences and configurations
- **Notifications Table**: User notifications and read status

### API Design
- RESTful endpoints following OpenAPI 3.0 standards
- Consistent error response format across all endpoints
- JWT authentication with httpOnly cookie storage
- Rate limiting per endpoint requirements (5 login attempts/minute, etc.)

## AI Integration

### Model Selection
- **Opponent Models**: Stockfish (default), LLM (future), Custom (future)
- **Tutor Models**: OpenAI (default), other LLMs (future)
- Factory pattern enables easy model switching during gameplay

### Content Strategy
- Chess-focused tutoring to maintain educational value
- Context-aware responses based on game position and history
- Proactive commentary on significant moves or mistakes 