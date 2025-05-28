# PlyDojo CI/CD Pipeline Guide

## Overview

This document describes the CI/CD pipeline for PlyDojo, designed for cost-effective deployment with quality gates and automated rollback capabilities.

## Workflow Architecture

### 1. PR Validation (Lightweight)
- **Trigger**: Pull request opened/updated
- **Purpose**: Fast feedback on code quality
- **Cost**: Minimal (no infrastructure deployment)

**Steps:**
- Code checkout
- Dependency installation with caching
- ESLint linting
- TypeScript type checking
- Unit tests
- Build verification
- Security audit
- CodeQL analysis

### 2. Staging Deployment
- **Trigger**: Merge to `main` branch
- **Purpose**: Integration testing in real environment
- **Cost**: Single environment deployment

**Steps:**
- Deploy to staging environment
- Health check verification
- E2E test execution
- Automatic production trigger on success

### 3. Production Deployment
- **Trigger**: Successful staging deployment
- **Purpose**: Live deployment with safety checks
- **Cost**: Production environment + monitoring

**Steps:**
- **Automatic deployment** (no manual approval required)
- Backup current deployment state
- Deploy to production
- Health checks and smoke tests
- **Automatic rollback on failure**

## Environment Configuration

### Staging Environment
- **Stage**: `staging`
- **Purpose**: Pre-production testing
- **Domain**: Auto-generated API Gateway URL
- **Monitoring**: Basic CloudWatch alarms
- **Data**: Test data only

### Production Environment
- **Stage**: `production`
- **Purpose**: Live application
- **Domain**: Custom domain (api.plydojo.com)
- **Monitoring**: Full CloudWatch dashboard + alerts
- **Data**: Production data with retention policies
- **Deployment**: **Automatic** after staging success

## Required GitHub Secrets

### AWS Credentials
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

### Environment-Specific Secrets

#### Staging
```
OPENAI_API_KEY_STAGING
JWT_SECRET_STAGING
STRIPE_SECRET_KEY_STAGING
STRIPE_PUBLISHABLE_KEY_STAGING
```

#### Production
```
OPENAI_API_KEY_PRODUCTION
JWT_SECRET_PRODUCTION
STRIPE_SECRET_KEY_PRODUCTION
STRIPE_PUBLISHABLE_KEY_PRODUCTION
```

### Optional Notifications
```
SLACK_WEBHOOK_URL  # For deployment notifications
```

## GitHub Environment Setup

### 1. Create Environments
In GitHub repository settings → Environments:

**Staging Environment:**
- Name: `staging`
- Protection rules: None (auto-deploy)
- Secrets: Staging-specific secrets

**Production Environment:**
- Name: `production`
- Protection rules: **None** (auto-deploy after staging)
- Deployment branches: Not restricted (triggered by staging success)
- Secrets: Production-specific secrets

### 2. Environment Protection Rules
- **Staging**: No protection (automatic deployment)
- **Production**: **No protection** (automatic deployment with rollback)

## Local Development

### Setup
```bash
# Run the setup script
./scripts/dev-setup.sh

# Or manually:
pnpm install
pnpm build
pnpm type-check
```

### Development Commands
```bash
# Start local development
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build all packages
pnpm build
```

### Testing Strategy

#### Unit Tests
- **Location**: `*.test.ts` files
- **Purpose**: Test individual functions/components
- **Run**: `pnpm test`

#### E2E Tests
- **Location**: `*.e2e.ts` files
- **Purpose**: Test complete user workflows
- **Run**: `pnpm test:e2e`
- **Environment**: Staging only

#### Smoke Tests
- **Location**: `*.smoke.ts` files
- **Purpose**: Critical path validation
- **Run**: `pnpm test:smoke`
- **Environment**: Production after deployment

## Monitoring and Alerting

### CloudWatch Alarms
- **API Errors**: >10 errors in 10 minutes
- **API Latency**: >5 seconds average
- **Lambda Errors**: >5 errors in 10 minutes
- **DynamoDB Throttling**: Any throttling events
- **Health Check**: 3 consecutive failures

### Notifications
- **Email**: Configured per environment
- **Slack**: Optional webhook integration
- **Dashboard**: CloudWatch dashboard per environment

### Rollback Procedures

#### Automatic Rollback
- Triggered by failed smoke tests in production
- Uses CloudFormation rollback capabilities
- Restores previous working deployment

#### Manual Rollback
```bash
# Emergency rollback
cd apps/plydojo-infra
pnpm sst deploy --stage production --rollback

# Or use AWS CLI
aws cloudformation cancel-update-stack --stack-name plydojo-production
aws cloudformation continue-update-rollback --stack-name plydojo-production
```

## Deployment Commands

### Manual Deployments
```bash
# Deploy to staging
pnpm deploy:staging

# Deploy to production (requires approval in GitHub)
pnpm deploy:production

# Current personal dev environment
pnpm deploy
```

### Environment Management
```bash
# Check current deployments
cd apps/plydojo-infra
pnpm sst env list

# Get environment variables
pnpm sst env get --stage staging

# Remove environment
pnpm sst remove --stage staging
```

## Cost Optimization

### What We Avoid
- ❌ Feature branch deployments
- ❌ Multiple development environments
- ❌ Expensive testing on every commit

### What We Include
- ✅ Lightweight PR validation
- ✅ Single staging environment
- ✅ Automated promotion to production
- ✅ Quick rollback capabilities

### Estimated Costs
- **PR Validation**: ~$0 (GitHub Actions free tier)
- **Staging Environment**: ~$10-20/month
- **Production Environment**: ~$20-50/month
- **Total**: ~$30-70/month (vs $100-200+ with feature branches)

## Troubleshooting

### Common Issues

#### Deployment Failures
1. Check AWS credentials and permissions
2. Verify environment secrets are set
3. Check CloudFormation stack status
4. Review CloudWatch logs

#### Test Failures
1. Verify staging environment is healthy
2. Check API endpoints are responding
3. Review test configuration and data

#### Rollback Issues
1. Check CloudFormation stack status
2. Verify previous deployment exists
3. Manual intervention may be required

### Debug Commands
```bash
# Check deployment status
aws cloudformation describe-stacks --stack-name plydojo-staging

# View logs
aws logs tail /aws/lambda/plydojo-staging-health --follow

# Test API health
curl -f https://your-api-url/health
```

## Security Considerations

### Secrets Management
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Use different secrets per environment
- Never commit secrets to code

### Access Control
- Limit AWS IAM permissions
- Use environment protection rules
- Require approval for production deployments
- Monitor access logs

### Monitoring
- Enable CloudTrail for audit logs
- Monitor failed authentication attempts
- Set up alerts for suspicious activity
- Regular security audits

## Future Enhancements

### Planned Improvements
- [ ] Blue/green deployments
- [ ] Canary releases
- [ ] Performance testing integration
- [ ] Automated security scanning
- [ ] Multi-region deployments

### Monitoring Enhancements
- [ ] Application performance monitoring (APM)
- [ ] User experience monitoring
- [ ] Business metrics tracking
- [ ] Cost optimization alerts 