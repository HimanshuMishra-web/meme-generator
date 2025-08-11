# MemeForge Application Architecture

## Overview

MemeForge is a full-stack meme generation platform built with React (frontend) and Node.js/Express (backend). The application provides users with tools to create, customize, and share memes through both traditional template-based creation and AI-powered generation. The platform includes user authentication, community features, premium content, and administrative capabilities.

The application follows a modern React architecture with TypeScript, using React Router for navigation, React Query for state management, and a RESTful API backend with MongoDB for data persistence.

## Application Structure

### Frontend Architecture

```
src/
├── components/          # Reusable UI components
├── Pages/              # Page-level components
├── services/           # API and external service integrations
├── data/               # Static data and constants
├── assets/             # Static assets (images, animations)
└── utils/              # Utility functions
```

### Backend Architecture

```
backend/src/
├── controllers/        # Request handlers
├── models/            # Database models
├── routes/            # API route definitions
├── middleware/        # Custom middleware
├── services/          # Business logic
├── config/            # Configuration files
└── utils/             # Utility functions
```

## Core Components

### 1. App.tsx - Main Application Component

**Purpose**: Root component that sets up routing, authentication context, and global state management.

**Key Responsibilities**:
- Provides authentication context to the entire application
- Configures React Router with all application routes
- Manages navigation state and conditional rendering
- Handles admin panel access control

**Component Hierarchy**:
```
App
├── AuthProvider
│   └── Router
│       ├── Navbar (conditional)
│       └── Routes
│           ├── LandingPage
│           ├── MemeGeneratorPage
│           ├── AllMemesPage
│           ├── UserProfilePage
│           ├── AdminDashboard
│           └── ... (other pages)
```

**State Management**:
- Authentication state (user, token, isAuthenticated)
- Navigation state (current route, navbar visibility)
- Admin access control

**Error Handling**:
- Global error boundaries
- Authentication error handling
- Route protection for admin pages

### 2. AuthContext - Authentication Management

**Purpose**: Provides centralized authentication state management and user session handling.

**Key Features**:
- User login/logout functionality
- Token management and refresh
- Persistent authentication state
- Role-based access control

**API Integration**:
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (username: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  handleAuthError: (error: any) => void;
  refreshToken: () => Promise<boolean>;
}
```

**State Management**:
- Local storage persistence
- Automatic token refresh
- Session expiration handling
- Query client cache management

**Security Features**:
- JWT token validation
- Automatic token refresh before expiration
- Secure logout with cache clearing
- Role-based route protection

### 3. MemeGeneratorPage - Core Meme Creation

**Purpose**: Main component for meme creation with both template-based and AI-powered generation capabilities.

**Key Features**:
- Image upload and template selection
- Text overlay with drag-and-drop positioning
- AI-powered image generation
- Real-time preview rendering
- Save and share functionality

**Component State**:
```typescript
interface MemeGeneratorState {
  // Image handling
  image: string | null;
  previewUrl: string | null;
  
  // Text overlays
  memeTexts: MemeText[];
  selectedTextId: number | null;
  
  // AI generation
  aiPrompt: string;
  aiStyle: ImageStyle;
  aiModel: ModelType;
  isGenerating: boolean;
  
  // UI state
  activeTab: 'Upload / Template' | 'AI Generator';
  showSaveDialog: boolean;
}
```

**User Interaction Flows**:

1. **Template-Based Creation**:
   - Upload image or select template
   - Add text overlays with positioning
   - Customize fonts, colors, and sizes
   - Preview and save

2. **AI-Powered Generation**:
   - Enter text prompt
   - Select style and model
   - Generate image
   - Add customizations
   - Save to collection

**Performance Considerations**:
- Canvas-based rendering for high-quality output
- Lazy loading of AI models
- Optimized image processing
- Debounced text input handling

### 4. MemeTextOverlay - Text Customization

**Purpose**: Handles individual text overlay positioning, styling, and interaction.

**Key Features**:
- Drag-and-drop positioning
- Resize handles for text scaling
- Rotation controls
- Real-time text editing
- Font and color customization

**Interaction States**:
- **Normal**: Display text with hover effects
- **Selected**: Show resize/rotate handles
- **Editing**: Textarea for direct editing
- **Dragging**: Visual feedback during movement

**Accessibility Features**:
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA labels for controls

## Routing Structure

### Public Routes
- `/` - Landing page with featured memes
- `/memes` - Browse all memes
- `/memes/:id` - Individual meme details
- `/community` - Community features
- `/contact` - Contact form
- `/support` - Support page
- `/privacy` - Privacy policy

### Authentication Routes
- `/signin` - User login
- `/signup` - User registration
- `/forgot-password` - Password recovery
- `/reset-password` - Password reset

### Protected Routes
- `/create` - Meme generator (requires auth)
- `/profile` - User profile
- `/premium` - Premium content
- `/purchased` - User's purchased memes
- `/my-tickets` - Support tickets

### Admin Routes
- `/admin` - Admin dashboard (admin/super_admin only)

## State Management Strategy

### React Query Integration
- Server state management for API calls
- Automatic caching and background updates
- Optimistic updates for better UX
- Error handling and retry logic

### Local State Management
- Component-level state for UI interactions
- Context providers for global state
- Local storage for persistence

### State Flow Patterns
1. **User Actions** → **Local State Updates** → **API Calls** → **Server State Updates**
2. **Route Changes** → **Component Mounting** → **Data Fetching** → **UI Updates**
3. **Authentication** → **Context Updates** → **Route Protection** → **UI Adaptation**

## Error Handling Strategy

### Frontend Error Handling
- Global error boundaries
- Component-level error states
- User-friendly error messages
- Graceful degradation

### Backend Error Handling
- Centralized error middleware
- Structured error responses
- Logging and monitoring
- Input validation

### Authentication Error Handling
- Token expiration handling
- Automatic refresh attempts
- Graceful logout on failure
- Clear error messaging

## Performance Optimizations

### Frontend Optimizations
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Memoization of expensive components
- Debounced user inputs

### Backend Optimizations
- Database query optimization
- Caching strategies
- Image processing optimization
- Rate limiting

## Security Considerations

### Authentication Security
- JWT token management
- Secure password handling
- Role-based access control
- Session management

### Data Security
- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure file uploads

### API Security
- Rate limiting
- Request validation
- Error message sanitization
- CORS configuration

## Testing Strategy

### Frontend Testing
- Component unit tests
- Integration tests for user flows
- E2E tests for critical paths
- Accessibility testing

### Backend Testing
- API endpoint testing
- Database integration tests
- Authentication flow testing
- Error handling tests

## Deployment Architecture

### Frontend Deployment
- Static file hosting
- CDN for assets
- Environment configuration
- Build optimization

### Backend Deployment
- Containerized deployment
- Database connection management
- Environment variables
- Health checks

## Monitoring and Analytics

### Application Monitoring
- Error tracking and reporting
- Performance monitoring
- User behavior analytics
- Server health monitoring

### Business Metrics
- User engagement tracking
- Meme creation analytics
- Premium feature usage
- Community activity metrics 