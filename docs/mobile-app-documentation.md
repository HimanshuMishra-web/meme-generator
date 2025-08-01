# MemeForge Mobile App Documentation

## Overview
MemeForge Mobile is a React Native application that brings the full meme creation and community experience to iOS and Android devices. The app integrates seamlessly with the existing MemeForge backend while providing native mobile features and optimized user experience.

## 🚀 Tech Stack
- **Framework**: React Native 0.72+
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: Redux Toolkit + RTK Query
- **UI Library**: React Native Elements + NativeBase
- **Animations**: React Native Reanimated 3
- **Image Handling**: React Native Image Picker, React Native Image Editor
- **HTTP Client**: Axios with React Native Network Info
- **Push Notifications**: React Native Firebase (FCM)
- **Storage**: AsyncStorage + MMKV
- **Maps**: React Native Maps (if location features needed)
- **Camera**: React Native Camera/VisionCamera
- **File System**: React Native FS

## 📱 Platform Support
- **iOS**: 12.0+ (iPhone 6s and newer)
- **Android**: API Level 21+ (Android 5.0+)
- **Cross-platform**: 95%+ code sharing

## 🏗 Architecture Overview

### App Structure
```
MemeForge-Mobile/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Cross-platform components
│   │   ├── ios/             # iOS-specific components
│   │   └── android/         # Android-specific components
│   ├── screens/             # Application screens
│   │   ├── auth/            # Authentication screens
│   │   ├── create/          # Meme creation screens
│   │   ├── browse/          # Content browsing
│   │   ├── profile/         # User profile screens
│   │   └── admin/           # Admin panel (if applicable)
│   ├── navigation/          # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── store/               # Redux store configuration
│   │   ├── slices/          # Redux Toolkit slices
│   │   ├── api/             # RTK Query API endpoints
│   │   └── index.ts
│   ├── services/            # External services
│   │   ├── api.ts           # API client configuration
│   │   ├── camera.ts        # Camera utilities
│   │   ├── storage.ts       # Local storage
│   │   └── push.ts          # Push notifications
│   ├── utils/               # Utility functions
│   │   ├── image.ts         # Image processing
│   │   ├── permissions.ts   # Device permissions
│   │   └── validation.ts    # Form validation
│   ├── hooks/               # Custom React hooks
│   ├── constants/           # App constants
│   ├── types/               # TypeScript type definitions
│   └── assets/              # Static assets
├── android/                 # Android-specific code
├── ios/                     # iOS-specific code
├── __tests__/               # Test files
├── package.json
└── metro.config.js
```

## 🎯 Core Features

### 1. Authentication & Onboarding
- **Biometric Authentication**: Face ID, Touch ID, Fingerprint
- **Social Login**: Google, Apple, Facebook integration
- **Secure Token Storage**: Keychain (iOS) / Keystore (Android)
- **Onboarding Flow**: Interactive tutorial with animations

```typescript
interface AuthFeatures {
  biometricLogin: boolean;
  socialLogin: ('google' | 'apple' | 'facebook')[];
  rememberMe: boolean;
  autoLogin: boolean;
}
```

### 2. Meme Creation Studio
- **Camera Integration**: Direct photo capture with real-time filters
- **Gallery Access**: Import from device photo library
- **AI Generation**: Mobile-optimized prompt interface
- **Text Editor**: Touch-friendly text manipulation
- **Template Library**: Offline-cached popular templates

#### Mobile-Optimized Creation Flow
```
Camera/Gallery → Template Selection → Text Editor → Preview → Share/Save
```

#### Text Editor Features
- **Gesture Controls**: Pinch to resize, rotate, drag to position
- **Voice Input**: Speech-to-text for captions
- **Emoji Integration**: Native emoji picker
- **Font Library**: Downloadable font packs
- **Color Picker**: Native color selection with presets

### 3. Camera & Image Processing
```typescript
interface CameraFeatures {
  realTimeFilters: boolean;
  multipleCapture: boolean;
  flashControl: boolean;
  gridLines: boolean;
  aspectRatioLock: boolean;
}

interface ImageEditing {
  crop: boolean;
  rotate: boolean;
  flip: boolean;
  brightness: boolean;
  contrast: boolean;
  saturation: boolean;
}
```

### 4. Social & Community Features
- **Feed**: Infinite scroll with pull-to-refresh
- **Like System**: Double-tap to like, heart animations
- **Comments**: Native keyboard with emoji support
- **Sharing**: Native share sheet integration
- **Push Notifications**: Real-time engagement alerts

