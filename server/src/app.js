const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const { seedTicketsIfEmpty } = require('./services/seedTickets');

const healthRoutes = require('./routes/healthRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const statsRoutes = require('./routes/statsRoutes');
const authRoutes = require('./routes/authRoutes');
const authenticate = require('./utils/authMiddleware');

const logger = require('./utils/logger');
const swaggerDocument = YAML.load(path.join(__dirname, '../docs/openapi.yaml'));

const app = express();

// Database init + seeding
initializeDatabase()
  .then(async () => {
    logger.info('Database initialized and ready');

    const seedResult = await seedTicketsIfEmpty();
    if (seedResult.seeded) {
      logger.info(`Ticket seeding completed. Inserted ${seedResult.insertedCount} tickets.`);
    } else {
      logger.info(`Ticket seeding skipped: ${seedResult.reason} (existing tickets: ${seedResult.existingCount || 0})`);
    }
  })
  .catch(error => {
    logger.error('Application initialization failed:', error);
    process.exit(1);
  });

// Middleware
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/', (req, res) => res.json({ name:'Ticket Manager API', version:'2.0.0', endpoints:{ health:'/health', tickets:'/api/tickets', stats:'/api/stats', documentation:'/api-docs' } }));

app.use('/health', healthRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tickets', authenticate, ticketRoutes); // Protected!

// 404 & error handler
app.use((req,res)=>res.status(404).json({ error:'Not Found', message:`Route ${req.method} ${req.path} not found` }));
app.use((err, req, res, next)=>{
  logger.error('Unhandled error:', err);
  res.status(err.status||500).json({ error:err.name||'Internal Server Error', message:err.message||'Unexpected error', ...(process.env.NODE_ENV==='development' && { stack: err.stack }) });
});

module.exports = app;