// AWS Cognito Authentication

export const userPool = new sst.aws.CognitoUserPool("UserPool", {
  usernames: ["email"],
  transform: {
    userPool: {
      passwordPolicy: {
        minimumLength: 8,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        requireUppercase: true,
      },
      autoVerifiedAttributes: ["email"],
      emailConfiguration: {
        emailSendingAccount: "COGNITO_DEFAULT",
      },
    },
  },
});

// TODO: Add user pool client later when SST v3 syntax is confirmed 