import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Tabs from '../components/Tabs';
import PageLayout from '../components/PageLayout';
import { colors, fonts } from '../data/constants';

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
  const [activeTab, setActiveTab] = useState<'template' | 'ai'>('template');

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

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PageLayout className="max-w-3xl">
        <h1 className="text-2xl font-bold mb-2">Create a Meme</h1>
        <Tabs
          tabs={['template', 'ai']}
          activeTab={activeTab}
          onTabChange={tab => setActiveTab(tab as 'template' | 'ai')}
          className="mb-8"
        />
        {/* Tab Content */}
        {activeTab === 'template' && (
          <>
            {/* 1. Choose a Template */}
            <section className="mb-8">
              <h2 className="font-semibold mb-2">1. Choose a Template</h2>
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
              <button className="mt-4 bg-gray-200 px-4 py-2 rounded font-semibold text-gray-700 hover:bg-gray-300">Browse</button>
            </section>
            {/* 2. Add Text */}
            <section className="mb-8">
              <h2 className="font-semibold mb-2">2. Add Text</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Top text"
                  className="border rounded px-3 py-2 flex-1"
                  value={topText}
                  onChange={e => setTopText(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Bottom text"
                  className="border rounded px-3 py-2 flex-1"
                  value={bottomText}
                  onChange={e => setBottomText(e.target.value)}
                />
              </div>
            </section>
            {/* 3. Customize */}
            <section className="mb-8">
              <h2 className="font-semibold mb-2">3. Customize</h2>
              <div className="flex flex-wrap gap-4 items-center mb-2">
                <select
                  className="border rounded px-3 py-2"
                  value={font}
                  onChange={e => setFont(e.target.value)}
                >
                  {fonts.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <div className="flex gap-2 items-center">
                  {colors.map(c => (
                    <button
                      key={c}
                      className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-black' : 'border-gray-300'}`}
                      style={{ background: c }}
                      onClick={() => setColor(c)}
                      aria-label={c}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={16}
                    max={64}
                    value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-xs">{fontSize}px</span>
                </div>
                <input
                  type="text"
                  placeholder="Text Position"
                  className="border rounded px-3 py-2"
                  // Placeholder for text position logic
                />
              </div>
            </section>
          </>
        )}
        {activeTab === 'ai' && (
          <section className="mb-8">
            <h2 className="font-semibold mb-2">AI Meme Generator</h2>
            <textarea
              className="border rounded px-3 py-2 w-full mb-2"
              placeholder="AI Prompt"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              rows={2}
            />
            <button className="bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800">Generate with AI</button>
          </section>
        )}
        {/* 5. Preview (always visible) */}
        <section className="mb-8">
          <h2 className="font-semibold mb-2">5. Preview</h2>
          <div className="bg-gray-100 rounded-lg flex items-center justify-center h-64 mb-2 relative overflow-hidden">
            {image ? (
              <div className="w-full h-full flex items-center justify-center relative" style={{ maxHeight: '16rem', maxWidth: '100%' }}>
                <img
                  src={image}
                  alt="Preview"
                  className="object-contain w-full h-full absolute top-0 left-0"
                  style={{ zIndex: 1 }}
                />
              </div>
            ) : (
              <span className="text-gray-400">No image selected</span>
            )}
          </div>
        </section>
      </PageLayout>
    </div>
  );
} 