### 5. Offline Capabilities
- **Offline Creation**: Work without internet connection
- **Sync Queue**: Upload when connection restored
- **Cached Content**: Popular memes and templates
- **Background Sync**: Update content in background

## 🎨 UI/UX Design System

### Design Principles
- **Mobile-First**: Optimized for touch interactions
- **Platform Native**: iOS and Android design patterns
- **Accessibility**: VoiceOver/TalkBack support
- **Performance**: 60 FPS animations and smooth scrolling

### Color Palette
```typescript
const Colors = {
  primary: '#8B5CF6',    // Purple
  secondary: '#F59E0B',  // Yellow
  accent: '#EF4444',     // Red
  background: '#F9FAFB', // Light gray
  surface: '#FFFFFF',    // White
  text: '#111827',       // Dark gray
  textSecondary: '#6B7280', // Medium gray
};
```

### Typography Scale
- **Display**: 32px, Bold - Screen titles
- **Headline**: 24px, Semibold - Section headers
- **Title**: 20px, Medium - Card titles
- **Body**: 16px, Regular - Main content
- **Caption**: 14px, Regular - Helper text
- **Label**: 12px, Medium - Form labels

### Component Library
```typescript
// Core Components
- Button (Primary, Secondary, Ghost, Icon)
- Input (Text, Password, Search, TextArea)
- Card (Basic, Media, Interactive)
- Modal (Bottom Sheet, Overlay, Drawer)
- List (Flat, Section, Infinite)

// Meme-Specific Components
- MemeCanvas (Creation interface)
- TextOverlay (Draggable text editor)
- FilterPicker (Image filter selection)
- TemplateGrid (Template browser)
- ShareSheet (Native sharing)
```

## 📱 Screen Specifications

### 1. Authentication Screens
- **Splash Screen**: Animated logo with loading
- **Onboarding**: Swipeable introduction slides
- **Login**: Form with biometric option
- **Signup**: Multi-step registration
- **Forgot Password**: Email verification flow

### 2. Main Tab Navigation
```typescript
interface TabStructure {
  Home: FeedScreen;
  Create: CreateMemeScreen;
  Browse: BrowseMemeScreen;
  Profile: UserProfileScreen;
  More: SettingsMenuScreen;
}
```

### 3. Creation Flow Screens
- **Camera Screen**: Full-screen camera with controls
- **Gallery Picker**: Grid view of device photos
- **Template Browser**: Categorized template selection
- **Meme Editor**: Canvas with text tools
- **Preview Screen**: Final review before sharing
- **Share Options**: Platform selection and settings

### 4. Browse & Discovery
- **Feed Screen**: Vertical scroll of memes
- **Search Screen**: Search with filters
- **Category Browser**: Trending, Popular, Recent
- **User Profile**: Public profile view
- **Meme Detail**: Full-screen view with comments

## 🔧 Development Setup

### Prerequisites
```bash
# Required tools
Node.js 18+
React Native CLI
Xcode 14+ (for iOS)
Android Studio (for Android)
CocoaPods (for iOS dependencies)
```

### Installation
```bash
# Clone repository
git clone <repository-url>
cd memeforge-mobile

# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Android setup (automatic)
npx react-native run-android

# iOS setup
npx react-native run-ios
```

### Environment Configuration
```typescript
// config/environment.ts
interface Environment {
  API_BASE_URL: string;
  OPENAI_API_KEY: string;
  GOOGLE_SIGN_IN_KEY: string;
  FACEBOOK_APP_ID: string;
  FIREBASE_CONFIG: FirebaseConfig;
}

const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000/api',
    // ... other dev configs
  },
  production: {
    API_BASE_URL: 'https://api.memeforge.com/api',
    // ... other prod configs
  }
};
```

## 🔌 Backend Integration

### API Client Setup
```typescript
// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 10000,
});

// Request interceptor for auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      NavigationService.navigate('Login');
    }
    return Promise.reject(error);
  }
);
```

