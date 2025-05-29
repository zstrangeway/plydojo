import type { APIGatewayProxyHandler } from 'aws-lambda'
import { authenticateUser, createCookieHeader } from '../../lib/cognito-auth-utils.js'

interface LoginRequest {
  email: string
  password: string
}

export const handler: APIGatewayProxyHandler = async (event) => {
  // Debug logging
  console.log('Environment variables:', {
    USER_POOL_ID: process.env.USER_POOL_ID,
    USER_POOL_CLIENT_ID: process.env.USER_POOL_CLIENT_ID,
    SST_STAGE: process.env.SST_STAGE,
    WEBSITE_URL: process.env.WEBSITE_URL
  });

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.SST_STAGE === 'production' 
      ? 'https://plydojo.com' 
      : process.env.WEBSITE_URL || 'http://localhost:3000',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle preflight requests
  const method = event.httpMethod || (event.requestContext as any)?.http?.method
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    }
  }

  // Only allow POST method
  if (method !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed',
      }),
    }
  }

  try {
    // Parse request body
    let requestBody: LoginRequest
    try {
      requestBody = JSON.parse(event.body || '{}')
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          message: 'Invalid JSON in request body',
        }),
      }
    }

    const { email, password } = requestBody

    // Validate input
    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          message: 'Email and password are required',
        }),
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          message: 'Invalid email format',
        }),
      }
    }

    // Authenticate with Cognito
    const authResult = await authenticateUser(email.toLowerCase(), password)
    
    console.log('Auth result:', {
      success: authResult.success,
      message: authResult.message,
      hasUser: !!authResult.user,
      hasTokens: !!authResult.tokens
    });
    
    if (authResult.success && authResult.user && authResult.tokens) {
      // Return success response with httpOnly cookie
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': createCookieHeader(authResult.tokens.accessToken),
        },
        body: JSON.stringify({
          success: true,
          user: {
            id: authResult.user.id,
            email: authResult.user.email,
            name: authResult.user.name,
            status: authResult.user.status,
          },
        }),
      }
    } else {
      // Return error response
      return {
        statusCode: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          message: authResult.message || 'Invalid credentials',
        }),
      }
    }

  } catch (error) {
    console.error('Login error:', error)
    
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
      }),
    }
  }
} 