# MemeForge Frontend Documentation

## Overview
MemeForge is a modern React-based meme generator application built with TypeScript, Vite, and Tailwind CSS. It provides users with powerful tools to create, share, and discover memes through an intuitive interface.

## 🚀 Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **State Management**: React Query (@tanstack/react-query)
- **HTTP Client**: Axios
- **Animations**: Framer Motion, Lottie React
- **UI Components**: Custom components with Tailwind
- **Notifications**: React Hot Toast
- **Image Handling**: React Masonry CSS, Swiper

## 📁 Project Structure

```
src/
├── App.tsx                 # Main app component with routing
├── main.tsx               # Application entry point
├── index.css              # Global styles
├── components/            # Reusable UI components
│   ├── AuthContext.tsx    # Authentication context provider
│   ├── Navbar.tsx         # Navigation bar
│   ├── MemeCard.tsx       # Meme display card
│   ├── LikeButton.tsx     # Like functionality
│   ├── SaveMemeDialog.tsx # Meme saving modal
│   └── ...
├── Pages/                 # Application pages
│   ├── LandingPage.tsx    # Homepage
│   ├── MemeGeneratorPage.tsx # Main meme creation tool
│   ├── AllMemesPage.tsx   # Browse all memes
│   ├── CommunityPage.tsx  # Community features
│   ├── UserProfilePage.tsx # User profile management
│   └── admin/             # Admin panel pages
├── services/              # API services
│   └── axiosInstance.ts   # HTTP client configuration
├── utils/                 # Utility functions
└── data/                  # Static data and constants
```

## 🔑 Key Features

### 1. Authentication System
- JWT-based authentication
- Sign up, sign in, password reset
- Role-based access control (user, admin, super_admin)
- Protected routes

### 2. Meme Generation
- **Template-based**: Upload images or use existing templates
- **AI-powered**: Generate images using DALL-E integration
- **Text overlays**: Add customizable text with:
  - Multiple font options
  - Color customization
  - Size adjustment
  - Positioning controls
  - Rotation capabilities

### 3. Community Features
- Browse public memes
- Like and comment system
- User profiles with bio and avatar
- Community testimonials
- Trending memes section

### 4. User Management
- Profile customization
- Privacy settings (public/private profiles)
- Personal meme collections
- User-generated content management

## 🎨 Design System

### Colors
The application uses a vibrant color palette with:
- Primary: Purple to pink gradient (`from-purple-600 to-pink-500`)
- Secondary: Yellow accent (`yellow-400`)
- Supporting: Orange (`orange-400`)
- Neutral: Gray scale for backgrounds and text

### Typography
- **Brand Font**: Custom gradient text for logo
- **UI Fonts**: System fonts optimized for readability
- **Meme Fonts**: Multiple options including Impact, Arial, Comic Sans

### Components
- **Responsive Design**: Mobile-first approach
- **Loading States**: Lottie animations for better UX
- **Error Handling**: Toast notifications
- **Modals**: Custom dialog components

## 🛠 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd meme-generator

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📱 Pages Overview

### Landing Page (`/`)
- Hero section with brand introduction
- Feature highlights
- User testimonials
- Call-to-action buttons

### Meme Generator (`/create`)
- Dual-mode creation:
  - Upload/Template mode: Use existing images
  - AI Generator mode: Create images with prompts
- Real-time preview
- Text customization tools
- Save and share functionality

### Explore Memes (`/memes`)
- Grid layout of public memes
- Search and filter options
- Infinite scroll or pagination
- Quick like/share actions

### Community (`/community`)
- Featured content
- User interactions
- Community guidelines
- Social features

### User Profile (`/profile`)
- Profile information editing
- Avatar management
- Bio customization
- Privacy settings
- Personal meme collection

## 🔐 Authentication Flow

### AuthContext
The application uses React Context for authentication state management:

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}
```

### Protected Routes
Routes are protected based on user roles:
- **Public**: Landing, SignIn, SignUp, Browse Memes
- **Authenticated**: Create, Profile, Community
- **Admin**: Admin Panel (admin/super_admin only)

## 🎯 Key Components

### MemeCard
Displays meme information with:
- Image preview
- Author information
- Like/comment counts
- Action buttons

### MemeTextOverlay
Handles text positioning and styling:
- Drag and drop positioning
- Real-time preview
- Style customization
- Rotation controls

### SaveMemeDialog
Modal for saving memes with:
- Title input
- Description
- Privacy settings
- Template creation options

## 🔄 State Management

### React Query
Used for server state management:
- API data caching
- Background refetching
- Optimistic updates
- Error boundary handling

### Local State
Component-level state using useState and useReducer for:
- Form inputs
- UI state
- Temporary data

## 📡 API Integration

### Axios Configuration
Centralized HTTP client with:
- Base URL configuration
- Request/response interceptors
- Error handling
- Authentication headers

### Endpoints
- Authentication: `/api/auth/*`
- Users: `/api/users/*`
- Images: `/api/images/*`
- Media: `/api/media/*`
- Likes: `/api/likes/*`
- Reviews: `/api/reviews/*`

## 🎨 Styling Guidelines

### Tailwind CSS
- Utility-first approach
- Responsive design principles
- Custom color palette
- Component-based styling

### Responsive Breakpoints
- Mobile: `sm` (640px)
- Tablet: `md` (768px)
- Desktop: `lg` (1024px)
- Large: `xl` (1280px)

## ⚡ Performance Optimization

### Code Splitting
- Route-based code splitting
- Lazy loading of components
- Dynamic imports for heavy features

### Image Optimization
- Lazy loading for meme images
- Responsive image sizes
- WebP format support where possible

### Caching Strategy
- React Query for API caching
- Browser caching for static assets
- Service worker for offline functionality

## 🧪 Testing Strategy

### Unit Testing
- Component testing with React Testing Library
- Hook testing for custom hooks
- Utility function testing

### Integration Testing
- API integration tests
- Authentication flow tests
- Critical user journey tests

## 🚀 Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
- `VITE_API_URL`: Backend API base URL
- `VITE_ASSETS_URL`: Static assets URL

### Production Considerations
- CDN setup for assets
- Performance monitoring
- Error tracking
- Analytics integration

## 🔧 Troubleshooting

### Common Issues
1. **CORS errors**: Check backend CORS configuration
2. **Image upload fails**: Verify file size limits
3. **Authentication issues**: Check JWT token validity
4. **Styling problems**: Ensure Tailwind CSS is properly configured

### Debug Mode
Enable development mode for detailed error messages and React DevTools integration. 