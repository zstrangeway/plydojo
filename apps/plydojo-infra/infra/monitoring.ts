// Enhanced CloudWatch monitoring and alerting

export function createMonitoring(api: any, stage: string) {
  // SNS topic for critical alerts
  const alertsTopic = new sst.aws.SnsTopic("CriticalAlerts", {
    subscribers: {
      email: {
        type: "email",
        address: stage === "production" ? "alerts@plydojo.com" : "dev@plydojo.com",
      },
    },
  });

  // CloudWatch alarms for API Gateway
  const apiErrorAlarm = new aws.cloudwatch.MetricAlarm("ApiErrorAlarm", {
    name: `plydojo-${stage}-api-errors`,
    metricName: "4XXError",
    namespace: "AWS/ApiGateway",
    statistic: "Sum",
    period: 300, // 5 minutes
    evaluationPeriods: 2,
    threshold: 10, // More than 10 errors in 10 minutes
    comparisonOperator: "GreaterThanThreshold",
    dimensions: {
      ApiName: api.nodes.api.name,
    },
    alarmActions: [alertsTopic.arn],
    treatMissingData: "notBreaching",
  });

  const apiLatencyAlarm = new aws.cloudwatch.MetricAlarm("ApiLatencyAlarm", {
    name: `plydojo-${stage}-api-latency`,
    metricName: "Latency",
    namespace: "AWS/ApiGateway",
    statistic: "Average",
    period: 300,
    evaluationPeriods: 3,
    threshold: 5000, // 5 seconds
    comparisonOperator: "GreaterThanThreshold",
    dimensions: {
      ApiName: api.nodes.api.name,
    },
    alarmActions: [alertsTopic.arn],
    treatMissingData: "notBreaching",
  });

  // Lambda function error monitoring
  const lambdaErrorAlarm = new aws.cloudwatch.MetricAlarm("LambdaErrorAlarm", {
    name: `plydojo-${stage}-lambda-errors`,
    metricName: "Errors",
    namespace: "AWS/Lambda",
    statistic: "Sum",
    period: 300,
    evaluationPeriods: 2,
    threshold: 5, // More than 5 errors in 10 minutes
    comparisonOperator: "GreaterThanThreshold",
    alarmActions: [alertsTopic.arn],
    treatMissingData: "notBreaching",
  });

  // DynamoDB throttling alarm
  const dynamoThrottleAlarm = new aws.cloudwatch.MetricAlarm("DynamoThrottleAlarm", {
    name: `plydojo-${stage}-dynamo-throttles`,
    metricName: "ThrottledRequests",
    namespace: "AWS/DynamoDB",
    statistic: "Sum",
    period: 300,
    evaluationPeriods: 1,
    threshold: 1, // Any throttling is concerning
    comparisonOperator: "GreaterThanOrEqualToThreshold",
    alarmActions: [alertsTopic.arn],
    treatMissingData: "notBreaching",
  });

  // Custom health check metric
  const healthCheckMetric = new aws.cloudwatch.MetricAlarm("HealthCheckAlarm", {
    name: `plydojo-${stage}-health-check`,
    metricName: "HealthCheckFailures",
    namespace: "PlyDojo/Health",
    statistic: "Sum",
    period: 60, // 1 minute
    evaluationPeriods: 3,
    threshold: 3, // 3 consecutive failures
    comparisonOperator: "GreaterThanOrEqualToThreshold",
    alarmActions: [alertsTopic.arn],
    treatMissingData: "breaching", // Treat missing data as failure
  });

  // CloudWatch dashboard for monitoring
  const dashboard = new aws.cloudwatch.Dashboard("MonitoringDashboard", {
    dashboardName: `plydojo-${stage}-monitoring`,
    dashboardBody: JSON.stringify({
      widgets: [
        {
          type: "metric",
          x: 0,
          y: 0,
          width: 12,
          height: 6,
          properties: {
            metrics: [
              ["AWS/ApiGateway", "Count", "ApiName", api.nodes.api.name],
              [".", "4XXError", ".", "."],
              [".", "5XXError", ".", "."],
            ],
            view: "timeSeries",
            stacked: false,
            region: "us-east-1",
            title: "API Gateway Requests",
            period: 300,
          },
        },
        {
          type: "metric",
          x: 0,
          y: 6,
          width: 12,
          height: 6,
          properties: {
            metrics: [
              ["AWS/ApiGateway", "Latency", "ApiName", api.nodes.api.name],
            ],
            view: "timeSeries",
            stacked: false,
            region: "us-east-1",
            title: "API Gateway Latency",
            period: 300,
          },
        },
        {
          type: "metric",
          x: 0,
          y: 12,
          width: 12,
          height: 6,
          properties: {
            metrics: [
              ["AWS/Lambda", "Duration", { stat: "Average" }],
              [".", "Errors", { stat: "Sum" }],
              [".", "Invocations", { stat: "Sum" }],
            ],
            view: "timeSeries",
            stacked: false,
            region: "us-east-1",
            title: "Lambda Functions",
            period: 300,
          },
        },
      ],
    }),
  });

  return {
    alertsTopic,
    alarms: {
      apiError: apiErrorAlarm,
      apiLatency: apiLatencyAlarm,
      lambdaError: lambdaErrorAlarm,
      dynamoThrottle: dynamoThrottleAlarm,
      healthCheck: healthCheckMetric,
    },
    dashboard,
  };
} 