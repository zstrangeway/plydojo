import { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand, 
  ForgotPasswordCommand,
  AuthFlowType,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand
} from '@aws-sdk/client-cognito-identity-provider'

const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-east-1' })

// These will be passed as environment variables from SST
const USER_POOL_ID = process.env.USER_POOL_ID
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID

console.log('Cognito config:', { USER_POOL_ID, USER_POOL_CLIENT_ID })

if (!USER_POOL_ID || !USER_POOL_CLIENT_ID) {
  throw new Error('Missing required Cognito environment variables: USER_POOL_ID, USER_POOL_CLIENT_ID')
}

export interface CognitoUser {
  id: string
  email: string
  name: string
  status: string
  emailVerified: boolean
  createdAt: string
}

export async function authenticateUser(email: string, password: string): Promise<{ 
  success: boolean 
  user?: CognitoUser 
  message?: string 
  tokens?: {
    accessToken: string
    idToken: string
    refreshToken: string
  }
}> {
  try {
    console.log('Cognito auth attempt:', {
      email,
      USER_POOL_ID,
      USER_POOL_CLIENT_ID
    });

    const command = new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      ClientId: USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    })

    console.log('Sending InitiateAuth command...');
    const response = await cognitoClient.send(command)
    console.log('InitiateAuth response:', {
      hasAuthResult: !!response.AuthenticationResult,
      hasAccessToken: !!response.AuthenticationResult?.AccessToken,
      hasIdToken: !!response.AuthenticationResult?.IdToken
    });

    if (response.AuthenticationResult?.AccessToken) {
      // Extract user info from ID token
      const idToken = response.AuthenticationResult.IdToken
      if (!idToken) {
        return { success: false, message: 'Authentication failed - no ID token' }
      }

      // Parse JWT token to get user info
      const tokenParts = idToken.split('.')
      if (tokenParts.length !== 3 || !tokenParts[1]) {
        return { success: false, message: 'Invalid ID token format' }
      }
      
      const tokenPayload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
      
      const user: CognitoUser = {
        id: tokenPayload.sub,
        email: tokenPayload.email,
        name: tokenPayload.name || tokenPayload.email.split('@')[0],
        status: 'active', // Cognito users who can authenticate are active
        emailVerified: tokenPayload.email_verified || false,
        createdAt: new Date(tokenPayload.iat * 1000).toISOString()
      }

      return {
        success: true,
        user,
        tokens: {
          accessToken: response.AuthenticationResult.AccessToken,
          idToken: response.AuthenticationResult.IdToken || '',
          refreshToken: response.AuthenticationResult.RefreshToken || ''
        }
      }
    }

    return { success: false, message: 'Authentication failed' }
  } catch (error: any) {
    console.error('Cognito authentication error:', error)
    
    // Map Cognito errors to user-friendly messages
    let message = 'Authentication failed'
    
    switch (error.name) {
      case 'NotAuthorizedException':
        message = 'Invalid credentials'
        break
      case 'TooManyRequestsException':
        message = 'Too many login attempts. Please try again later.'
        break
      case 'UserNotConfirmedException':
        message = 'Please verify your email address before logging in'
        break
      case 'UserNotFoundException':
        message = 'Invalid credentials'
        break
      default:
        message = 'Authentication failed'
    }
    
    return { success: false, message }
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const command = new ForgotPasswordCommand({
      ClientId: USER_POOL_CLIENT_ID,
      Username: email,
    })

    await cognitoClient.send(command)
    
    // Always return success to prevent email enumeration
    return { 
      success: true, 
      message: 'If an account with that email exists, password reset instructions have been sent.' 
    }
  } catch (error: any) {
    console.error('Password reset error:', error)
    
    // Don't reveal whether user exists for security
    return { 
      success: true, 
      message: 'If an account with that email exists, password reset instructions have been sent.' 
    }
  }
}

export async function createCognitoUser(email: string, password: string, name: string): Promise<{ 
  success: boolean 
  user?: CognitoUser 
  message?: string 
}> {
  try {
    // Create user in Cognito
    const createCommand = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
        { Name: 'email_verified', Value: 'false' }
      ],
      MessageAction: 'SUPPRESS', // Don't send welcome email, we'll handle verification
      TemporaryPassword: generateTemporaryPassword()
    })

    const createResponse = await cognitoClient.send(createCommand)
    
    if (createResponse.User?.Username) {
      // Set permanent password
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        Password: password,
        Permanent: true
      })

      await cognitoClient.send(setPasswordCommand)

      const user: CognitoUser = {
        id: createResponse.User.Username,
        email,
        name,
        status: 'pending', // Needs email verification
        emailVerified: false,
        createdAt: new Date().toISOString()
      }

      return { success: true, user }
    }

    return { success: false, message: 'Failed to create user' }
  } catch (error: any) {
    console.error('Create user error:', error)
    
    let message = 'Failed to create account'
    
    switch (error.name) {
      case 'UsernameExistsException':
        message = 'An account with this email already exists'
        break
      case 'InvalidPasswordException':
        message = 'Password does not meet requirements'
        break
      default:
        message = 'Failed to create account'
    }
    
    return { success: false, message }
  }
}

function generateTemporaryPassword(): string {
  // Generate a secure temporary password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function createCookieHeader(accessToken: string): string {
  const isProduction = process.env.SST_STAGE === 'production'
  
  return [
    `auth-token=${accessToken}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${60 * 60}`, // 1 hour (Cognito access tokens expire in 1 hour by default)
    'SameSite=Strict',
    ...(isProduction ? ['Secure'] : [])
  ].join('; ')
} 