# Backend API Documentation

## Overview

The MemeForge backend API is a RESTful service built with Node.js, Express, and MongoDB. It provides comprehensive functionality for meme creation, user management, AI image generation, and community features. The API follows REST principles with consistent error handling, authentication, and response formats.

The API is organized into logical modules with separate routes for different features, ensuring maintainability and scalability. All endpoints support JSON responses and include proper HTTP status codes and error messages.

## Base Configuration

### Server Information
- **Base URL**: `http://localhost:5000` (development)
- **Content Type**: `application/json`
- **Authentication**: JWT Bearer tokens
- **CORS**: Enabled for frontend integration

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/memeforge
JWT_SECRET=your-jwt-secret
AI_API_KEY=your-ai-api-key
```

## Authentication

### JWT Token Structure
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  iat: number;
  exp: number;
}
```

### Authentication Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```typescript
{
  username: string;
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    user: {
      _id: string;
      username: string;
      email: string;
      role: string;
      createdAt: Date;
    };
    token: string;
  };
  message: "User registered successfully";
}
```

**Error Responses:**
- `400` - Validation errors (missing fields, invalid email)
- `409` - User already exists
- `500` - Server error

#### POST `/api/auth/login`
Authenticate user and return JWT token.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    user: {
      _id: string;
      username: string;
      email: string;
      role: string;
      permissions: string[];
    };
    token: string;
  };
  message: "Login successful";
}
```

**Error Responses:**
- `400` - Missing credentials
- `401` - Invalid credentials
- `500` - Server error

#### POST `/api/auth/refresh-token`
Refresh JWT token before expiration.

**Headers:**
```http
Authorization: Bearer <current-token>
```

**Response:**
```typescript
{
  success: true;
  data: {
    token: string;
    user: User;
  };
  message: "Token refreshed successfully";
}
```

**Error Responses:**
- `401` - Invalid or expired token
- `500` - Server error

### User Routes (`/api/users`)

#### GET `/api/users/profile`
Get current user's profile information.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  data: {
    user: {
      _id: string;
      username: string;
      email: string;
      role: string;
      permissions: string[];
      createdAt: Date;
      updatedAt: Date;
    };
  };
}
```

#### PUT `/api/users/profile`
Update user profile information.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    user: User;
  };
  message: "Profile updated successfully";
}
```

### Image Generation Routes (`/api/images`)

#### POST `/api/images/generate`
Generate AI-powered images using text prompts.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  prompt: string;
  style: 'realistic' | 'anime' | 'cartoon' | 'storybook' | 'pixel' | 'cyberpunk';
  model: 'dall-e-3' | 'stable-diffusion' | 'midjourney';
  size?: '256x256' | '512x512' | '1024x1024';
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    imageUrl: string;
    meta: {
      model: string;
      style: string;
      prompt: string;
      generationTime: number;
    };
  };
  message: "Image generated successfully";
}
```

**Error Responses:**
- `400` - Invalid prompt or parameters
- `401` - Authentication required
- `429` - Rate limit exceeded
- `500` - Generation failed

### Meme Routes (`/api/memes`)

#### GET `/api/memes`
Get paginated list of memes.

**Query Parameters:**
```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 20
  category?: string;    // Filter by category
  userId?: string;      // Filter by user
  isPublic?: boolean;   // Filter public/private
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    memes: Meme[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
```

#### POST `/api/memes`
Create and save a new meme.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```typescript
FormData {
  image: File;
  title: string;
  description?: string;
  isPublic: boolean;
  category?: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    meme: {
      _id: string;
      title: string;
      description: string;
      imageUrl: string;
      userId: string;
      isPublic: boolean;
      category: string;
      likes: number;
      createdAt: Date;
    };
  };
  message: "Meme created successfully";
}
```

#### GET `/api/memes/:id`
Get specific meme by ID.

**Response:**
```typescript
{
  success: true;
  data: {
    meme: Meme & {
      user: {
        username: string;
        avatar?: string;
      };
      isLiked?: boolean;
    };
  };
}
```

#### DELETE `/api/memes/:id`
Delete a meme (owner only).

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  message: "Meme deleted successfully";
}
```

### Like Routes (`/api/likes`)

#### POST `/api/likes/:memeId`
Like or unlike a meme.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  data: {
    isLiked: boolean;
    likeCount: number;
  };
  message: "Meme liked/unliked successfully";
}
```

### Media Routes (`/api/media`)

#### POST `/api/media/upload`
Upload media files (images, videos).

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```typescript
FormData {
  file: File;
  type: 'image' | 'video';
  category?: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    media: {
      _id: string;
      url: string;
      type: string;
      category: string;
      userId: string;
      createdAt: Date;
    };
  };
  message: "Media uploaded successfully";
}
```

### Premium Routes (`/api/premium`)

#### GET `/api/premium/features`
Get available premium features.

**Response:**
```typescript
{
  success: true;
  data: {
    features: {
      advancedAI: boolean;
      unlimitedGenerations: boolean;
      prioritySupport: boolean;
      customTemplates: boolean;
    };
    subscription: {
      plan: string;
      expiresAt: Date;
      isActive: boolean;
    };
  };
}
```

#### POST `/api/premium/subscribe`
Subscribe to premium plan.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  plan: 'monthly' | 'yearly';
  paymentMethod: string;
}
```

