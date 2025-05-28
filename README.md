# PlyDojo

Interactive chess tutoring platform that combines chess engines with AI tutoring.

## CI/CD Pipeline Status
✅ CI/CD pipeline configured and ready for testing

## Development

This project uses a monorepo structure with pnpm workspaces.

### Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev
```

### Project Structure

- `apps/plydojo-web` - Next.js frontend application
- `apps/plydojo-api` - Lambda functions for backend API
- `apps/plydojo-infra` - SST infrastructure as code
- `packages/plydojo-ui` - Shared UI components
- `packages/plydojo-types` - Shared TypeScript types

### Development Commands

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Architecture

PlyDojo uses a serverless architecture on AWS:

- **Frontend**: Next.js deployed via CloudFront CDN
- **Backend**: Lambda functions with API Gateway
- **Database**: DynamoDB for scalable data storage
- **Authentication**: AWS Cognito
- **AI Integration**: OpenAI API for chess tutoring

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

The CI/CD pipeline will automatically:
- Run tests and linting on PRs
- Deploy to staging on merge to main
- Deploy to production after staging validation
