const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { SEMRESATTRS_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const { metrics } = require('@opentelemetry/api');
const env = require('../config/env');

let sdk;
let meter;
let counters;

async function startTelemetry() {
  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [SEMRESATTRS_SERVICE_NAME]: env.otelServiceName,
      environment: env.nodeEnv,
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${env.otelExporterOtlpEndpoint}/v1/traces`,
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${env.otelExporterOtlpEndpoint}/v1/metrics`,
      }),
      exportIntervalMillis: 5000,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });
  await sdk.start();
  meter = metrics.getMeter('brice-sentinel');
  counters = {
    optimizeRequests: meter.createCounter('brice_optimize_requests_total'),
    simulationJobs: meter.createCounter('brice_simulation_jobs_total'),
    feedbackEvents: meter.createCounter('brice_feedback_events_total'),
    authLogins: meter.createCounter('brice_auth_logins_total'),
  };
}

async function stopTelemetry() {
  if (sdk) await sdk.shutdown();
}

function getCounters() {
  return counters || {
    optimizeRequests: { add() {} },
    simulationJobs: { add() {} },
    feedbackEvents: { add() {} },
    authLogins: { add() {} },
  };
}

module.exports = { startTelemetry, stopTelemetry, getCounters };
