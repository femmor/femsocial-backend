import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';

const app = express();

dotenv.config();

// Connect to DB
mongoose.connect(
  process.env.DB_URL,
  {
    useNewUrlParser: true,
  },
  () => {
    console.log('Connected to MongoDB');
  }
);

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 8800;

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
