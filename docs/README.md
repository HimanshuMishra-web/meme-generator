# MemeForge Documentation

Welcome to the comprehensive documentation for MemeForge, a modern meme generation platform built with React, Node.js, and AI-powered image generation.

## 📚 Documentation Index

### 🏗️ Architecture & Overview
- **[Application Architecture](./application-architecture.md)** - Complete system architecture, component relationships, and technical decisions
- **[Backend API Documentation](./api/backend-api-documentation.md)** - Complete REST API reference with all endpoints
- **[Frontend Documentation](./frontend-documentation.md)** - React component structure and frontend patterns
- **[Complete Workflow Documentation](./complete-workflow-documentation.md)** - End-to-end user workflows and system interactions

### 🔧 Core Components
- **[AuthContext Component](./components/auth-context.md)** - Authentication state management and user session handling
- **[MemeGeneratorPage Component](./components/meme-generator.md)** - Core meme creation interface with AI generation
- **[Admin Panel Documentation](./admin-panel-documentation.md)** - Administrative interface and management tools
- **[Mobile App Documentation](./mobile-app-documentation.md)** - Mobile application features and implementation

### 🚀 Getting Started

#### Quick Start Guide
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/memeforge.git
   cd memeforge
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Frontend (.env)
   VITE_API_URL=http://localhost:5000
   
   # Backend (.env)
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/memeforge
   JWT_SECRET=your-secret-key
   AI_API_KEY=your-ai-api-key
   ```

4. **Start the application**
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # Frontend (new terminal)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🎯 Key Features

### Core Functionality
- **AI-Powered Meme Generation** - Create memes from text prompts using advanced AI models
- **Template-Based Creation** - Upload images and add customizable text overlays
- **Real-Time Preview** - See changes instantly with live preview rendering
- **Drag-and-Drop Interface** - Intuitive text positioning and customization

### User Management
- **Authentication System** - Secure JWT-based authentication with role-based access
- **User Profiles** - Personal meme collections and profile management
- **Premium Features** - Advanced AI models and unlimited generations

### Community Features
- **Meme Sharing** - Share memes publicly or privately
- **Like System** - Like and interact with community memes
- **Categories** - Organize memes by categories and tags
- **Trending** - Discover popular and trending memes

### Administrative Tools
- **Admin Dashboard** - Comprehensive analytics and user management
- **Content Moderation** - Review and manage user-generated content
- **Analytics** - Detailed usage statistics and insights
- **Support System** - Ticket management and user support

## 🏛️ Architecture Overview

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
│   ├── AuthContext.tsx # Authentication state management
│   ├── MemeCard.tsx    # Meme display component
│   ├── MemeTextOverlay.tsx # Text customization
│   └── ...
├── Pages/              # Page-level components
│   ├── MemeGeneratorPage.tsx # Core meme creation
│   ├── LandingPage.tsx # Home page
│   ├── AdminDashboard.tsx # Admin interface
│   └── ...
├── services/           # API and external services
├── data/              # Static data and constants
└── utils/             # Utility functions
```

### Backend Architecture
```
backend/src/
├── controllers/        # Request handlers
├── models/            # Database models
├── routes/            # API route definitions
├── middleware/        # Custom middleware
├── services/          # Business logic
└── config/            # Configuration files
```

## 🔌 API Reference

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh-token` - Token refresh

### Meme Management
- `GET /api/memes` - List memes with pagination
- `POST /api/memes` - Create new meme
- `GET /api/memes/:id` - Get specific meme
- `DELETE /api/memes/:id` - Delete meme

### AI Generation
- `POST /api/images/generate` - Generate AI images
- `POST /api/media/upload` - Upload media files

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Premium Features
- `GET /api/premium/features` - Get premium features
- `POST /api/premium/subscribe` - Subscribe to premium

## 🧪 Testing

### Frontend Testing
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Backend Testing
```bash
cd backend

# Unit tests
npm test

# API tests
npm run test:api

# Load testing
npm run test:load
```

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify
npm run deploy
```

### Backend Deployment
```bash
cd backend

# Build for production
npm run build

# Deploy to Heroku/DigitalOcean
npm run deploy
```

## 🔧 Development

### Code Style
- **Frontend**: ESLint + Prettier configuration
- **Backend**: ESLint + Prettier configuration
- **TypeScript**: Strict type checking enabled

### Git Workflow
1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Write tests for new functionality
4. Submit pull request with detailed description
5. Code review and approval process

### Environment Setup
```bash
# Install Node.js (v16+)
# Install MongoDB
# Install Redis (optional, for caching)

# Clone repository
git clone <repository-url>

# Install dependencies
npm install
cd backend && npm install

# Set up environment variables
cp .env.example .env
cd backend && cp .env.example .env

# Start development servers
npm run dev  # Frontend
cd backend && npm run dev  # Backend
```

## 📊 Monitoring & Analytics

### Application Metrics
- User registration and engagement
- Meme creation statistics
- AI generation usage
- Popular categories and trends

### Performance Monitoring
- Response time tracking
- Error rate monitoring
- Database query optimization
- Memory usage tracking

### Error Tracking
- Frontend error boundaries
- Backend error logging
- User feedback collection
- Automated error reporting

## 🔒 Security

### Authentication Security
- JWT token management
- Secure password hashing
- Rate limiting on auth endpoints
- Account lockout protection

### Data Security
- Input validation and sanitization
- XSS and CSRF protection
- Secure file uploads
- Database query protection

### API Security
- CORS configuration
- Request size limits
- Error message sanitization
- Rate limiting on all endpoints

## 🤝 Contributing

### Development Guidelines
1. **Code Quality**: Follow established patterns and conventions
2. **Testing**: Write tests for new features and bug fixes
3. **Documentation**: Update documentation for API changes
4. **Performance**: Consider performance impact of changes
5. **Security**: Follow security best practices

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit pull request
6. Address review feedback

### Issue Reporting
- Use GitHub issues for bug reports
- Provide detailed reproduction steps
- Include environment information
- Add screenshots for UI issues

## 📞 Support

### Getting Help
- **Documentation**: Check this documentation first
- **GitHub Issues**: Report bugs and feature requests
- **Discord Community**: Join our community for help
- **Email Support**: Contact support@memeforge.com

### Common Issues
- **Authentication Problems**: Check JWT token and expiration
- **AI Generation Fails**: Verify API keys and rate limits
- **Image Upload Issues**: Check file size and format
- **Performance Issues**: Monitor network and database

## 📈 Roadmap

### Upcoming Features
- **Video Meme Support** - Create animated memes
- **Collaborative Creation** - Real-time collaborative editing
- **Advanced AI Models** - More sophisticated generation options
- **Mobile App** - Native iOS and Android applications

### Performance Improvements
- **WebGL Rendering** - Hardware-accelerated graphics
- **Service Worker** - Offline support and caching
- **CDN Integration** - Global content delivery
- **Database Optimization** - Improved query performance

### User Experience
- **Undo/Redo System** - Better editing experience
- **Auto-Save** - Automatic draft saving
- **Keyboard Shortcuts** - Power user features
- **Accessibility** - WCAG compliance improvements

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for AI image generation inspiration
- **React Team** for the amazing frontend framework
- **Express.js** for the robust backend framework
- **MongoDB** for the flexible database solution
- **Community Contributors** for feedback and improvements

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainers**: MemeForge Team 