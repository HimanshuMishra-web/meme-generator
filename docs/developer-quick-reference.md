# Developer Quick Reference

## 🚀 Quick Start Commands

### Setup
```bash
# Clone and setup
git clone <repository-url>
cd memeforge
npm install
cd backend && npm install

# Environment setup
cp .env.example .env
cd backend && cp .env.example .env
```

### Development
```bash
# Start frontend (Terminal 1)
npm run dev

# Start backend (Terminal 2)
cd backend && npm run dev

# Start both (if using concurrently)
npm run dev:full
```

### Testing
```bash
# Frontend tests
npm test
npm run test:watch
npm run test:coverage

# Backend tests
cd backend
npm test
npm run test:watch
```

### Building
```bash
# Frontend build
npm run build
npm run preview

# Backend build
cd backend
npm run build
npm start
```

## 🔧 Common Code Snippets

### Frontend Components

#### Using AuthContext
```typescript
import { useAuth } from '../components/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }
  
  return <div>Welcome, {user?.username}!</div>;
}
```

#### API Service Usage
```typescript
import { apiService } from '../services/axiosInstance';

// GET request
const memes = await apiService.get('/memes');

// POST request
const newMeme = await apiService.post('/memes', formData);

// With authentication
const profile = await apiService.get('/users/profile');
```

#### Form Handling
```typescript
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const [formData, setFormData] = useState({
  title: '',
  description: ''
});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await apiService.post('/memes', formData);
    toast.success('Meme created successfully!');
  } catch (error) {
    toast.error('Failed to create meme');
  }
};
```

### Backend Controllers

#### Basic Controller Structure
```typescript
import { Request, Response } from 'express';

export const getMemes = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const memes = await Meme.find()
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    res.json({
      success: true,
      data: { memes }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch memes' }
    });
  }
};
```

#### Authentication Middleware
```typescript
import jwt from 'jsonwebtoken';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'No token provided' }
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid token' }
    });
  }
};
```

#### File Upload Handling
```typescript
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
```

## 🗄️ Database Queries

### MongoDB with Mongoose

#### Find Documents
```typescript
// Find all memes
const memes = await Meme.find();

// Find with filter
const userMemes = await Meme.find({ userId: userId });

// Find with pagination
const memes = await Meme.find()
  .limit(20)
  .skip(0)
  .sort({ createdAt: -1 });

// Find with populate
const meme = await Meme.findById(id).populate('userId', 'username');
```

#### Create Document
```typescript
const newMeme = new Meme({
  title: 'My Meme',
  imageUrl: 'https://example.com/image.jpg',
  userId: userId,
  isPublic: true
});

await newMeme.save();
```

#### Update Document
```typescript
// Update by ID
await Meme.findByIdAndUpdate(id, {
  title: 'Updated Title',
  isPublic: false
});

// Update with options
await Meme.findByIdAndUpdate(id, updateData, {
  new: true, // return updated document
  runValidators: true
});
```

#### Delete Document
```typescript
// Delete by ID
await Meme.findByIdAndDelete(id);

// Delete multiple
await Meme.deleteMany({ userId: userId });
```

## 🔍 Debugging Tips

### Frontend Debugging

#### React DevTools
```typescript
// Enable React DevTools
import { enableLogging } from 'react-query';

if (process.env.NODE_ENV === 'development') {
  enableLogging();
}
```

#### Console Debugging
```typescript
// Debug component state
console.log('Component State:', { user, isAuthenticated });

// Debug API calls
console.log('API Response:', response.data);

// Debug form data
console.log('Form Data:', formData);
```

#### Network Debugging
```typescript
// Log all API requests
apiService.interceptors.request.use(request => {
  console.log('API Request:', request);
  return request;
});

apiService.interceptors.response.use(response => {
  console.log('API Response:', response);
  return response;
});
```

### Backend Debugging

#### Request Logging
```typescript
// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

#### Error Logging
```typescript
// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' }
  });
});
```

#### Database Debugging
```typescript
// Enable Mongoose debug mode
mongoose.set('debug', true);

// Log database queries
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});
```

## 🧪 Testing Examples

### Frontend Tests

#### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../components/AuthContext';

test('should render login form', () => {
  render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
  
  expect(screen.getByText('Sign In')).toBeInTheDocument();
});
```

#### API Testing
```typescript
import { apiService } from '../services/axiosInstance';

test('should fetch memes', async () => {
  const response = await apiService.get('/memes');
  expect(response.data.success).toBe(true);
  expect(response.data.data.memes).toBeDefined();
});
```

### Backend Tests

#### Controller Testing
```typescript
import request from 'supertest';
import app from '../app';

describe('Meme Controller', () => {
  test('should get memes', async () => {
    const response = await request(app)
      .get('/api/memes')
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });
});
```

#### Database Testing
```typescript
import mongoose from 'mongoose';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST!);
});

afterAll(async () => {
  await mongoose.connection.close();
});

afterEach(async () => {
  await Meme.deleteMany({});
});
```

## 🚀 Performance Optimization

### Frontend Optimization

#### React Optimization
```typescript
// Memoize expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* component logic */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

#### Image Optimization
```typescript
// Lazy load images
import { LazyLoadImage } from 'react-lazy-load-image-component';

<LazyLoadImage
  src={imageUrl}
  alt="Meme"
  effect="blur"
  placeholderSrc={placeholderUrl}
/>
```

### Backend Optimization

#### Database Optimization
```typescript
// Add indexes for common queries
memeSchema.index({ userId: 1, createdAt: -1 });
memeSchema.index({ category: 1, isPublic: 1 });

// Use projection to limit fields
const memes = await Meme.find({}, 'title imageUrl createdAt');
```

#### Caching
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache expensive queries
const getCachedMemes = async () => {
  const cached = await redis.get('memes');
  if (cached) {
    return JSON.parse(cached);
  }
  
  const memes = await Meme.find();
  await redis.setex('memes', 300, JSON.stringify(memes));
  return memes;
};
```

## 🔒 Security Best Practices

### Frontend Security

#### Input Validation
```typescript
// Validate user input
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize user input
const sanitizeInput = (input: string): string => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};
```

#### XSS Prevention
```typescript
// Use React's built-in XSS protection
const userContent = <div>{userInput}</div>;

// For dangerouslySetInnerHTML, sanitize first
const sanitizedHtml = DOMPurify.sanitize(userHtml);
```

### Backend Security

#### Input Validation
```typescript
import Joi from 'joi';

const memeSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  isPublic: Joi.boolean().required()
});

export const validateMeme = (req: Request, res: Response, next: NextFunction) => {
  const { error } = memeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: { message: error.details[0].message }
    });
  }
  next();
};
```

#### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: { message: 'Too many login attempts' }
  }
});

app.use('/api/auth/login', authLimiter);
```

## 🐛 Common Issues & Solutions

### Authentication Issues

#### Token Expiration
```typescript
// Check token expiration
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
```

#### CORS Issues
```typescript
// Backend CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Database Issues

#### Connection Problems
```typescript
// Handle database connection errors
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
```

#### Query Performance
```typescript
// Use lean() for read-only queries
const memes = await Meme.find().lean();

// Use select() to limit fields
const users = await User.find().select('username email');
```

### File Upload Issues

#### File Size Limits
```typescript
// Configure multer limits
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
});
```

#### File Type Validation
```typescript
const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};
```

## 📊 Monitoring & Logging

### Application Logging
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Performance Monitoring
```typescript
// Response time middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

---

**Remember**: Always check the main documentation for detailed information about specific features and components. 