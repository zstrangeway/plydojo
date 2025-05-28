// Web Services with CloudFront, SES, and logging

export function createWebServices(bucketName: string) {
  // Static site hosting with CloudFront CDN
  // Note: In SST v3, StaticSite automatically creates CloudFront distribution
  const staticSite = new sst.aws.StaticSite("WebSite", {
    path: "../../apps/plydojo-web/out", // Path to Next.js export output
    assets: {
      bucket: bucketName, // Use existing S3 bucket
    },
    // TODO: Add custom domain when we own a real domain (Priority 2.3 Email Verification Flow)
    // domain: $app.stage === "production" ? "app.plydojo.com" : undefined,
    errorPage: "index.html", // SPA routing
    indexPage: "index.html",
    invalidation: {
      paths: "all",
      wait: false, // Don't wait for invalidation in dev/staging
    },
  });

  // AWS SES for email delivery
  // TODO: Replace with real domain when ready for production (Priority 2.3 Email Verification Flow)
  // Will need to: 1) Purchase domain, 2) Set up DNS records, 3) Verify domain in SES
  const email = new sst.aws.Email("EmailService", 
    $app.stage === "production" 
    ? {
        sender: "production@example.com", // Use simple email for production (no domain setup needed)
      }
    : {
        sender: `staging-${$app.stage}@example.com`, // Use unique email for each stage
      }
  );

  return {
    staticSite,
    email,
  };
} 