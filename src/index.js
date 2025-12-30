const express = require('express');
const config = require('./config');
const Scheduler = require('./scheduler');
const ContactTaggerService = require('./contactTaggerService');

const app = express();
const scheduler = new Scheduler();
const contactTaggerService = new ContactTaggerService();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'HubSpot Contact Tagger',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Manual trigger endpoint (for testing)
app.post('/trigger', async (req, res) => {
  try {
    console.log('Manual trigger requested');
    const result = await contactTaggerService.processContacts();
    res.json({
      success: true,
      message: 'Contact tagging process completed',
      result
    });
  } catch (error) {
    console.error('Error in manual trigger:', error);
    res.status(500).json({
      success: false,
      message: 'Contact tagging process failed',
      error: error.message
    });
  }
});

// Start the scheduler
try {
  scheduler.start();
} catch (error) {
  console.error('Failed to start scheduler:', error);
  process.exit(1);
}

// Start the Express server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`\n=== Server Started ===`);
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Manual trigger: POST http://localhost:${PORT}/trigger`);
  console.log('========================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