### Analytics Routes (`/api/analytics`)

#### GET `/api/analytics/dashboard`
Get analytics dashboard data (admin only).

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  success: true;
  data: {
    users: {
      total: number;
      active: number;
      newThisMonth: number;
    };
    memes: {
      total: number;
      createdToday: number;
      popularCategories: Array<{category: string, count: number}>;
    };
    ai: {
      generationsToday: number;
      totalGenerations: number;
      averageGenerationTime: number;
    };
  };
}
```

### Support Routes (`/api/support`)

#### POST `/api/support/tickets`
Create a support ticket.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```typescript
{
  subject: string;
  message: string;
  category: 'technical' | 'billing' | 'feature' | 'bug';
  priority: 'low' | 'medium' | 'high';
  attachments?: File[];
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    ticket: {
      _id: string;
      subject: string;
      status: 'open' | 'in-progress' | 'resolved' | 'closed';
      priority: string;
      createdAt: Date;
    };
  };
  message: "Support ticket created successfully";
}
```

## Error Handling

### Standard Error Response Format

```typescript
{
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  statusCode: number;
}
```

### Common Error Codes

#### 4xx Client Errors
- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (resource already exists)
- `422` - Unprocessable Entity (validation failed)
- `429` - Too Many Requests (rate limit exceeded)

#### 5xx Server Errors
- `500` - Internal Server Error
- `502` - Bad Gateway (external service error)
- `503` - Service Unavailable (maintenance mode)

### Error Examples

#### Validation Error
```typescript
{
  success: false;
  error: {
    message: "Validation failed";
    details: {
      email: "Invalid email format";
      password: "Password must be at least 8 characters";
    };
  };
  statusCode: 400;
}
```

#### Authentication Error
```typescript
{
  success: false;
  error: {
    message: "Invalid credentials";
    code: "AUTH_INVALID_CREDENTIALS";
  };
  statusCode: 401;
}
```

#### Rate Limit Error
```typescript
{
  success: false;
  error: {
    message: "Rate limit exceeded. Please try again later.";
    code: "RATE_LIMIT_EXCEEDED";
    details: {
      retryAfter: 60; // seconds
    };
  };
  statusCode: 429;
}
```

## Middleware

### Authentication Middleware
```typescript
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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

### Role-based Access Control
```typescript
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' }
      });
    }
    next();
  };
};
```

### Rate Limiting
```typescript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: { message: 'Too many requests' }
  }
});
```

## Database Models

### User Model
```typescript
interface User {
  _id: ObjectId;
  username: string;
  email: string;
  password: string; // hashed
  role: 'user' | 'admin' | 'super_admin';
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Meme Model
```typescript
interface Meme {
  _id: ObjectId;
  title: string;
  description?: string;
  imageUrl: string;
  userId: ObjectId;
  isPublic: boolean;
  category: string;
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Like Model
```typescript
interface Like {
  _id: ObjectId;
  userId: ObjectId;
  memeId: ObjectId;
  createdAt: Date;
}
```

## Security Considerations

### Input Validation
- All user inputs are validated using Joi or similar
- File uploads are validated for type and size
- SQL injection prevention through parameterized queries
- XSS prevention through input sanitization

### Authentication Security
- JWT tokens with expiration
- Secure password hashing (bcrypt)
- Rate limiting on authentication endpoints
- Account lockout after failed attempts

### File Upload Security
- File type validation
- File size limits
- Virus scanning for uploaded files
- Secure file storage with CDN

### API Security
- CORS configuration
- Rate limiting on all endpoints
- Request size limits
- Error message sanitization

## Performance Optimization

### Database Optimization
- Indexed fields for common queries
- Connection pooling
- Query optimization
- Caching strategies

### Response Optimization
- Pagination for large datasets
- Selective field projection
- Response compression
- CDN for static assets

### Caching Strategy
- Redis for session storage
- Memory caching for frequently accessed data
- CDN caching for static files
- Browser caching headers

## Monitoring and Logging

### Request Logging
```typescript
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};
```

### Error Logging
```typescript
const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`${new Date().toISOString()} - Error: ${error.message}`);
  console.error(error.stack);
  next(error);
};
```

### Performance Monitoring
- Response time tracking
- Database query monitoring
- Memory usage monitoring
- Error rate tracking

## Testing

### Unit Tests
```typescript
describe('Auth Controller', () => {
  test('should register new user', async () => {
    // Test user registration
  });
  
  test('should authenticate user', async () => {
    // Test user login
  });
});
```

### Integration Tests
```typescript
describe('API Endpoints', () => {
  test('should create and retrieve meme', async () => {
    // Test complete meme creation flow
  });
});
```

### Load Testing
- API endpoint performance testing
- Database query performance
- Concurrent user simulation
- Memory leak detection

## Deployment

### Environment Setup
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

### Production Considerations
- Environment variable management
- Database connection optimization
- Log aggregation
- Health check endpoints
- Graceful shutdown handling

## API Versioning

### Version Strategy
- URL versioning: `/api/v1/`
- Header versioning: `Accept: application/vnd.api+json;version=1`
- Backward compatibility maintenance
- Deprecation notices

### Migration Guide
- API version migration documentation
- Breaking changes documentation
- Client library updates
- Deprecation timeline 