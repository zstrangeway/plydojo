// API Gateway and Lambda Functions

export function createApi(tables: any[]) {
  const api = new sst.aws.ApiGatewayV2("Api", {
    cors: {
      allowCredentials: true,
      allowHeaders: ["content-type", "authorization"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowOrigins: ["http://localhost:3000"],
    },
  });

  // Health check endpoint using actual Lambda function
  api.route("GET /health", "../plydojo-api/src/health.handler");

  // TODO: Add more Lambda function routes later
  
  return api;
} 