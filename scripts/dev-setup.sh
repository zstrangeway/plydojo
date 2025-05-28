#!/bin/bash

# PlyDojo Local Development Setup
# This script sets up local development environment for testing

set -e

echo "🚀 Setting up PlyDojo local development environment..."

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
}

echo "📋 Checking required tools..."
check_tool "node"
check_tool "pnpm"
check_tool "aws"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup local DynamoDB (optional)
setup_local_dynamo() {
    echo "🗄️  Setting up local DynamoDB..."
    
    # Check if DynamoDB Local is available
    if command -v dynamodb-local &> /dev/null; then
        echo "✅ DynamoDB Local found"
        
        # Start DynamoDB Local in background
        dynamodb-local -port 8000 -inMemory &
        DYNAMO_PID=$!
        echo "🔄 DynamoDB Local started on port 8000 (PID: $DYNAMO_PID)"
        
        # Save PID for cleanup
        echo $DYNAMO_PID > .dynamo.pid
    else
        echo "⚠️  DynamoDB Local not found. Install with:"
        echo "   npm install -g dynamodb-local"
        echo "   Or use AWS DynamoDB directly"
    fi
}

# Setup environment variables for local development
echo "🔧 Setting up environment variables..."
cat > .env.local << EOF
# Local Development Environment
NODE_ENV=development
AWS_REGION=us-east-1

# DynamoDB Local (if using)
DYNAMODB_ENDPOINT=http://localhost:8000

# API Configuration
API_PORT=3001
CORS_ORIGIN=http://localhost:3000

# Development secrets (use dummy values for local testing)
OPENAI_API_KEY=sk-dummy-key-for-local-development
JWT_SECRET=local-development-jwt-secret-key
STRIPE_API_KEY=sk_test_dummy_stripe_key

# SST Configuration
SST_STAGE=local
EOF

echo "✅ Environment variables configured in .env.local"

# Setup local testing
echo "🧪 Setting up testing environment..."

# Create test configuration
cat > jest.config.js << EOF
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps', '<rootDir>/packages'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(ts|tsx)',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
EOF

# Create Jest setup file
cat > jest.setup.js << EOF
// Jest setup for PlyDojo
process.env.NODE_ENV = 'test';
process.env.AWS_REGION = 'us-east-1';
process.env.DYNAMODB_ENDPOINT = 'http://localhost:8000';
EOF

echo "✅ Testing environment configured"

# Build packages
echo "🔨 Building packages..."
pnpm build

# Run type checking
echo "🔍 Running type checks..."
pnpm type-check

echo ""
echo "🎉 Local development environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Start the development server: pnpm dev"
echo "   2. Run tests: pnpm test"
echo "   3. Start frontend: cd apps/plydojo-web && pnpm dev"
echo ""
echo "🔧 Optional:"
echo "   - Setup DynamoDB Local: run 'setup_local_dynamo' function"
echo "   - Configure AWS credentials for cloud resources"
echo ""
echo "📚 Documentation:"
echo "   - Local development: README.md"
echo "   - API documentation: apps/plydojo-api/README.md"
echo "" 