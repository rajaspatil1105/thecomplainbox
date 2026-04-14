require('dotenv').config({ path: '../.env' });
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

    // Test MySQL connection
    await sequelize.authenticate();
    console.log('✓ MySQL connected successfully');

    // Test MongoDB connection
    await connectMongoDB();
    console.log('✓ MongoDB connected successfully');

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

// Start server
startServer();

module.exports = app;
