// AWS Cognito Authentication

export function createAuth() {
  // Cognito User Pool for authentication
  const userPool = new sst.aws.CognitoUserPool("UserPool", {
    usernames: ["email"], // Allow login with email
    verify: {
      emailSubject: "Welcome to PlyDojo - Verify your account",
      emailMessage: "Your verification code is {####}",
    },
  });

  // Add a client for the web app
  const userPoolClient = userPool.addClient("WebClient");

  // Create Cognito Identity Pool for AWS resource access
  const identityPool = new sst.aws.CognitoIdentityPool("IdentityPool", {
    userPools: [
      {
        userPool: userPool.id,
        client: userPoolClient.id,
      },
    ],
    permissions: {
      authenticated: [
        {
          actions: ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem", "dynamodb:Query"],
          resources: ["*"], // Will be refined to specific table ARNs
        },
        {
          actions: ["s3:GetObject", "s3:PutObject"],
          resources: ["*"], // Will be refined to specific bucket paths
        },
      ],
    },
  });

  return {
    userPool,
    userPoolClient,
    identityPool,
  };
} 