import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { logger, errorLogger } from './config/logger.js';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import subcategoryRoutes from './routes/subcategoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import homeRoutes from './routes/homeRoutes.js';
import aboutRoutes from './routes/aboutRoutes.js';
import careersRoutes from './routes/careersRoutes.js';
import brandingRoutes from './routes/brandingRoutes.js';
import navigationRoutes from './routes/navigationRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js';
import solutionsRoutes from './routes/solutionsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import contactPageRoutes from './routes/contactPageRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import footerRoutes from './routes/footerRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

// Secret Management Protocol: Only load .env file in non-production environments
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Transport Security & HTTP Headers (Helmet & HSTS)
app.use(
  helmet({
    contentSecurityPolicy: false, // Set false if using external images/CDN
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 Year in seconds
    includeSubDomains: true,
    preload: true,
  })
);

// 2. Structured HTTP Request Logging (Morgan -> Winston Stream)
const morganFormat = ':remote-addr - :method :url :status :res[content-length] - :response-time ms';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// 3. Global Body Parser Middlewares (50mb limit for uploads and data payloads)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve Uploaded Files Statically with transparent image and CORS headers
const staticUploadOptions = {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  },
};
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticUploadOptions));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), staticUploadOptions));


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/solutions', solutionsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/contact-page', contactPageRoutes);
app.use('/api/contact-settings', contactPageRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/settings', settingsRoutes);

// Server Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Kingsol Energy Admin Backend',
    timestamp: new Date().toISOString(),
  });
});

// 4. Structured Global 500-level Error Catching Middleware
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  errorLogger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// 1. ADMIN PANEL ROUTING (Must be defined first)
const adminBuildPath = path.join(__dirname, '../admin-panel/dist');
app.use('/admin-secure', express.static(adminBuildPath));
app.get('/admin-secure', (req, res) => {
  res.sendFile(path.resolve(adminBuildPath, 'index.html'));
});
app.get('/admin-secure/*', (req, res) => {
  res.sendFile(path.resolve(adminBuildPath, 'index.html'));
});

// 2. MAIN WEBSITE ROUTING (Must be defined last as the catch-all)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(clientBuildPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  logger.info(`🚀 Kingsol Backend Server running on port ${PORT} [Mode: ${process.env.NODE_ENV || 'development'}]`);
});
