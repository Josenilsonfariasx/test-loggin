"use strict";

require("dotenv").config();

const { NodeSDK } = require("@opentelemetry/sdk-node");
const { OTLPLogExporter } = require("@opentelemetry/exporter-logs-otlp-http");
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-http");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { resourceFromAttributes } = require("@opentelemetry/resources");
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require("@opentelemetry/semantic-conventions");
const { SimpleLogRecordProcessor } = require("@opentelemetry/sdk-logs");
const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (!otlpEndpoint) {
  console.warn("[otel] OTEL_EXPORTER_OTLP_ENDPOINT não definido — telemetria desabilitada");
} else {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || "products-api",
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version || "1.0.0",
      "deployment.environment": process.env.NODE_ENV || "production",
    }),
    logRecordProcessors: [
      new SimpleLogRecordProcessor(
        new OTLPLogExporter({
          url: `${otlpEndpoint}/v1/logs`,
        }),
      ),
    ],
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${otlpEndpoint}/v1/metrics`,
      }),
      exportIntervalMillis: 15000,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
        "@opentelemetry/instrumentation-http": { enabled: true },
        "@opentelemetry/instrumentation-express": { enabled: true },
        "@opentelemetry/instrumentation-pg": { enabled: true },
        "@opentelemetry/instrumentation-ioredis": { enabled: true },
        "@opentelemetry/instrumentation-winston": { enabled: true },
        "@opentelemetry/instrumentation-pino": { enabled: true },
      }),
    ],
  });

  sdk.start();

  const shutdown = () => {
    sdk.shutdown().finally(() => process.exit(0));
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
