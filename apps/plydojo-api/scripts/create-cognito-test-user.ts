import { 
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand 
} from '@aws-sdk/client-cognito-identity-provider'

const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-east-1' })

// Environment variables for Cognito configuration  
const USER_POOL_ID = process.env.USER_POOL_ID

if (!USER_POOL_ID) {
  throw new Error('Missing required environment variable: USER_POOL_ID')
}

async function createTestUser() {
  const email = 'test@plydojo.com'
  const password = 'TestPassword123!'
  const name = 'Test User'

  try {
    console.log('Creating test user in Cognito...')
    
    // Create user in Cognito
    const createCommand = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
        { Name: 'email_verified', Value: 'true' } // Skip email verification for test user
      ],
      MessageAction: 'SUPPRESS', // Don't send welcome email
      TemporaryPassword: 'TempPassword123!'
    })

    const createResponse = await cognitoClient.send(createCommand)
    console.log('User created:', createResponse.User?.Username)
    
    if (createResponse.User?.Username) {
      // Set permanent password
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        Password: password,
        Permanent: true
      })

      await cognitoClient.send(setPasswordCommand)
      console.log('Password set successfully')
      console.log(`Test user created: ${email} / ${password}`)
    }

  } catch (error: any) {
    if (error.name === 'UsernameExistsException') {
      console.log('Test user already exists')
    } else {
      console.error('Error creating test user:', error)
    }
  }
}

createTestUser() 