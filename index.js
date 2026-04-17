const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Minimal request logging for debugging route issues
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Supplychain backend is running' });
});

// Helper function to safely load and validate routes
const loadRoutes = (path, routeName) => {
  try {
    console.log(`index.js: loading ${routeName} from`, path);
    const routes = require(path);
    console.log(`index.js: ${routeName} type =`, typeof routes);
    
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

const PORT = process.env.PORT || 8002;
const MONGO_URI = process.env.MONGO_URI;
const seedAdmin = require('./Modules/AUTH/utils/seedAdmin');

async function startServer() {
    try {
        if (MONGO_URI) {
            mongoose.connection.once('open', () => {
                console.log('[DB] MongoDB connection open');
                seedAdmin().then(() => {
                    console.log('[SEED] Admin seed completed');
                }).catch((error) => {
                    console.error('[SEED] Admin seed failed:', error.message || error);
                });
            });

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
