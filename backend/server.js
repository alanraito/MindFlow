/*
  Arquivo: server.js
  Descrição: Adicionada a nova rota de nuvem de palavras para ser utilizada pela aplicação.
*/
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import mapsRoutes from './routes/maps.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import permissionsRoutes from './routes/permissions.js';
import flashcardsRoutes from './routes/flashcards.js';
import wordCloudsRoutes from './routes/wordclouds.js'; // Importa a nova rota
import aiRoutes from './routes/ai.js';

import authMiddleware from './middleware/authMiddleware.js';
import adminMiddleware from './middleware/adminMiddleware.js';
import initializeSocketHandlers from './socketHandlers.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL 
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Conectado...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
connectDB();

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => res.send('API do MindFlow está rodando!'));
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/permissions', authMiddleware, permissionsRoutes);
app.use('/api/flashcards', authMiddleware, flashcardsRoutes);
app.use('/api/wordclouds', authMiddleware, wordCloudsRoutes); // Usa a nova rota
app.use('/api/ai', authMiddleware, aiRoutes);

initializeSocketHandlers(io);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));