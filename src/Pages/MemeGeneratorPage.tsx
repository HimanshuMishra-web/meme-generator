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
    <div className="min-h-screen bg-white text-gray-900">
      <PageLayout className="max-w-3xl">
        <h1 className="text-2xl font-bold mb-2">Create a Meme</h1>
        <div className="mb-2 text-gray-600 text-sm">Upload an image, select a template, or generate with AI. Add text, then save, share, or download your meme!</div>
        <Tabs
          tabs={['Upload / Template', 'AI Generator']}
          activeTab={activeTab}
          onTabChange={tab => setActiveTab(tab as 'Upload / Template' | 'AI Generator')}
          className="mb-8"
        />
        {/* Responsive flex container for form and preview */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Generate/Form Section */}
          <div className="w-full md:w-1/2">
            {/* Tab Content */}
            {activeTab === 'Upload / Template' && (
              <>
                {/* 1. Choose a Template */}
                <section className="mb-8">
                  <h2 className="font-semibold mb-2">Choose a Template</h2>
                  <label
                    htmlFor="image-upload"
                    className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                  >
                    <div className="mb-2">Drag and drop an image here, or</div>
                    <button
                      type="button"
                      className="bg-gray-200 px-4 py-2 rounded font-semibold text-gray-700 hover:bg-gray-300"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select an Image
                    </button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                    {image && (
                      <div className="mt-4 flex justify-center">
                        <img src={image} alt="Uploaded" className="max-h-40 rounded shadow" />
                      </div>
                    )}
                  </label>
                </section>
              </>
            )}
            {activeTab === 'AI Generator' && (
              <section className="mb-8">
                <h2 className="font-semibold mb-2">AI Meme Generator</h2>
                <textarea
                  className="border rounded px-3 py-2 w-full mb-2"
                  placeholder="AI Prompt"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  rows={6}
                />
                {/* Image Style Select */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1" htmlFor="ai-style-select">Image Style</label>
                  <select
                    id="ai-style-select"
                    className="border rounded px-3 py-2 w-full"
                    value={aiStyle}
                    onChange={e => setAiStyle(e.target.value as ImageStyle)}
                  >
                    {imageStyles.map(style => (
                      <option key={style} value={style}>{style.charAt(0).toUpperCase() + style.slice(1)}</option>
                    ))}
                  </select>
                </div>
                {/* Model Select */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1" htmlFor="ai-model-select">Model</label>
                  <select
                    id="ai-model-select"
                    className="border rounded px-3 py-2 w-full"
                    value={aiModel}
                    onChange={e => setAiModel(e.target.value as ModelType)}
                  >
                    {modelOptions.map(model => (
                      <option key={model} value={model}>{model.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <button className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800" onClick={handleGenerateWithAI} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </button>
              </section>
            )}
          </div>
          {/* Preview Section */}
          <div className="w-full md:w-1/2">
            <section className="mb-8">
              <h2 className="font-semibold mb-2 flex items-center justify-between">
                <span>Preview</span>
                <button
                  type="button"
                  className="bg-gray-200 px-2 py-1 rounded text-xs font-semibold text-gray-700 hover:bg-gray-300 ml-2"
                  onClick={handleAddText}
                >
                  + Add Text
                </button>
              </h2>
              <div
                className="bg-gray-100 rounded-lg flex items-center justify-center h-96 mb-2 relative overflow-hidden"
                ref={previewRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => setSelectedTextId(null)}
                style={{ userSelect: draggedId !== null ? 'none' : undefined }}
              >
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <Lottie animationData={loaderLottie} loop={true} style={{ width: 180, height: 180 }} />
                    <span className="mt-2 text-base font-semibold text-gray-600">Generating a meme... Hold tight!</span>
                  </div>
                ) : image ? (
                  <div className="w-full h-full flex items-center justify-center relative" style={{ maxHeight: '24rem', maxWidth: '100%' }}>
                    <img
                      src={image && (/^(blob:|data:)/.test(image) ? image : (!/^https?:\/\//.test(image) ? `${ASSETS_URL.replace(/\/$/, '')}/${image.replace(/^\//, '')}` : image))}
                      alt="Preview"
                      className="object-contain w-full h-full absolute top-0 left-0"
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
                  <span className="text-gray-400">No image selected</span>
                )}
              </div>
              {/* Stylish Meme Actions Bar - outside preview */}
              {image && (
                <div className="flex flex-wrap gap-4 justify-center items-center mt-6 mb-2 p-4 bg-gradient-to-r from-yellow-100 via-blue-100 to-green-100 rounded-xl shadow-lg border border-gray-200">
                  {isAuthenticated && (
                    <button
                      className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-5 py-2 rounded-lg shadow transition text-base"
                      onClick={handleSaveToCollection}
                    >
                      <span role="img" aria-label="save">💾</span> Save to Collection
                    </button>
                  )}
                  <button
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-lg shadow transition text-base"
                    onClick={() => handleShare('facebook')}
                  >
                    <span role="img" aria-label="share">🔗</span> Share
                  </button>
                  <button
                    className="flex items-center gap-2 bg-gray-800 hover:bg-black text-white font-bold px-5 py-2 rounded-lg shadow transition text-base"
                    onClick={handleDownload}
                  >
                    <span role="img" aria-label="download">⬇️</span> Download
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </PageLayout>
    </div>
  );
} 