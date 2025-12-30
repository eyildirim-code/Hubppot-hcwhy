require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const ContactTaggingOrchestrator = require('./src/orchestrator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize orchestrator
let orchestrator;
let lastRunResult = null;
let isRunning = false;

try {
  orchestrator = new ContactTaggingOrchestrator(
    process.env.HUBSPOT_ACCESS_TOKEN,
    process.env.OPENAI_API_KEY
  );
  console.log('Orchestrator initialized successfully');
} catch (error) {
  console.error('Failed to initialize orchestrator:', error.message);
  process.exit(1);
}

/**
 * Execute the contact tagging process
 */
async function executeTaggingProcess() {
  if (isRunning) {
    console.log('Process already running, skipping this execution');
    return;
  }

  isRunning = true;
  try {
    lastRunResult = await orchestrator.processContacts();
    lastRunResult.timestamp = new Date().toISOString();
  } catch (error) {
    console.error('Error in tagging process:', error);
    lastRunResult = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    isRunning = false;
  }
}

// Schedule the job to run every 24 hours (default: midnight)
const cronSchedule = process.env.CRON_SCHEDULE || '0 0 * * *';
console.log(`Scheduling job with cron expression: ${cronSchedule}`);

cron.schedule(cronSchedule, () => {
  console.log(`\nScheduled job triggered at ${new Date().toISOString()}`);
  executeTaggingProcess();
});

// Routes

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'HubSpot Contact Tagging Service',
    timestamp: new Date().toISOString()
  });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  const status = orchestrator.getStatus();
  res.json({
    healthy: true,
    ...status
  });
});

/**
 * Get last run status
 */
app.get('/status', (req, res) => {
  res.json({
    isRunning,
    lastRun: lastRunResult,
    nextScheduledRun: 'Every 24 hours as per cron schedule'
  });
});

/**
 * Manually trigger the tagging process
 */
app.post('/trigger', async (req, res) => {
  if (isRunning) {
    return res.status(429).json({
      error: 'Process is already running',
      message: 'Please wait for the current process to complete'
    });
  }

  // Run asynchronously and return immediately
  executeTaggingProcess();
  
  res.json({
    message: 'Contact tagging process triggered',
    timestamp: new Date().toISOString()
  });
});

/**
 * Get logs/results from last run
 */
app.get('/logs', (req, res) => {
  if (!lastRunResult) {
    return res.json({
      message: 'No runs completed yet',
      timestamp: new Date().toISOString()
    });
  }

  res.json(lastRunResult);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📅 Scheduled to run every 24 hours`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\nAvailable endpoints:');
  console.log(`  GET  / - Service info`);
  console.log(`  GET  /health - Health check`);
  console.log(`  GET  /status - Current status and last run info`);
  console.log(`  POST /trigger - Manually trigger the process`);
  console.log(`  GET  /logs - Get last run results\n`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
