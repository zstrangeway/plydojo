// API Gateway and Lambda Functions

export function createApi(tables: any[], website: any, userPool: any, userPoolClient: any) {
  const api = new sst.aws.ApiGatewayV2("Api", {
    cors: {
      allowCredentials: true,
      allowHeaders: ["content-type", "authorization"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowOrigins: ["http://localhost:3000", website.url],
    },
  });

  // Health check endpoint using actual Lambda function
  api.route("GET /health", "../plydojo-api/src/health.handler");

  // Authentication routes using Cognito
  api.route("POST /login", {
    handler: "../plydojo-api/src/auth/login.handler",
    environment: {
      USER_POOL_ID: userPool.id,
      USER_POOL_CLIENT_ID: userPoolClient.id,
      SST_STAGE: $app.stage,
      WEBSITE_URL: website.url,
    },
    permissions: [
      {
        actions: [
          "cognito-idp:InitiateAuth",
          "cognito-idp:AdminGetUser"
        ],
        resources: [userPool.arn],
      },
    ],
  });

  api.route("POST /password-reset", {
    handler: "../plydojo-api/src/auth/password-reset.handler",
    environment: {
      USER_POOL_ID: userPool.id,
      USER_POOL_CLIENT_ID: userPoolClient.id,
      SST_STAGE: $app.stage,
      WEBSITE_URL: website.url,
    },
    permissions: [
      {
        actions: [
          "cognito-idp:ForgotPassword",
        ],
        resources: [userPool.arn],
      },
    ],
  });
  
  return api;
} 