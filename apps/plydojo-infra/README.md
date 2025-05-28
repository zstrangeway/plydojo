# PlyDojo Infrastructure

This package contains the SST (Serverless Stack) infrastructure configuration for PlyDojo.

## Architecture

- **Framework**: SST v3 with AWS CDK
- **Compute**: AWS Lambda functions
- **API**: API Gateway v2
- **Database**: DynamoDB with single-table design
- **Storage**: S3 for static assets
- **CDN**: CloudFront
- **Auth**: AWS Cognito
- **Email**: AWS SES
- **Monitoring**: CloudWatch

## Environment Setup

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Fill in your environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key for AI tutoring
   - `JWT_SECRET`: A secure random string (32+ characters)
   - `STRIPE_API_KEY`: Your Stripe API key (for future subscription features)

## Development

```bash
# Install dependencies
pnpm install

# Start development environment
pnpm dev

# Deploy to staging
pnpm deploy --stage staging

# Deploy to production
pnpm deploy --stage production
```

## Infrastructure Components

### Storage (`infra/storage.ts`)
- DynamoDB tables for users, games, chat, settings, and notifications
- S3 bucket for static assets
- Secrets management for API keys

### API (`infra/api.ts`)
- API Gateway v2 with CORS configuration
- Lambda function routes for all endpoints
- Environment variables and permissions

### Authentication (`infra/auth.ts`)
- Cognito User Pool with email verification
- Password policies and security settings

### Web Services (`infra/web.ts`)
- CloudFront CDN for asset delivery
- SES for email sending
- CloudWatch logging and monitoring

## Database Schema

The application uses a single-table DynamoDB design with the following access patterns:

### Users Table
- `PK: USER#{userId}`, `SK: METADATA` - User profile data

### Games Table
- `PK: GAME#{gameId}`, `SK: METADATA` - Game data
- `PK: USER#{userId}`, `SK: GAME#{gameId}` - User's games (GSI)

### Chat Table
- `PK: GAME#{gameId}`, `SK: CHAT#{timestamp}#{messageId}` - Chat messages

### Settings Table
- `PK: USER#{userId}`, `SK: SETTINGS` - User preferences

### Notifications Table
- `PK: USER#{userId}`, `SK: NOTIFICATION#{timestamp}#{notificationId}` - User notifications

## Deployment Stages

- **dev**: Development environment for local testing
- **staging**: Pre-production environment for testing
- **production**: Live production environment

Each stage has isolated resources and can be deployed independently. 