/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "plydojo",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    // Import infrastructure modules
    await import("./infra/storage.js");
    const { createApi } = await import("./infra/api.js");
    const { createAuth } = await import("./infra/auth.js");
    const { createWebServices } = await import("./infra/web.js");
    const { createMonitoring } = await import("./infra/monitoring.js");

    // Import storage tables for API linking
    const { 
      assetsBucket,
      usersTable, 
      gamesTable, 
      chatTable, 
      settingsTable, 
      notificationsTable 
    } = await import("./infra/storage.js");

    // Create authentication services
    const auth = createAuth();

    // Create API with all table access
    const api = createApi([
      usersTable,
      gamesTable,
      chatTable,
      settingsTable,
      notificationsTable,
    ]);

    // Create web services (CDN, Email, etc.)
    const web = createWebServices(assetsBucket.name);

    // Create monitoring and alerting (only for staging and production)
    const monitoring = $app.stage !== "dev" ? createMonitoring(api, $app.stage) : null;

    // Export important values for frontend/Lambda access
    return {
      // API
      apiUrl: api.url,
      
      // Authentication
      userPoolId: auth.userPool.id,
      userPoolClientId: auth.userPoolClient.id,
      identityPoolId: auth.identityPool.id,
      
      // Web Services
      websiteUrl: web.staticSite.url,
      emailSender: web.email.sender,
      
      // Storage
      bucketName: assetsBucket.name,

      // Monitoring (conditional)
      ...(monitoring && {
        alertsTopicArn: monitoring.alertsTopic.arn,
        dashboardUrl: `https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=plydojo-${$app.stage}-monitoring`,
      }),
    };
  },
}); 