### RTK Query API Slices
```typescript
// store/api/memesApi.ts
export const memesApi = createApi({
  reducerPath: 'memesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/memes',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Meme', 'User'],
  endpoints: (builder) => ({
    getMemes: builder.query<Meme[], void>({
      query: () => '',
      providesTags: ['Meme'],
    }),
    createMeme: builder.mutation<Meme, CreateMemeData>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Meme'],
    }),
    likeMeme: builder.mutation<void, string>({
      query: (memeId) => ({
        url: `/${memeId}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Meme'],
    }),
  }),
});
```

## 📸 Camera & Media Features

### Camera Implementation
```typescript
// components/CameraScreen.tsx
import { Camera, useCameraDevices } from 'react-native-vision-camera';

const CameraScreen: React.FC = () => {
  const devices = useCameraDevices();
  const device = devices.back;

  const takePhoto = useCallback(async () => {
    if (camera.current) {
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'balanced',
        flash: flashMode,
      });
      
      // Process and save photo
      const processedPhoto = await processImage(photo.path);
      navigation.navigate('MemeEditor', { imageUri: processedPhoto });
    }
  }, [flashMode]);

  return (
    <Camera
      ref={camera}
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      photo={true}
    />
  );
};
```

### Image Processing Pipeline
```typescript
// utils/imageProcessing.ts
interface ImageProcessingOptions {
  resize?: { width: number; height: number };
  quality?: number;
  format?: 'JPEG' | 'PNG';
  crop?: { x: number; y: number; width: number; height: number };
}

export const processImage = async (
  imageUri: string,
  options: ImageProcessingOptions = {}
): Promise<string> => {
  const processed = await ImageEditor.cropImage(imageUri, {
    offset: { x: 0, y: 0 },
    size: { width: 1080, height: 1080 },
    displaySize: { width: 1080, height: 1080 },
    resizeMode: 'contain',
  });

  return processed.uri;
};
```

## 🔔 Push Notifications

### Firebase Setup
```typescript
// services/pushNotifications.ts
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

class PushNotificationService {
  async requestPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
  }

  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  setupBackgroundHandler() {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message:', remoteMessage);
      // Handle background notification
    });
  }

  setupForegroundHandler() {
    return messaging().onMessage(async (remoteMessage) => {
      // Show local notification when app is in foreground
      PushNotification.localNotification({
        title: remoteMessage.notification?.title,
        message: remoteMessage.notification?.body || '',
      });
    });
  }
}
```

### Notification Types
```typescript
interface NotificationPayload {
  type: 'like' | 'comment' | 'follow' | 'feature' | 'admin';
  data: {
    memeId?: string;
    userId?: string;
    message: string;
  };
}
```

## 💾 Local Storage & Caching

### Storage Strategy
```typescript
// services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';

// Secure storage for sensitive data
const secureStorage = new MMKV({
  id: 'secure-storage',
  encryptionKey: 'user-specific-key',
});

// Regular storage for app data
const storage = new MMKV({
  id: 'app-storage',
});

export const StorageService = {
  // Auth token management
  async setAuthToken(token: string): Promise<void> {
    secureStorage.set('authToken', token);
  },

  async getAuthToken(): Promise<string | null> {
    return secureStorage.getString('authToken') || null;
  },

  // User preferences
  setUserPreference(key: string, value: any): void {
    storage.set(key, JSON.stringify(value));
  },

  getUserPreference<T>(key: string, defaultValue: T): T {
    const stored = storage.getString(key);
    return stored ? JSON.parse(stored) : defaultValue;
  },

  // Cache management
  setCachedMemes(memes: Meme[]): void {
    storage.set('cachedMemes', JSON.stringify(memes));
  },

  getCachedMemes(): Meme[] {
    const cached = storage.getString('cachedMemes');
    return cached ? JSON.parse(cached) : [];
  },
};
```

## ⚡ Performance Optimization

### Image Optimization
```typescript
// utils/imageOptimization.ts
interface ImageOptimizationConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'JPEG' | 'PNG' | 'WEBP';
}

