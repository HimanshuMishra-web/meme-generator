# MemeGeneratorPage Component Documentation

## Overview

The `MemeGeneratorPage` is the core component of the MemeForge application that enables users to create memes through two primary methods: template-based creation and AI-powered generation. The component provides a comprehensive interface for image upload, text overlay positioning, styling customization, and meme generation using advanced AI models.

The component supports both traditional meme creation workflows (upload image + add text) and modern AI-powered generation (text prompt → AI image → customization). It includes real-time preview rendering, drag-and-drop functionality, and seamless integration with the backend API for saving and sharing memes.

## Usage

### Basic Usage

```typescript
import MemeGeneratorPage from '../Pages/MemeGeneratorPage';

// The component is typically accessed via routing
<Route path="/create" element={<MemeGeneratorPage />} />
```

### With Template Pre-selection

```typescript
// Navigate with template parameter
navigate('/create?template=https://example.com/template.jpg');
```

## API / Props / Parameters

### Component Props

The component doesn't accept any props as it's a page-level component, but it can receive URL parameters:

```typescript
// URL Parameters
interface URLParams {
  template?: string; // Pre-selected template URL
}
```

### Internal State Interface

```typescript
interface MemeGeneratorState {
  // Image handling
  image: string | null;
  previewUrl: string | null;
  
  // Text overlays
  memeTexts: MemeText[];
  selectedTextId: number | null;
  draggedId: number | null;
  offset: { x: number; y: number };
  
  // AI generation
  aiPrompt: string;
  aiStyle: ImageStyle;
  aiModel: ModelType;
  isGenerating: boolean;
  aiImageMeta: any;
  
  // UI state
  activeTab: 'Upload / Template' | 'AI Generator';
  showSaveDialog: boolean;
  isSaving: boolean;
  
  // Interaction state
  resizeState: ResizeState | null;
  rotateState: RotateState | null;
}
```

### MemeText Interface

```typescript
interface MemeText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  font: string;
  fontSize: number;
  width: number;
  height: number;
  rotation: number;
}
```

### AI Generation Types

```typescript
const imageStyles = ['realistic', 'anime', 'cartoon', 'storybook', 'pixel', 'cyberpunk'] as const;
type ImageStyle = typeof imageStyles[number];

const modelOptions = ['dall-e-3', 'stable-diffusion', 'midjourney'] as const;
type ModelType = typeof modelOptions[number];
```

## Component Hierarchy

```
MemeGeneratorPage
├── PageLayout
│   ├── Tabs (Upload/Template | AI Generator)
│   ├── Image Upload Area
│   ├── Text Customization Panel
│   ├── AI Generation Panel
│   ├── Preview Area
│   │   └── MemeTextOverlay[] (for each text element)
│   └── Action Buttons (Save, Download, Share)
└── SaveMemeDialog (modal)
```

## State Management

### State Initialization

```typescript
// Core state
const [image, setImage] = useState<string | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [memeTexts, setMemeTexts] = useState<MemeText[]>([]);
const [selectedTextId, setSelectedTextId] = useState<number | null>(null);

// AI generation state
const [aiPrompt, setAiPrompt] = useState('');
const [aiStyle, setAiStyle] = useState<ImageStyle>('pixel');
const [aiModel, setAiModel] = useState<ModelType>('dall-e-3');
const [isGenerating, setIsGenerating] = useState(false);

// UI state
const [activeTab, setActiveTab] = useState<'Upload / Template' | 'AI Generator'>('Upload / Template');
const [showSaveDialog, setShowSaveDialog] = useState(false);
```

### State Flow Patterns

1. **Image Upload Flow**:
   ```
   File Selection → URL.createObjectURL() → setImage() → setPreviewUrl()
   ```

2. **Text Addition Flow**:
   ```
   Add Text Button → createMemeText() → setMemeTexts([...memeTexts, newText])
   ```

3. **AI Generation Flow**:
   ```
   Submit Prompt → setIsGenerating(true) → API Call → setImage() → setIsGenerating(false)
   ```

4. **Save Flow**:
   ```
   Save Button → renderToCanvas() → API Call → setShowSaveDialog(false)
   ```

## Behavior

### User Interaction Flows

#### Template-Based Creation Flow

1. **Image Selection**:
   - Upload image via file input
   - Drag and drop image onto upload area
   - Select from template gallery
   - URL parameter pre-selection

