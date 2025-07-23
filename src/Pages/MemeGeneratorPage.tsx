import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Tabs from '../components/Tabs';
import PageLayout from '../components/PageLayout';
import { colors, fonts } from '../data/constants';
import { apiService } from '../services/axiosInstance';
import Lottie from "lottie-react";
import loaderLottie from "../assets/loader-lottie.json";
import { API_URL, ASSETS_URL } from '../../constants';
import MemeTextOverlay from '../components/MemeTextOverlay';
import { useAuth } from '../components/AuthContext';
import { toast } from 'react-hot-toast';

// Add MemeText type
interface MemeText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  font: string;
  fontSize: number;
  width: number; // new
  height: number; // new
  rotation: number; // new
}

// Add ImageStyle type
const imageStyles = ['realistic', 'anime', 'cartoon', 'storybook', 'pixel', 'cyberpunk'] as const;
type ImageStyle = typeof imageStyles[number];

// Add model options
const modelOptions = ['dall-e-3', 'stable-diffusion', 'midjourney'] as const;
type ModelType = typeof modelOptions[number];

export default function MemeGeneratorPage() {
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [font, setFont] = useState(fonts[0]);
  const [color, setColor] = useState(colors[0]);
  const [fontSize, setFontSize] = useState(32);
  const [aiPrompt, setAiPrompt] = useState('');
  const [watermark, setWatermark] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Add tab state
  const [activeTab, setActiveTab] = useState<'Upload / Template' | 'AI Generator'>('Upload / Template');

  // Draggable meme texts state
  const [memeTexts, setMemeTexts] = useState<MemeText[]>([]);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // Add canvas ref
  const [selectedTextId, setSelectedTextId] = useState<number | null>(null);
  const [aiStyle, setAiStyle] = useState<ImageStyle>('pixel');
  const [aiModel, setAiModel] = useState<ModelType>('dall-e-3');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiImageMeta, setAiImageMeta] = useState<any>(null); // for new response

  // --- Resize/Rotate State ---
  const [resizeState, setResizeState] = useState<null | { id: number; startX: number; startY: number; startWidth: number; startHeight: number; direction: 'right' | 'bottom' | 'corner'; }> (null);
  const [rotateState, setRotateState] = useState<null | { id: number; centerX: number; centerY: number; startAngle: number; startRotation: number; }> (null);

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const template = params.get('template');
    if (template) {
      setImage(template);
      setPreviewUrl(template);
    }
  }, [location.search]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setPreviewUrl(url);
    }
  };

  // Add new text overlay
  const handleAddText = () => {
    setMemeTexts([
      ...memeTexts,
      {
        id: Date.now(),
        text: 'New Text',
        x: 100,
        y: 100,
        color: color,
        font: font,
        fontSize: fontSize,
        width: 200, // default width
        height: 40, // default height
        rotation: 0, // default rotation
      },
    ]);
  };

  // Update text content
  const handleTextChange = (id: number, newText: string) => {
    setMemeTexts(memeTexts.map(t => t.id === id ? { ...t, text: newText } : t));
  };

  // Update text color
  const handleTextColorChange = (id: number, newColor: string) => {
    setMemeTexts(memeTexts.map(t => t.id === id ? { ...t, color: newColor } : t));
  };

  // Update text font
  const handleTextFontChange = (id: number, newFont: string) => {
    setMemeTexts(memeTexts.map(t => t.id === id ? { ...t, font: newFont } : t));
  };

  // Update text font size
  const handleTextFontSizeChange = (id: number, newSize: number) => {
    setMemeTexts(memeTexts.map(t => t.id === id ? { ...t, fontSize: newSize } : t));
  };

  // Remove text overlay
  const handleRemoveText = (id: number) => {
    setMemeTexts(memeTexts.filter(t => t.id !== id));
  };

  // Mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent, id: number) => {
    setDraggedId(id);
    const text = memeTexts.find(t => t.id === id);
    if (text && previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      setOffset({
        x: e.clientX - rect.left - text.x,
        y: e.clientY - rect.top - text.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedId !== null && previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - offset.x;
      const y = e.clientY - rect.top - offset.y;
      setMemeTexts(memeTexts.map(t => t.id === draggedId ? { ...t, x, y } : t));
    }
  };

  const handleMouseUp = () => {
    setDraggedId(null);
  };

  // Mouse events for resizing
  const handleResizeMouseDown = (e: React.MouseEvent, id: number, direction: 'right' | 'bottom' | 'corner') => {
    e.stopPropagation();
    const text = memeTexts.find(t => t.id === id);
    if (!text) return;
    setResizeState({
      id,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: text.width,
      startHeight: text.height,
      direction,
    });
  };

  // Mouse events for rotating
  const handleRotateMouseDown = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const text = memeTexts.find(t => t.id === id);
    if (!text || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const centerX = rect.left + text.x + text.width / 2;
    const centerY = rect.top + text.y + text.height / 2;
    setRotateState({
      id,
      centerX,
      centerY,
      startAngle: Math.atan2(e.clientY - centerY, e.clientX - centerX),
      startRotation: text.rotation,
    });
  };

  // Mouse move for resize/rotate
  useEffect(() => {
    const handleMouseMoveDoc = (e: MouseEvent) => {
      if (resizeState) {
        setMemeTexts(memeTexts => memeTexts.map(t => {
          if (t.id !== resizeState.id) return t;
          let newWidth = t.width;
          let newHeight = t.height;
          if (resizeState.direction === 'right' || resizeState.direction === 'corner') {
            newWidth = Math.max(40, resizeState.startWidth + (e.clientX - resizeState.startX));
          }
          if (resizeState.direction === 'bottom' || resizeState.direction === 'corner') {
            newHeight = Math.max(20, resizeState.startHeight + (e.clientY - resizeState.startY));
          }
          return { ...t, width: newWidth, height: newHeight };
        }));
      } else if (rotateState) {
        const { id, centerX, centerY, startAngle, startRotation } = rotateState;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const deg = ((angle - startAngle) * 180) / Math.PI;
        setMemeTexts(memeTexts => memeTexts.map(t => t.id === id ? { ...t, rotation: startRotation + deg } : t));
      }
    };
    const handleMouseUpDoc = () => {
      setResizeState(null);
      setRotateState(null);
    };
    if (resizeState || rotateState) {
      document.addEventListener('mousemove', handleMouseMoveDoc);
      document.addEventListener('mouseup', handleMouseUpDoc);
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveDoc);
        document.removeEventListener('mouseup', handleMouseUpDoc);
      };
    }
  }, [resizeState, rotateState]);

  // Add this function for AI meme generation
  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Prompt is required');
      return;
    }
    setIsGenerating(true);
    setAiImageMeta(null);
    try {
      const response = await apiService.post<{ image: any }>(
        '/images/generate',
        { prompt: aiPrompt, style: aiStyle, model: aiModel }
      );
      // Use the new response format
      setImage(response.image.url);
      setPreviewUrl(response.image.url);
      setAiImageMeta(response.image);
    } catch (error: any) {
      let message = error.response?.data?.error || error.response?.data?.message || error.message;
      if (typeof message === 'object') {
        message = JSON.stringify(message);
      }
      toast.error('Error generating meme: ' + message);
    } finally {
      setIsGenerating(false);
    }
  };

  const { isAuthenticated, user } = useAuth();

  // Render meme (image + overlays) to canvas
  const renderToCanvas = async () => {
    if (!image || !canvasRef.current || !previewRef.current) return null;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    // Get preview size
    const previewRect = previewRef.current.getBoundingClientRect();
    canvas.width = previewRect.width;
    canvas.height = previewRect.height;
    // Draw base image
    let img = new window.Image();
    img.crossOrigin = 'anonymous';
    // Handle local blob/data URLs and remote URLs
    img.src = image && (/^(blob:|data:)/.test(image) ? image : (!/^https?:\/\//.test(image) ? `${ASSETS_URL.replace(/\/$/, '')}/${image.replace(/^\//, '')}` : image));
    await new Promise(resolve => { img.onload = resolve; });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // Draw overlays
    memeTexts.forEach(t => {
      ctx.save();
      ctx.translate(t.x + t.width / 2, t.y + t.height / 2);
      ctx.rotate((t.rotation * Math.PI) / 180);
      ctx.font = `${t.fontSize}px ${t.font}`;
      ctx.fillStyle = t.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Multi-line support
      const lines = t.text.split('\n');
      const lineHeight = t.fontSize * 1.2;
      lines.forEach((line, i) => {
        ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * lineHeight);
      });
      ctx.restore();
    });
    return canvas;
  };

  // Save to collection handler (canvas)
  const handleSaveToCollection = async () => {
    const canvas = await renderToCanvas();
    if (!canvas) return;
    canvas.toBlob(async blob => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('image', blob, 'meme.png');
      // Optionally add metadata (e.g., overlays, prompt, style, etc.)
      formData.append('overlays', JSON.stringify(memeTexts));
      if (aiImageMeta?.prompt) formData.append('prompt', aiImageMeta.prompt);
      if (aiImageMeta?.style) formData.append('style', aiImageMeta.style);
      if (aiImageMeta?.modelUsed) formData.append('modelUsed', aiImageMeta.modelUsed);
      try {
        await apiService.post('/images/save-to-collection', formData);
        toast.success('Saved to your collection!');
      } catch (err: any) {
        toast.error(err?.response?.data?.error || err.message || 'Failed to save');
      }
    }, 'image/png');
  };

  // Download handler (canvas)
  const handleDownload = async () => {
    const canvas = await renderToCanvas();
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meme.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Social share handler (canvas)
  const handleShare = async (platform: string) => {
    const canvas = await renderToCanvas();
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    // For now, upload to backend or use Web Share API if available
    if (navigator.share) {
      canvas.toBlob(blob => {
        if (!blob) return;
        const file = new File([blob], 'meme.png', { type: 'image/png' });
        navigator.share({
          files: [file],
          title: 'Check out this meme I made!',
          text: 'Check out this meme I made!'
        });
      }, 'image/png');
    } else {
      // Fallback: open image in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-400/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-pink-400/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-blue-400/30 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white text-sm font-medium mb-6">
              🎨 Creative Studio
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
              Meme <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Creation</span> Studio
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Unleash your creativity! Upload images, generate with AI, add text overlays, and create viral memes that will make the internet laugh! 
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Enhanced Tabs */}
        <div className="mb-12">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-2">
              <div className="flex">
                {['Upload / Template', 'AI Generator'].map((tab) => (
                  <button
                    key={tab}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                      activeTab === tab 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab(tab as any)}
                  >
                    {tab === 'Upload / Template' ? '📁 Upload / Template' : '🤖 AI Generator'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Panel - Creation Tools */}
          <div className="space-y-8">
            {activeTab === 'Upload / Template' && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span>📁</span>
                    Choose Your Canvas
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Upload an image or select from templates</p>
                </div>
                <div className="p-6">
                  <label
                    htmlFor="image-upload"
                    className="block border-2 border-dashed border-indigo-300 rounded-2xl p-12 text-center cursor-pointer bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 group"
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                  >
                    <div className="space-y-4">
                      <div className="text-6xl group-hover:scale-110 transition-transform duration-300">🎨</div>
                      <div className="space-y-2">
                        <div className="text-lg font-medium text-gray-700">Drag and drop an image here</div>
                        <div className="text-gray-500">or</div>
                        <button
                          type="button"
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Browse Files
                        </button>
                      </div>
                      <div className="text-sm text-gray-400">Supports JPG, PNG, GIF files</div>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                    {image && (
                      <div className="mt-6 flex justify-center">
                        <div className="relative group">
                          <img src={image} alt="Uploaded" className="max-h-48 rounded-xl shadow-lg" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-all duration-300"></div>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'AI Generator' && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span>🤖</span>
                    AI Image Generator
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Describe your vision and let AI create it</p>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe your meme image
                    </label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-300 resize-none"
                      placeholder="e.g., A surprised cat wearing sunglasses in space..."
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                      <select
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-300"
                        value={aiStyle}
                        onChange={e => setAiStyle(e.target.value as ImageStyle)}
                      >
                        {imageStyles.map(style => (
                          <option key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                      <select
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-300"
                        value={aiModel}
                        onChange={e => setAiModel(e.target.value as ModelType)}
                      >
                        {modelOptions.map(model => (
                          <option key={model} value={model}>
                            {model.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
                    onClick={handleGenerateWithAI} 
                    disabled={isGenerating || !aiPrompt.trim()}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating Magic...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        ✨ Generate with AI
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Preview & Tools */}
          <div className="space-y-8">
            {/* Preview Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span>🎭</span>
                    Live Preview
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">Your meme comes to life here</p>
                </div>
                <button
                  type="button"
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-sm"
                  onClick={handleAddText}
                >
                  ➕ Add Text
                </button>
              </div>
              <div className="p-6">
                <div
                  className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center h-96 mb-4 relative overflow-hidden border-2 border-gray-300"
                  ref={previewRef}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onClick={() => setSelectedTextId(null)}
                  style={{ userSelect: draggedId !== null ? 'none' : undefined }}
                >
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <Lottie animationData={loaderLottie} loop={true} style={{ width: 120, height: 120 }} />
                      <span className="mt-4 text-lg font-bold text-gray-600">✨ Creating your masterpiece...</span>
                    </div>
                  ) : image ? (
                    <div className="w-full h-full flex items-center justify-center relative">
                      <img
                        src={image && (/^(blob:|data:)/.test(image) ? image : (!/^https?:\/\//.test(image) ? `${ASSETS_URL.replace(/\/$/, '')}/${image.replace(/^\//, '')}` : image))}
                        alt="Preview"
                        className="object-contain w-full h-full absolute top-0 left-0 rounded-xl"
                        style={{ zIndex: 1 }}
                      />
                      {/* Draggable Text Overlays */}
                      {memeTexts.map(t => (
                        <MemeTextOverlay
                          key={t.id}
                          text={t}
                          selected={selectedTextId === t.id}
                          isResizing={!!resizeState && resizeState.id === t.id}
                          isRotating={!!rotateState && rotateState.id === t.id}
                          colors={colors}
                          fonts={fonts}
                          onChange={handleTextChange}
                          onSelect={setSelectedTextId}
                          onRemove={handleRemoveText}
                          onResizeMouseDown={handleResizeMouseDown}
                          onRotateMouseDown={handleRotateMouseDown}
                          onMouseDown={handleMouseDown}
                          onColorChange={handleTextColorChange}
                          onFontChange={handleTextFontChange}
                          onFontSizeChange={handleTextFontSizeChange}
                        />
                      ))}
                      {/* Hidden canvas for export */}
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">🖼️</div>
                      <h3 className="text-xl font-bold text-gray-700 mb-2">No image selected</h3>
                      <p className="text-gray-500">Upload an image or generate one with AI to get started</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {image && (
                  <div className="bg-gradient-to-r from-yellow-50 via-green-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {isAuthenticated && (
                        <button
                          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                          onClick={handleSaveToCollection}
                        >
                          <span>💾</span> Save to Collection
                        </button>
                      )}
                      <button
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        onClick={() => handleShare('general')}
                      >
                        <span>🔗</span> Share
                      </button>
                      <button
                        className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        onClick={handleDownload}
                      >
                        <span>⬇️</span> Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-2xl p-6 border border-purple-200">
              <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                <span>💡</span>
                Pro Tips
              </h3>
              <ul className="space-y-2 text-purple-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Click on text to edit, drag to move, use handles to resize</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Use the rotate handle above text to add some flair</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Press Ctrl+Enter in text to add line breaks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Experiment with different AI styles for unique results</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 