import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Tabs from '../components/Tabs';
import PageLayout from '../components/PageLayout';
import { colors, fonts } from '../data/constants';
import api from '../services/axiosInstance';

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
  const [activeTab, setActiveTab] = useState<'From Template' | 'AI Generator'>('From Template');

  // Draggable meme texts state
  const [memeTexts, setMemeTexts] = useState<MemeText[]>([]);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const [selectedTextId, setSelectedTextId] = useState<number | null>(null);
  const [aiStyle, setAiStyle] = useState<ImageStyle>('pixel');
  const [aiModel, setAiModel] = useState<ModelType>('dall-e-3');

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
      alert('Prompt is required');
      return;
    }
    try {
      const response = await api.post('/images/generate', { prompt: aiPrompt, style: aiStyle, model: aiModel });
      // Use the correct path to the image URL
      setImage(response.data.image.url);
      setPreviewUrl(response.data.image.url);
    } catch (error: any) {
      // Try to extract backend or OpenAI error message
      let message = error.response?.data?.error || error.response?.data?.message || error.message;
      if (typeof message === 'object') {
        message = JSON.stringify(message);
      }
      alert('Error generating meme: ' + message);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PageLayout className="max-w-3xl">
        <h1 className="text-2xl font-bold mb-2">Create a Meme</h1>
        <Tabs
          tabs={['From Template', 'AI Generator']}
          activeTab={activeTab}
          onTabChange={tab => setActiveTab(tab as 'From Template' | 'AI Generator')}
          className="mb-8"
        />
        {/* Responsive flex container for form and preview */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Generate/Form Section */}
          <div className="w-full md:w-1/2">
            {/* Tab Content */}
            {activeTab === 'From Template' && (
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
                  rows={2}
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
                <button className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800" onClick={handleGenerateWithAI}>Generate with AI</button>
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
                style={{ userSelect: draggedId !== null ? 'none' : undefined }}
              >
                {image ? (
                  <div className="w-full h-full flex items-center justify-center relative" style={{ maxHeight: '24rem', maxWidth: '100%' }}>
                    <img
                      src={image}
                      alt="Preview"
                      className="object-contain w-full h-full absolute top-0 left-0"
                      style={{ zIndex: 1 }}
                    />
                    {/* Draggable Text Overlays */}
                    {memeTexts.map(t => (
                      <div
                        key={t.id}
                        className="absolute cursor-move group"
                        style={{
                          left: t.x,
                          top: t.y,
                          color: t.color,
                          fontFamily: t.font,
                          fontSize: t.fontSize,
                          fontWeight: 'bold',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                          zIndex: 2,
                          userSelect: 'none',
                          width: t.width,
                          height: t.height,
                          transform: `rotate(${t.rotation}deg)`
                        }}
                        onMouseDown={e => handleMouseDown(e, t.id)}
                        onClick={e => { e.stopPropagation(); setSelectedTextId(t.id); }}
                      >
                        {/* Rotate handle */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '50%',
                            top: -24,
                            transform: 'translateX(-50%)',
                            cursor: 'grab',
                            zIndex: 3,
                          }}
                          onMouseDown={e => handleRotateMouseDown(e, t.id)}
                        >
                          <span role="img" aria-label="rotate" style={{ fontSize: 18 }}>⟳</span>
                        </div>
                        {/* Text input */}
                        <input
                          className="bg-transparent border-none outline-none text-center p-0 m-0 w-full h-full"
                          style={{
                            color: t.color,
                            fontFamily: t.font,
                            fontSize: t.fontSize,
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                            width: '100%',
                            height: '100%',
                          }}
                          value={t.text}
                          onChange={e => handleTextChange(t.id, e.target.value)}
                          onFocus={() => setSelectedTextId(t.id)}
                        />
                        {/* Remove button */}
                        <button
                          className="ml-1 text-xs text-red-500 opacity-0 group-hover:opacity-100"
                          onClick={() => handleRemoveText(t.id)}
                          tabIndex={-1}
                          type="button"
                          style={{ position: 'absolute', top: 2, right: 2, zIndex: 4 }}
                        >
                          ✕
                        </button>
                        {/* Resize handles */}
                        {/* Right handle */}
                        <div
                          style={{
                            position: 'absolute',
                            right: -6,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 12,
                            height: 12,
                            background: '#fff',
                            border: '1px solid #888',
                            borderRadius: '50%',
                            cursor: 'ew-resize',
                            zIndex: 3,
                          }}
                          onMouseDown={e => handleResizeMouseDown(e, t.id, 'right')}
                        />
                        {/* Bottom handle */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '50%',
                            bottom: -6,
                            transform: 'translateX(-50%)',
                            width: 12,
                            height: 12,
                            background: '#fff',
                            border: '1px solid #888',
                            borderRadius: '50%',
                            cursor: 'ns-resize',
                            zIndex: 3,
                          }}
                          onMouseDown={e => handleResizeMouseDown(e, t.id, 'bottom')}
                        />
                        {/* Corner handle */}
                        <div
                          style={{
                            position: 'absolute',
                            right: -6,
                            bottom: -6,
                            width: 12,
                            height: 12,
                            background: '#fff',
                            border: '1px solid #888',
                            borderRadius: '50%',
                            cursor: 'nwse-resize',
                            zIndex: 3,
                          }}
                          onMouseDown={e => handleResizeMouseDown(e, t.id, 'corner')}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">No image selected</span>
                )}
              </div>
            </section>
            {/* Controls for selected text */}
            {selectedTextId !== null && (
              (() => {
                const selected = memeTexts.find(t => t.id === selectedTextId);
                if (!selected) return null;
                return (
                  <div className="flex flex-wrap gap-4 items-center mb-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <span className="text-xs font-semibold">Edit Selected Text:</span>
                    {/* Color picker */}
                    <div className="flex gap-1 items-center">
                      {colors.map(c => (
                        <button
                          key={c}
                          className={`w-6 h-6 rounded-full border-2 ${selected.color === c ? 'border-black' : 'border-gray-300'}`}
                          style={{ background: c }}
                          onClick={() => handleTextColorChange(selected.id, c)}
                          aria-label={c}
                          type="button"
                        />
                      ))}
                    </div>
                    {/* Font dropdown */}
                    <select
                      className="border rounded px-2 py-1 text-xs"
                      value={selected.font}
                      onChange={e => handleTextFontChange(selected.id, e.target.value)}
                    >
                      {fonts.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    {/* Font size slider */}
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={16}
                        max={64}
                        value={selected.fontSize}
                        onChange={e => handleTextFontSizeChange(selected.id, Number(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-xs">{selected.fontSize}px</span>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </PageLayout>
    </div>
  );
} 