2. **Text Addition**:
   - Click "Add Text" button
   - Text appears in center of image
   - Click to select and edit text
   - Drag to reposition text

3. **Text Customization**:
   - Select text to show customization panel
   - Change font, color, size
   - Resize text using handles
   - Rotate text using rotation handle

4. **Finalization**:
   - Preview final result
   - Save to collection
   - Download as image
   - Share to social media

#### AI-Powered Generation Flow

1. **Prompt Entry**:
   - Enter descriptive text prompt
   - Select image style (realistic, anime, etc.)
   - Choose AI model (DALL-E 3, Stable Diffusion, etc.)

2. **Generation**:
   - Click "Generate" button
   - Show loading animation
   - Display generated image
   - Allow further customization

3. **Customization**:
   - Add text overlays to AI-generated image
   - Apply same text customization features
   - Save or regenerate if needed

### Interaction States

#### Text Element States

- **Normal**: Display text with hover effects
- **Selected**: Show resize/rotate handles, highlight border
- **Editing**: Textarea for direct text editing
- **Dragging**: Visual feedback during movement
- **Resizing**: Show resize handles, constrain proportions
- **Rotating**: Show rotation handle, visual rotation feedback

#### Image States

- **Empty**: Show upload area with instructions
- **Loading**: Show loading animation during AI generation
- **Loaded**: Display image with text overlays
- **Error**: Show error message with retry option

### Error Handling

#### File Upload Errors
- Invalid file type (only images allowed)
- File size too large (max 10MB)
- Network upload failure
- Corrupted image file

#### AI Generation Errors
- Invalid prompt (empty or inappropriate)
- API rate limiting
- Model availability issues
- Generation timeout

#### Save Errors
- Network connectivity issues
- Authentication required
- Storage quota exceeded
- Invalid image format

## Error Handling

### Error Types and Recovery

#### File Upload Errors

```typescript
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.error('Please select a valid image file');
    return;
  }
  
  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    toast.error('File size must be less than 10MB');
    return;
  }
  
  try {
    const url = URL.createObjectURL(file);
    setImage(url);
    setPreviewUrl(url);
  } catch (error) {
    toast.error('Failed to load image. Please try again.');
  }
};
```

#### AI Generation Errors

```typescript
const handleGenerateWithAI = async () => {
  if (!aiPrompt.trim()) {
    toast.error('Please enter a description for your meme');
    return;
  }
  
  setIsGenerating(true);
  try {
    const response = await apiService.post('/images/generate', {
      prompt: aiPrompt,
      style: aiStyle,
      model: aiModel
    });
    
    setImage(response.data.imageUrl);
    setAiImageMeta(response.data.meta);
  } catch (error) {
    if (error.response?.status === 429) {
      toast.error('Rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 400) {
      toast.error('Invalid prompt. Please try a different description.');
    } else {
      toast.error('Generation failed. Please try again.');
    }
  } finally {
    setIsGenerating(false);
  }
};
```

#### Save Errors

```typescript
const handleSaveToCollection = async (saveData: SaveMemeData) => {
  setIsSaving(true);
  try {
    const canvas = await renderToCanvas();
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
    
    const formData = new FormData();
    formData.append('image', blob, 'meme.png');
    formData.append('title', saveData.title);
    formData.append('description', saveData.description);
    formData.append('isPublic', saveData.isPublic.toString());
    
    await apiService.post('/memes', formData);
    toast.success('Meme saved successfully!');
    setShowSaveDialog(false);
  } catch (error) {
    if (error.response?.status === 401) {
      toast.error('Please sign in to save memes');
    } else {
      toast.error('Failed to save meme. Please try again.');
    }
  } finally {
    setIsSaving(false);
  }
};
```

### Error Recovery Strategies

#### Automatic Recovery
- Retry failed API calls with exponential backoff
- Clear invalid state and reset to safe defaults
- Preserve user input during retry attempts

#### Manual Recovery
- Provide clear error messages with actionable steps
- Allow users to retry failed operations
- Offer alternative approaches (e.g., different AI model)

## Performance Considerations

### Optimization Strategies

#### Image Processing
- Use canvas for high-quality rendering
- Optimize image loading with lazy loading
- Compress images before upload
- Cache generated images

#### Text Rendering
- Debounce text input changes
- Use efficient text measurement
- Optimize drag-and-drop performance
- Minimize re-renders during interactions

