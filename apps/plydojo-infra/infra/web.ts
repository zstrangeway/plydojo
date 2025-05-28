// Web Services with CloudFront, SES, and logging

export function createWebServices(bucketName: string) {
  // Static site hosting with CloudFront CDN
  // Note: In SST v3, StaticSite automatically creates CloudFront distribution
  const staticSite = new sst.aws.StaticSite("WebSite", {
    path: "../../apps/plydojo-web/dist", // Path to built frontend assets
    assets: {
      bucket: bucketName, // Use existing S3 bucket
    },
    domain: $app.stage === "production" ? "app.plydojo.com" : undefined,
    errorPage: "index.html", // SPA routing
    indexPage: "index.html",
    invalidation: {
      paths: "all",
      wait: false, // Don't wait for invalidation in dev/staging
    },
  });

  // AWS SES for email delivery
  const email = new sst.aws.Email("EmailService", 
    $app.stage === "production" 
    ? {
        sender: "plydojo.com", // Use domain for production
        dmarc: "v=DMARC1; p=quarantine; adkim=s; aspf=s;",
      }
    : {
        sender: "test@example.com", // Use email address for dev/staging (no DMARC)
      }
  );

  return {
    staticSite,
    email,
  };
} 