// DynamoDB Tables and S3 Storage

// S3 Bucket for static assets
export const assetsBucket = new sst.aws.Bucket("AssetsBucket", {
  public: true,
});

// Users Table
export const usersTable = new sst.aws.Dynamo("UsersTable", {
  fields: {
    pk: "string",
    sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
});

// Games Table with GSI for user queries
export const gamesTable = new sst.aws.Dynamo("GamesTable", {
  fields: {
    pk: "string",
    sk: "string",
    userId: "string",
    gameId: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
  globalIndexes: {
    UserGamesIndex: {
      hashKey: "userId",
      rangeKey: "gameId",
    },
  },
});

// Chat Table
export const chatTable = new sst.aws.Dynamo("ChatTable", {
  fields: {
    pk: "string",
    sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
});

// Settings Table
export const settingsTable = new sst.aws.Dynamo("SettingsTable", {
  fields: {
    pk: "string",
    sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
});

// Notifications Table
export const notificationsTable = new sst.aws.Dynamo("NotificationsTable", {
  fields: {
    pk: "string",
    sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
}); 
