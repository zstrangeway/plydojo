import type { APIGatewayProxyHandler } from 'aws-lambda'
import { requestPasswordReset } from '../../lib/cognito-auth-utils.js'

interface PasswordResetRequest {
  email: string
}

export const handler: APIGatewayProxyHandler = async (event) => {
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
    let requestBody: PasswordResetRequest
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

    const { email } = requestBody

    // Validate input
    if (!email) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          message: 'Email is required',
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

    // Request password reset via Cognito
    const resetResult = await requestPasswordReset(email.toLowerCase())
    
    // Always return success to prevent email enumeration
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: resetResult.success,
        message: resetResult.message,
      }),
    }

  } catch (error) {
    console.error('Password reset error:', error)
    
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