#### AI Generation
- Show loading states immediately
- Cache successful generations
- Implement request cancellation
- Use optimistic updates

### Performance Characteristics

- **Image Upload**: ~100-500ms (depending on file size)
- **Text Addition**: ~10ms (instant)
- **AI Generation**: ~5-30 seconds (model dependent)
- **Canvas Rendering**: ~50-200ms (image size dependent)
- **Save Operation**: ~200-1000ms (network dependent)

### Memory Management

```typescript
// Cleanup object URLs to prevent memory leaks
useEffect(() => {
  return () => {
    if (image && image.startsWith('blob:')) {
      URL.revokeObjectURL(image);
    }
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
  };
}, [image, previewUrl]);
```

## Accessibility

### Keyboard Navigation
- Tab navigation through all interactive elements
- Enter/Space to activate buttons
- Arrow keys for text positioning
- Escape to cancel operations

### Screen Reader Support
- ARIA labels for all interactive elements
- Status announcements for state changes
- Descriptive alt text for images
- Error message announcements

### Visual Accessibility
- High contrast text overlays
- Clear focus indicators
- Sufficient color contrast
- Scalable interface elements

### Motor Accessibility
- Large click targets
- Drag-and-drop alternatives
- Keyboard shortcuts
- Voice control support

## Testing

### Unit Tests

```typescript
describe('MemeGeneratorPage', () => {
  test('should handle image upload', () => {
    // Test file upload functionality
  });
  
  test('should add text overlays', () => {
    // Test text addition and positioning
  });
  
  test('should handle AI generation', async () => {
    // Test AI generation flow
  });
  
  test('should save meme to collection', async () => {
    // Test save functionality
  });
});
```

### Integration Tests

```typescript
describe('Meme Creation Flow', () => {
  test('should create meme from template', () => {
    // Test complete template-based flow
  });
  
  test('should create meme with AI generation', () => {
    // Test complete AI-based flow
  });
  
  test('should handle drag and drop interactions', () => {
    // Test text positioning
  });
});
```

### E2E Tests

```typescript
describe('Meme Generator E2E', () => {
  test('should create and save a meme', () => {
    // Test complete user journey
  });
  
  test('should handle errors gracefully', () => {
    // Test error scenarios
  });
});
```

## Related Components/Features

### Dependencies
- **MemeTextOverlay**: Individual text element component
- **SaveMemeDialog**: Save dialog modal
- **Tabs**: Tab navigation component
- **PageLayout**: Page layout wrapper

### Related Services
- **apiService**: Backend API integration
- **ImageGeneratorService**: AI image generation
- **FileUploadService**: File handling utilities

### Related Features
- **User Authentication**: Required for saving memes
- **Premium Features**: Advanced AI models
- **Social Sharing**: Share generated memes
- **Template Gallery**: Pre-made templates

## Security Considerations

### File Upload Security
- File type validation
- File size limits
- Malware scanning
- Secure file storage

### AI Generation Security
- Prompt filtering for inappropriate content
- Rate limiting to prevent abuse
- Content moderation
- Usage tracking

### Data Privacy
- Secure transmission of user data
- Local processing when possible
- Clear data usage policies
- User consent for AI generation

## Troubleshooting

### Common Issues

#### Text Not Appearing
- Check if text is positioned off-screen
- Verify text color contrast
- Ensure font is loaded
- Check z-index layering

#### AI Generation Fails
- Verify internet connectivity
- Check API rate limits
- Validate prompt content
- Try different AI model

#### Save Operation Fails
- Check authentication status
- Verify network connectivity
- Check file size limits
- Ensure proper image format

### Debug Information

```typescript
// Enable debug logging
const DEBUG_MEME_GENERATOR = process.env.NODE_ENV === 'development';

if (DEBUG_MEME_GENERATOR) {
  console.log('Meme Generator State:', {
    image: !!image,
    textCount: memeTexts.length,
    selectedText: selectedTextId,
    isGenerating,
    activeTab
  });
}
```

## Future Enhancements

### Planned Features
- Advanced text effects (outline, shadow, gradient)
- Video meme support
- Collaborative meme creation
- Template marketplace
- Advanced AI models

### Performance Improvements
- WebGL rendering for complex effects
- Service worker for offline support
- Progressive image loading
- Better caching strategies

### User Experience
- Undo/redo functionality
- Auto-save drafts
- Keyboard shortcuts
- Touch gesture support 