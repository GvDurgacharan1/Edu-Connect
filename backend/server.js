import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurations and DB
import './config/firebase.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import postRoutes from './routes/postRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Socket Handler
import socketHandler from './socket/socketHandler.js';

// Environment Setup
dotenv.config();

// Connect Mongoose Database
// Database is initialized via firebase config import above

const app = express();
const server = http.createServer(app);

// Configure ES Modules __dirname equivalents
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
socketHandler(io);

// Security and Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows files uploads to be fetched by frontend
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request & Response debug logging middleware
app.use((req, res, next) => {
  console.log(`[HTTP REQUEST] ${req.method} ${req.originalUrl} - Body:`, req.body);
  const oldJson = res.json;
  res.json = function(data) {
    console.log(`[HTTP RESPONSE] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Body:`, data);
    return oldJson.apply(this, arguments);
  };
  next();
});

// Apply rate limiting to all requests
app.use('/api', apiLimiter);

// Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routers
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teachers', teacherRoutes); // Pluralized to distinguish list queries
app.use('/api/teacher', teacherRoutes);  // Singular to support profile get and update requests from frontend
app.use('/api/courses', courseRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Fallback handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`EduConnect server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
