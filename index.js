const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5672']
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Supplychain backend is running' });
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'SupplyChain Inventory API Docs',
}));




app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Helper function to safely load and validate routes
const loadRoutes = (path, routeName) => {
  try {
    const routes = require(path);

    if (typeof routes !== 'function') {
      throw new Error(`${routeName} must be an Express router function. Got ${typeof routes} instead.`);
    }
    return routes;
  } catch (error) {
    console.error(`[ERROR] Failed to load ${routeName}:`, error.message);
    throw error;
  }
};

// Mount API Routes
const authRoutes = loadRoutes('./Modules/AUTH/Auth.routes', 'authRoutes');
app.use('/api/auth', authRoutes);
// Backward-compatible alias (so /auth/login works in Postman)
app.use('/auth', authRoutes);

const usersRoutes = loadRoutes('./Modules/Users/users.routes', 'usersRoutes');
app.use('/api/users', usersRoutes);

const inventoryRoutes = loadRoutes('./Modules/Inventory/inventory.routes', 'inventoryRoutes');
app.use('/api/inventory', inventoryRoutes);

const ordersRoutes = loadRoutes('./Modules/Order/order.route', 'ordersRoutes');
app.use('/api/orders', ordersRoutes);

const productRoutes = loadRoutes('./Modules/Products/Product.route', 'productRoutes');
app.use('/api/products', productRoutes);

const supplierRoutes = loadRoutes('./Modules/Suppliers/supplier.route', 'supplierRoutes');
app.use('/api/suppliers', supplierRoutes);

const purchaseRoutes = loadRoutes('./Modules/Purchase/purchase.routes', 'purchaseRoutes');
app.use('/api/purchases', purchaseRoutes);

// JSON 404 for unknown routes (avoid Express default HTML)
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[ERROR] Unhandled', {
    method: req.method,
    url: req.originalUrl,
    message: err && err.message,
  });

  const status = err && Number.isInteger(err.status) ? err.status : 500;
  const message =
    status === 500 ? 'Internal server error' : err.message || 'Error';

  return res.status(status).json({ success: false, message });
});

const PORT = process.env.PORT || 8002;
const MONGO_URI = process.env.MONGO_URI;





async function startServer() {
    try {
        if (MONGO_URI) {
            mongoose.connection.on('error', (error) => {
                console.error('[DB] MongoDB connection error:', error.message || error);
            });

            await mongoose.connect(MONGO_URI);
            console.log('[DB] Connected to MongoDB');
        } else {
            console.log('[DB] MONGO_URI not provided, starting without DB connection');
        }

        app.listen(PORT, () => {
            console.log(`[SERVER] Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('[SERVER] Failed to start server:', error.message || error);
        process.exit(1);
    }
}


startServer();
