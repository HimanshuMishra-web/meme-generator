import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import {PORT} from "./constants";
import { Request, Response, NextFunction } from 'express';
import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';

interface AuthenticatedRequest extends Request {
  user?: any;
}

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Meme Generator Backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}); 