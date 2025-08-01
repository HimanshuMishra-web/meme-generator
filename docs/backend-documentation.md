# MemeForge Backend Documentation

## Overview
The MemeForge backend is a robust Node.js/Express API server built with TypeScript, providing comprehensive services for meme generation, user management, and content delivery. It integrates with MongoDB for data persistence and external APIs for AI-powered image generation.

## 🚀 Tech Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Processing**: FFmpeg for video processing
- **AI Integration**: OpenAI DALL-E API
- **Email Service**: Nodemailer
- **Environment Management**: dotenv

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.ts              # Application entry point
│   ├── constants.ts          # Application constants
│   ├── config/
│   │   └── db.ts            # Database configuration
│   ├── controllers/         # Request handlers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── imageController.ts
│   │   ├── mediaController.ts
│   │   ├── likeController.ts
│   │   ├── reviewController.ts
│   │   ├── testimonialController.ts
│   │   ├── roleController.ts
│   │   └── permissionController.ts
│   ├── models/              # Database schemas
│   │   ├── User.ts
│   │   ├── GeneratedImage.ts
│   │   ├── Media.ts
│   │   ├── Meme.ts
│   │   ├── Like.ts
│   │   ├── Review.ts
│   │   ├── Testimonial.ts
│   │   ├── Token.ts
│   │   ├── Role.ts
│   │   └── Permission.ts
│   ├── routes/              # API route definitions
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── imageRoutes.ts
│   │   ├── mediaRoutes.ts
│   │   ├── likeRoutes.ts
│   │   ├── reviewRoutes.ts
│   │   ├── testimonialRoutes.ts
│   │   └── permissionRoutes.ts
│   ├── middleware/          # Custom middleware
│   │   └── authMiddleware.ts
│   ├── services/            # Business logic services
│   │   ├── ImageGeneratorService.ts
│   │   └── VideoProcessingService.ts
│   ├── utils.ts             # Utility functions
│   └── seed.ts              # Database seeding script
├── assets/                  # Static file storage
│   ├── generated/           # AI-generated images
│   ├── media/               # User uploads
│   ├── memes/               # Created memes
│   └── testimonial-images/  # Testimonial media
├── package.json
├── tsconfig.json
└── constants.json
```

## 🔧 Server Configuration

### Entry Point (`src/index.ts`)
```typescript
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Static file serving
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/permissions', permissionRoutes);
```

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/memeforge
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

## 🗄 Database Models

### User Model
```typescript
interface IUser {
  username: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
  profileImage?: string;
  bio?: string;
  isPublic?: boolean;
}
```

### Generated Image Model
```typescript
interface IGeneratedImage {
  userId: ObjectId;
  prompt: string;
  style: string;
  model: string;
  imageUrl: string;
  localPath: string;
  createdAt: Date;
}
```

### Media Model
```typescript
interface IMedia {
  userId: ObjectId;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  isPublic: boolean;
  createdAt: Date;
}
```

### Meme Model
```typescript
interface IMeme {
  userId: ObjectId;
  title: string;
  description?: string;
  imageUrl: string;
  isPublic: boolean;
  isTemplate: boolean;
  tags: string[];
  likesCount: number;
  viewsCount: number;
  createdAt: Date;
}
```

### Like Model
```typescript
interface ILike {
  userId: ObjectId;
  targetId: ObjectId;
  targetType: 'meme' | 'testimonial';
  createdAt: Date;
}
```

### Review Model
```typescript
interface IReview {
  userId: ObjectId;
  targetId: ObjectId;
  targetType: 'meme' | 'testimonial';
  rating: number;
  comment: string;
  createdAt: Date;
}
```

### Testimonial Model
```typescript
interface ITestimonial {
  userId: ObjectId;
  content: string;
  rating: number;
  isApproved: boolean;
  imageUrl?: string;
  createdAt: Date;
}
```

## 🛡 Authentication & Authorization

### JWT Implementation
- Token generation on successful login
- Token validation middleware
- Role-based access control
- Password reset token system

### Auth Middleware
```typescript
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const authMiddleware = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  // Token validation logic
  // User attachment to request
  // Role verification
};
```

### Password Security
- bcryptjs for password hashing
- Salt rounds: 10
- Pre-save middleware for automatic hashing

## 🎨 AI Image Generation Service

### OpenAI Integration
```typescript
class ImageGeneratorService {
  generateImage(options: GenerateImageOptions): Promise<string[]>
  saveImageFromUrl(imageUrl: string, userId: string): Promise<string>
}
```

### Supported Features
- **Models**: DALL-E 2, DALL-E 3
- **Styles**: Realistic, Anime, Cartoon, Storybook, Pixel, Cyberpunk
- **Sizes**: 256x256, 512x512, 1024x1024
- **Batch Generation**: Multiple images per request

### Image Processing Pipeline
1. Prompt enhancement based on style
2. API request to OpenAI
3. Image URL retrieval
4. Local image download and storage
5. Database record creation
6. File path normalization

## 🎬 Video Processing Service

### FFmpeg Integration
- Video thumbnail generation
- Format conversion
- Compression optimization
- Metadata extraction

### Supported Formats
- **Input**: MP4, MOV, AVI, WebM
- **Output**: MP4 (H.264), WebM
- **Thumbnails**: JPEG format

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
```typescript
POST   /register           # User registration
POST   /login              # User login
POST   /logout             # User logout
POST   /forgot-password    # Password reset request
POST   /reset-password     # Password reset confirmation
GET    /verify-token       # Token validation
```

### User Routes (`/api/users`)
```typescript
GET    /profile            # Get user profile
PUT    /profile            # Update user profile
GET    /:id                # Get user by ID
PUT    /:id/role           # Update user role (admin only)
DELETE /:id                # Delete user (admin only)
GET    /                   # List all users (admin only)
```

### Image Routes (`/api/images`)
```typescript
POST   /generate           # Generate AI image
GET    /generated          # Get user's generated images
GET    /generated/:id      # Get specific generated image
DELETE /generated/:id      # Delete generated image
```

### Media Routes (`/api/media`)
```typescript
POST   /upload             # Upload media file
GET    /                   # Get user's media files
GET    /:id                # Get specific media file
DELETE /:id                # Delete media file
PUT    /:id/visibility     # Update media visibility
```

### Like Routes (`/api/likes`)
```typescript
POST   /                   # Add like
DELETE /:targetId          # Remove like
GET    /:targetId          # Get likes for target
GET    /user/:userId       # Get user's likes
```

### Review Routes (`/api/reviews`)
```typescript
POST   /                   # Add review
GET    /:targetId          # Get reviews for target
PUT    /:id                # Update review
DELETE /:id                # Delete review
```

### Testimonial Routes (`/api/testimonials`)
```typescript
POST   /                   # Create testimonial
GET    /                   # Get approved testimonials
GET    /pending            # Get pending testimonials (admin)
PUT    /:id/approve        # Approve testimonial (admin)
PUT    /:id/reject         # Reject testimonial (admin)
DELETE /:id                # Delete testimonial
```

## 🔒 Security Features

### Request Validation
- Input sanitization
- File type validation
- Size limit enforcement
- CORS configuration

### Rate Limiting
- API request rate limiting
- File upload size limits
- Concurrent request handling

### Data Protection
- SQL injection prevention (NoSQL injection for MongoDB)
- XSS protection
- CSRF token validation
- Secure cookie handling

## 📁 File Management

### Storage Structure
```
assets/
├── generated/
│   └── {userId}/
│       └── {timestamp}.{ext}
├── media/
│   └── {timestamp}-{randomId}.{ext}
├── memes/
│   └── {userId}/
│       └── {timestamp}.png
└── testimonial-images/
    └── {timestamp}-{originalName}
