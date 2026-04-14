const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const sequelize = require('./config/database');
const connectMongoDB = require('./config/mongodb');
const logAuditMiddleware = require('./middleware/auditLogger');
const EscalationJob = require('./jobs/escalationJob');

// Models initialization
const { initializeAssociations } = require('./models');

// Route imports
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

const STARTUP_MAX_RETRIES = Number(process.env.STARTUP_MAX_RETRIES || 15);
const STARTUP_RETRY_DELAY_MS = Number(process.env.STARTUP_RETRY_DELAY_MS || 3000);
const MONGO_REQUIRED = String(process.env.MONGO_REQUIRED || 'false').toLowerCase() === 'true';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryOperation = async (label, operation, { required = true } = {}) => {
  let lastError;

  for (let attempt = 1; attempt <= STARTUP_MAX_RETRIES; attempt++) {
    try {
      await operation();
      console.log(`✓ ${label} successful`);
      return true;
    } catch (error) {
      lastError = error;
      console.error(`[${label}] attempt ${attempt}/${STARTUP_MAX_RETRIES} failed: ${error.message}`);

      if (attempt < STARTUP_MAX_RETRIES) {
        await sleep(STARTUP_RETRY_DELAY_MS);
      }
    }
  }

  if (required) {
    throw lastError;
  }

  console.warn(`⚠ ${label} unavailable. Continuing in degraded mode.`);
  return false;
};

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Audit logging middleware (for all requests)
app.use(logAuditMiddleware);

// ============================================================================
// ROUTES
// ============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// DATABASE CONNECTION & SERVER START
// ============================================================================

const startServer = async () => {
  try {
    // Initialize Sequelize associations
    initializeAssociations();

    // Test MySQL connection with retry
    await retryOperation('MySQL connection', async () => {
      await sequelize.authenticate();
    });

    // Test MongoDB connection with retry (optional by default)
    await retryOperation('MongoDB connection', async () => {
      await connectMongoDB();
    }, { required: MONGO_REQUIRED });

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`✓ Backend API running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });

    // Start background escalation job
    EscalationJob.start();

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

// Start server
startServer();

module.exports = app;
