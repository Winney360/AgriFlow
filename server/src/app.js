import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import emergencyRequestRoutes from './routes/emergencyRequestRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Get allowed origins from environment
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || '';

// Allow both localhost and your Vercel frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  CLIENT_URL,
  RENDER_URL,
  'https://vercel.com', 
  /\.vercel\.app$/,
  /\.onrender\.com$/ 
].filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) {
        console.log('Request with no origin - allowing');
        return callback(null, true);
      }
      
      // Check if origin is allowed
      const allowed = allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return allowedOrigin === origin;
      });

      if (allowed) {
        console.log('CORS allowed for origin:', origin);
        callback(null, true);
      } else {
        console.log('CORS blocked for origin:', origin);
        callback(new Error('CORS not allowed'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);


// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} from origin: ${req.headers.origin}`);
  console.log('Client URL env:', process.env.CLIENT_URL);
  console.log('Request headers:', req.headers);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'AgriFlow API is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emergency-requests', emergencyRequestRoutes);

app.use(notFoundHandler);
app.use(errorHandler);