```

### File Processing
- Automatic directory creation
- Unique filename generation
- Path normalization for cross-platform compatibility
- Cleanup for deleted content

## 🔍 Error Handling

### Error Types
```typescript
interface APIError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}
```

### Global Error Handler
- Centralized error processing
- Detailed error logging
- Client-safe error responses
- Development vs production error details

### Common Error Responses
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side errors

## 📊 Database Operations

### Connection Management
```typescript
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
```

### Query Optimization
- Indexed fields for frequently queried data
- Aggregation pipelines for complex queries
- Pagination for large datasets
- Efficient population of references

### Data Seeding
```bash
npm run seed
```
- Creates default admin user
- Populates initial roles and permissions
- Sets up default templates

## ⚡ Performance Optimization

### Caching Strategy
- MongoDB query result caching
- File system caching for static assets
- Memory-efficient image processing

### Async Operations
- Non-blocking file operations
- Parallel processing where applicable
- Queue system for heavy operations

### Resource Management
- Memory leak prevention
- File descriptor management
- Graceful shutdown handling

## 🧪 Testing Strategy

### Unit Tests
- Controller function testing
- Service layer testing
- Utility function validation

### Integration Tests
- API endpoint testing
- Database operation testing
- External service integration testing

### Test Database
- Separate test database configuration
- Test data cleanup after each test
- Mock external API calls

## 🚀 Deployment

### Production Setup
```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Environment Configuration
- Production environment variables
- Database connection optimization
- Log level configuration

### Process Management
- PM2 for process management
- Auto-restart on failure
- Cluster mode for scalability

## 📈 Monitoring & Logging

### Request Logging
- HTTP request/response logging
- Error tracking and reporting
- Performance metrics collection

### Health Checks
- Database connection monitoring
- External API availability checks
- System resource monitoring

### Alerts
- Critical error notifications
- Performance degradation alerts
- Security incident reporting

## 🔧 Maintenance

### Regular Tasks
- Database optimization
- Log file rotation
- Temporary file cleanup
- Security updates

### Backup Strategy
- Automated database backups
- File system backups
- Backup restoration procedures

### Scaling Considerations
- Horizontal scaling capabilities
- Load balancing setup
- Database sharding strategies

This backend provides a robust foundation for the MemeForge application with comprehensive API coverage, security measures, and scalability features. 