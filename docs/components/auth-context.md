# AuthContext Component Documentation

## Overview

The `AuthContext` is a React Context provider that manages authentication state throughout the MemeForge application. It provides centralized authentication functionality including user login, logout, token management, and role-based access control. The context handles persistent authentication state using localStorage and automatically refreshes tokens before expiration.

The component integrates with the backend authentication API and provides a clean interface for components to access authentication state and perform authentication-related operations.

## Usage

### Basic Usage

```typescript
import { useAuth } from '../components/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  
  const handleLogin = async () => {
    const success = await signIn('user@example.com', 'password');
    if (success) {
      // Navigate to dashboard or show success message
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.username}!</p>
      ) : (
        <button onClick={handleLogin}>Sign In</button>
      )}
    </div>
  );
}
```

### Provider Setup

```typescript
import { AuthProvider } from '../components/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Your app components */}
      </Router>
    </AuthProvider>
  );
}
```

## API / Props / Parameters

### AuthContextType Interface

```typescript
interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (username: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  refreshToken: () => Promise<boolean>;
  handleAuthError: (error: any) => void;
}
```

### User Interface

```typescript
interface User {
  username: string;
  email: string;
  role?: string;
  permissions?: string[];
}
```

### Provider Props

```typescript
interface AuthProviderProps {
  children: ReactNode;
}
```

## Component Hierarchy

```
AuthProvider
├── useState (user, token, isAuthenticated)
├── useEffect (initialization)
├── useMutation (login, signup)
└── Context.Provider
    └── children (app components)
```

## State Management

### Initial State

```typescript
const [user, setUser] = useState<User | null>(null);
const [token, setToken] = useState<string | null>(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);
```

### State Persistence

The authentication state is persisted in localStorage using the key `'meme-app-auth'`:

```typescript
const LOCAL_STORAGE_KEY = 'meme-app-auth';

// Save state
localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user, token }));

// Load state
const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
if (stored) {
  const { user, token } = JSON.parse(stored);
  setUser(user);
  setToken(token);
  setIsAuthenticated(true);
}
```

### State Flow

1. **Initialization**: Check localStorage for existing session
2. **Login**: Update state with user data and token
3. **Token Refresh**: Automatically refresh before expiration
4. **Logout**: Clear state and localStorage
5. **Error Handling**: Handle authentication errors gracefully

## Behavior

### Authentication Flow

#### Login Process
1. User submits credentials
2. API call to `/auth/login`
3. On success: Store user data and token
4. Update authentication state
5. Persist to localStorage
6. Return success/failure status

#### Token Refresh Process
1. Check token expiration on initialization
2. If expiring within 1 hour, attempt refresh
3. Call `/auth/refresh-token` with current token
4. Update token if successful
5. Handle refresh failures gracefully

#### Logout Process
1. Clear user state
2. Clear token
3. Set isAuthenticated to false
4. Remove from localStorage
5. Clear React Query cache

### Error Handling

#### Authentication Errors
- Invalid credentials
- Network errors
- Token refresh failures
- Server errors

#### Error Response Format
```typescript
interface AuthError {
  message: string;
  code?: string;
  details?: any;
}
```

#### Error Handling Strategy
1. **Login Errors**: Display user-friendly messages
2. **Token Refresh Errors**: Logout user and redirect to login
3. **Network Errors**: Retry with exponential backoff
4. **Server Errors**: Show generic error message

## Error Handling

### Error Types and Handling

#### Invalid Credentials
```typescript
// Error: "Invalid credentials"
// Action: Display error message to user
// State: No state change
```

#### Token Expiration
```typescript
// Error: "Token refresh failed"
// Action: Logout user, redirect to login
// State: Clear all authentication state
```

#### Network Errors
```typescript
// Error: Network timeout or connection error
// Action: Retry with exponential backoff
// State: Maintain current state during retry
```

### Error Recovery

#### Automatic Recovery
- Token refresh on initialization
- Retry failed requests
- Graceful degradation

