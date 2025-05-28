// API Gateway and Lambda Functions
import { usersTable, gamesTable, chatTable, settingsTable, notificationsTable } from "./storage.js";

export const api = new sst.aws.ApiGatewayV2("Api", {
  cors: {
    allowCredentials: true,
    allowHeaders: ["content-type", "authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowOrigins: ["http://localhost:3000"],
  },
});

// Simple health check endpoint to start
api.route("GET /health", {
  handler: () => {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        tables: {
          users: usersTable.name,
          games: gamesTable.name,
          chat: chatTable.name,
          settings: settingsTable.name,
          notifications: notificationsTable.name,
        },
      }),
    };
  },
});

// TODO: Add Lambda function routes later when functions are properly configured 