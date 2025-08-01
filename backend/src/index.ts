import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';
import {PORT} from "./constants";
import { Request, Response, NextFunction } from 'express';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { imageRoutes } from './routes/imageRoutes';
import { permissionRoutes } from './routes/permissionRoutes';
import mediaRoutes from './routes/mediaRoutes';
import testimonialRoutes from './routes/testimonialRoutes';
import likeRoutes from './routes/likeRoutes';
import reviewRoutes from './routes/reviewRoutes';
import premiumRoutes from './routes/premiumRoutes';

interface AuthenticatedRequest extends Request {
  user?: any;
}

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from assets directory
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/assets/media', express.static(path.join(__dirname, '../assets/media')));

app.get('/', (req, res) => {
  res.send('Meme Generator Backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/premium', premiumRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}); 