#### Manual Recovery
- User-initiated logout
- Clear browser data
- Contact support

## Performance Considerations

### Optimization Strategies

#### Token Management
- Lazy token validation
- Efficient localStorage operations
- Minimal re-renders on state changes

#### API Calls
- Debounced authentication requests
- Cached user data
- Optimistic updates for better UX

#### Memory Management
- Cleanup on unmount
- Clear sensitive data on logout
- Efficient state updates

### Performance Characteristics

- **Initialization**: ~50ms (localStorage read + token validation)
- **Login**: ~200-500ms (API call + state updates)
- **Token Refresh**: ~100-300ms (background refresh)
- **Logout**: ~10ms (state clearing)

## Accessibility

### Keyboard Navigation
- Focus management during login/logout
- Keyboard shortcuts for common actions
- Screen reader announcements

### Screen Reader Support
- ARIA labels for authentication forms
- Status announcements for state changes
- Error message announcements

### Color and Contrast
- High contrast error messages
- Clear visual feedback for states
- Accessible color schemes

## Testing

### Unit Tests

```typescript
describe('AuthContext', () => {
  test('should initialize with stored credentials', () => {
    // Test localStorage initialization
  });
  
  test('should handle successful login', async () => {
    // Test login flow
  });
  
  test('should handle login errors', async () => {
    // Test error scenarios
  });
  
  test('should refresh token before expiration', () => {
    // Test token refresh logic
  });
});
```

### Integration Tests

```typescript
describe('Authentication Flow', () => {
  test('should maintain session across page reloads', () => {
    // Test persistence
  });
  
  test('should handle token expiration gracefully', () => {
    // Test expiration handling
  });
});
```

### E2E Tests

```typescript
describe('User Authentication', () => {
  test('should allow user to login and access protected routes', () => {
    // Test complete login flow
  });
  
  test('should redirect to login on token expiration', () => {
    // Test expiration flow
  });
});
```

## Related Components/Features

### Dependencies
- **React Query**: For API call management
- **React Router**: For navigation after authentication
- **Toast Notifications**: For user feedback

### Related Components
- **SignInPage**: Uses signIn method
- **SignUpPage**: Uses signUp method
- **Navbar**: Displays user info and logout
- **Protected Routes**: Check isAuthenticated state

### Related Features
- **Role-based Access Control**: Uses user.role
- **Admin Panel**: Checks admin permissions
- **User Profile**: Displays user information
- **Premium Features**: Checks user permissions

## Security Considerations

### Token Security
- JWT tokens with expiration
- Secure token storage in localStorage
- Automatic token refresh
- Secure token transmission

### Password Security
- Server-side password hashing
- Secure password transmission
- Password strength requirements
- Account lockout protection

### Session Security
- Secure session management
- CSRF protection
- XSS prevention
- Secure logout process

## Troubleshooting

### Common Issues

#### Token Not Refreshing
- Check token expiration time
- Verify refresh endpoint
- Check network connectivity
- Review server logs

#### Login Not Working
- Verify API endpoint
- Check request format
- Validate credentials
- Review error messages

#### State Not Persisting
- Check localStorage availability
- Verify JSON serialization
- Check browser storage limits
- Review state update logic

### Debug Information

```typescript
// Enable debug logging
const DEBUG_AUTH = process.env.NODE_ENV === 'development';

if (DEBUG_AUTH) {
  console.log('Auth State:', { user, isAuthenticated, token });
}
```

## Migration Guide

### From Local State to Context
1. Replace local auth state with useAuth hook
2. Update component props to use context
3. Remove prop drilling for auth data
4. Update tests to use context

### From Custom Auth to AuthContext
1. Replace custom auth logic with context
2. Update API calls to use context methods
3. Migrate localStorage keys
4. Update error handling

## Future Enhancements

### Planned Features
- Multi-factor authentication
- Social login integration
- Remember me functionality
- Session timeout warnings
- Offline authentication support

### Performance Improvements
- Service worker for background refresh
- Optimistic authentication updates
- Reduced bundle size
- Better caching strategies 