const optimizeForDevice = (image: string): ImageOptimizationConfig => {
  const { width, height } = Dimensions.get('screen');
  const scale = PixelRatio.get();
  
  return {
    maxWidth: width * scale,
    maxHeight: height * scale,
    quality: 0.8,
    format: 'JPEG',
  };
};
```

### Memory Management
```typescript
// hooks/useImageCache.ts
const useImageCache = () => {
  const [cache, setCache] = useState<Map<string, string>>(new Map());
  
  const cacheImage = useCallback(async (uri: string) => {
    if (cache.has(uri)) return cache.get(uri);
    
    try {
      const cachedUri = await downloadAndCacheImage(uri);
      setCache(prev => new Map(prev).set(uri, cachedUri));
      return cachedUri;
    } catch (error) {
      console.error('Image caching failed:', error);
      return uri;
    }
  }, [cache]);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return { cacheImage, clearCache };
};
```

### List Performance
```typescript
// components/MemeList.tsx
const MemeList: React.FC<Props> = ({ memes }) => {
  const renderMeme = useCallback(({ item }: { item: Meme }) => (
    <MemeCard meme={item} />
  ), []);

  const keyExtractor = useCallback((item: Meme) => item.id, []);

  return (
    <FlatList
      data={memes}
      renderItem={renderMeme}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      updateCellsBatchingPeriod={100}
      windowSize={10}
      initialNumToRender={10}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );
};
```

## 🔒 Security Implementation

### Authentication Security
```typescript
// services/authSecurity.ts
import TouchID from 'react-native-touch-id';
import Keychain from 'react-native-keychain';

export const BiometricAuth = {
  async isSupported(): Promise<boolean> {
    try {
      const biometryType = await TouchID.isSupported();
      return biometryType !== false;
    } catch (error) {
      return false;
    }
  },

  async authenticate(): Promise<boolean> {
    try {
      await TouchID.authenticate('Use biometric to access MemeForge');
      return true;
    } catch (error) {
      return false;
    }
  },

  async storeCredentials(username: string, password: string): Promise<void> {
    await Keychain.setInternetCredentials(
      'MemeForge',
      username,
      password
    );
  },

  async getCredentials(): Promise<{ username: string; password: string } | null> {
    try {
      const credentials = await Keychain.getInternetCredentials('MemeForge');
      if (credentials) {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  },
};
```

### API Security
```typescript
// utils/security.ts
import CryptoJS from 'crypto-js';

export const SecurityUtils = {
  encryptSensitiveData(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  },

  decryptSensitiveData(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  },

  generateRequestSignature(data: any, secret: string): string {
    const sortedData = JSON.stringify(data, Object.keys(data).sort());
    return CryptoJS.HmacSHA256(sortedData, secret).toString();
  },
};
```

## 🧪 Testing Strategy

### Unit Testing Setup
```typescript
// __tests__/components/MemeCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../../../src/store';
import MemeCard from '../../../src/components/MemeCard';

describe('MemeCard', () => {
  const mockMeme = {
    id: '1',
    title: 'Test Meme',
    imageUrl: 'https://example.com/meme.jpg',
    likes: 10,
    author: 'TestUser',
  };

  it('renders correctly', () => {
    const { getByText } = render(
      <Provider store={store}>
        <MemeCard meme={mockMeme} />
      </Provider>
    );

    expect(getByText('Test Meme')).toBeTruthy();
    expect(getByText('TestUser')).toBeTruthy();
  });

  it('handles like button press', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <MemeCard meme={mockMeme} />
      </Provider>
    );

    const likeButton = getByTestId('like-button');
    fireEvent.press(likeButton);
    
    // Assert like action was dispatched
  });
});
```

### E2E Testing
```typescript
// e2e/memeCreation.e2e.ts
import { device, expect, element, by } from 'detox';

describe('Meme Creation Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should create a meme successfully', async () => {
    // Navigate to create screen
    await element(by.id('create-tab')).tap();
    
    // Take photo or select from gallery
    await element(by.id('camera-button')).tap();
    await element(by.id('capture-button')).tap();
    
    // Add text
    await element(by.id('add-text-button')).tap();
    await element(by.id('text-input')).typeText('Test Meme Text');
    
    // Save meme
    await element(by.id('save-button')).tap();
    
    // Verify meme was created
    await expect(element(by.text('Meme saved successfully!'))).toBeVisible();
  });
});
```

## 🚀 Deployment Strategy

### Build Configuration
```typescript
// metro.config.js
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
    },
  };
})();
```

### iOS Deployment
```bash
# Build for TestFlight
npx react-native run-ios --configuration Release

# Archive for App Store
xcodebuild -workspace ios/MemeForge.xcworkspace \
           -scheme MemeForge \
           -configuration Release \
           -archivePath build/MemeForge.xcarchive \
           archive
```

### Android Deployment
```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Generate App Bundle (recommended)
./gradlew bundleRelease
```

### CI/CD Pipeline
```yaml
# .github/workflows/mobile-ci.yml
name: Mobile CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run lint

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: cd ios && pod install
      - run: npx react-native run-ios --configuration Release

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '11'
      - run: npm install
      - run: cd android && ./gradlew assembleRelease
```

## 📊 Analytics & Monitoring

### Analytics Implementation
```typescript
// services/analytics.ts
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

export const Analytics = {
  async logEvent(eventName: string, parameters?: { [key: string]: any }) {
    await analytics().logEvent(eventName, parameters);
  },

  async logScreenView(screenName: string) {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  },

  async setUserProperties(properties: { [key: string]: string }) {
    await analytics().setUserProperties(properties);
  },

  async logError(error: Error, context?: string) {
    crashlytics().recordError(error);
    if (context) {
      crashlytics().log(context);
    }
  },
};

// Usage in components
const MemeCreationScreen = () => {
  useEffect(() => {
    Analytics.logScreenView('MemeCreation');
  }, []);

  const handleMemeCreate = async () => {
    try {
      // Create meme logic
      Analytics.logEvent('meme_created', {
        creation_method: 'camera',
        has_text: true,
      });
    } catch (error) {
      Analytics.logError(error, 'Meme creation failed');
    }
  };
};
```

## 🔄 Offline Support

### Offline Strategy
```typescript
// services/offlineManager.ts
import NetInfo from '@react-native-netinfo';
import { store } from '../store';

class OfflineManager {
  private isOnline = true;
  private syncQueue: any[] = [];

  constructor() {
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected || false;

      if (wasOffline && this.isOnline) {
        this.syncPendingActions();
      }

      store.dispatch(setNetworkStatus(this.isOnline));
    });
  }

  queueAction(action: any) {
    if (!this.isOnline) {
      this.syncQueue.push(action);
      return false;
    }
    return true;
  }

  private async syncPendingActions() {
    while (this.syncQueue.length > 0) {
      const action = this.syncQueue.shift();
      try {
        await this.executeAction(action);
      } catch (error) {
        console.error('Sync failed for action:', action, error);
        // Optionally re-queue the action
      }
    }
  }

  private async executeAction(action: any) {
    // Execute the queued action
    switch (action.type) {
      case 'CREATE_MEME':
        await store.dispatch(createMeme(action.payload));
        break;
      case 'LIKE_MEME':
        await store.dispatch(likeMeme(action.payload));
        break;
      // Handle other actions
    }
  }
}

export const offlineManager = new OfflineManager();
```

## 🌐 Internationalization (i18n)

### Multi-language Support
```typescript
// localization/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: (callback: (lng: string) => void) => {
    const bestLanguage = RNLocalize.findBestAvailableLanguage(
      Object.keys(resources)
    );
    callback(bestLanguage?.languageTag || 'en');
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

## 📱 Platform-Specific Features

### iOS Features
- **3D Touch**: Quick actions for meme creation
- **Spotlight Search**: Search memes from iOS search
- **Siri Shortcuts**: Voice commands for quick actions
- **Live Photos**: Support for Live Photo memes
- **App Clips**: Lightweight version for sharing

### Android Features
- **Adaptive Icons**: Dynamic icon theming
- **Shortcuts**: Home screen shortcuts
- **Picture-in-Picture**: Continue browsing while creating
- **Android Auto**: Voice integration for hands-free use
- **Instant Apps**: Lightweight sharing experience

## 🔧 Maintenance & Updates

### Over-the-Air Updates
```typescript
// Using CodePush for React Native
import codePush from 'react-native-code-push';

const App = () => {
  useEffect(() => {
    codePush.sync({
      updateDialog: true,
      installMode: codePush.InstallMode.IMMEDIATE,
    });
  }, []);

  return <AppNavigator />;
};

export default codePush(App);
```

### Performance Monitoring
```typescript
// services/performance.ts
import perf from '@react-native-firebase/perf';

export const PerformanceMonitoring = {
  async startTrace(traceName: string) {
    const trace = perf().newTrace(traceName);
    await trace.start();
    return trace;
  },

  async stopTrace(trace: any) {
    await trace.stop();
  },

  async measureApiCall(apiCall: () => Promise<any>, traceName: string) {
    const trace = await this.startTrace(traceName);
    try {
      const result = await apiCall();
      return result;
    } finally {
      await this.stopTrace(trace);
    }
  },
};
```

This comprehensive React Native mobile app documentation provides a complete roadmap for developing a native mobile companion to your MemeForge platform. The app will offer a premium mobile experience while leveraging your existing backend infrastructure and maintaining brand consistency across all platforms. 