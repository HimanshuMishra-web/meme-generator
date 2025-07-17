import React, { useRef } from 'react';

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

type ResizeDirection = 'right' | 'bottom' | 'corner';

interface MemeTextOverlayProps {
  text: MemeText;
  selected: boolean;
  isResizing: boolean;
  isRotating: boolean;
  colors: string[];
  fonts: string[];
  onChange: (id: number, newText: string) => void;
  onSelect: (id: number) => void;
  onRemove: (id: number) => void;
  onResizeMouseDown: (e: React.MouseEvent, id: number, direction: ResizeDirection) => void;
  onRotateMouseDown: (e: React.MouseEvent, id: number) => void;
  onMouseDown: (e: React.MouseEvent, id: number) => void;
  onColorChange: (id: number, color: string) => void;
  onFontChange: (id: number, font: string) => void;
  onFontSizeChange: (id: number, size: number) => void;
}

const MemeTextOverlay: React.FC<MemeTextOverlayProps> = ({
  text,
  selected,
  isResizing,
  isRotating,
  colors,
  fonts,
  onChange,
  onSelect,
  onRemove,
  onResizeMouseDown,
  onRotateMouseDown,
  onMouseDown,
  onColorChange,
  onFontChange,
  onFontSizeChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div
      className="absolute cursor-move group"
      style={{
        left: text.x,
        top: text.y,
        color: text.color,
        fontFamily: text.font,
        fontSize: text.fontSize,
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        zIndex: 2,
        userSelect: 'none',
        width: text.width,
        height: text.height,
        transform: `rotate(${text.rotation}deg)`
      }}
      onMouseDown={e => onMouseDown(e, text.id)}
      onClick={e => { e.stopPropagation(); onSelect(text.id); }}
    >
      {/* Rotate handle */}
      {(selected || isResizing || isRotating) && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: -24,
            transform: 'translateX(-50%)',
            cursor: 'grab',
            zIndex: 3,
          }}
          onMouseDown={e => onRotateMouseDown(e, text.id)}
        >
          <span role="img" aria-label="rotate" style={{ fontSize: 18 }}>⟳</span>
        </div>
      )}
      {/* Text input/textarea */}
      {selected ? (
        <textarea
          ref={textareaRef}
          className="bg-transparent border-2 border-dashed outline-none text-center p-0 m-0 w-full h-full resize-none"
          style={{
            color: text.color,
            fontFamily: text.font,
            fontSize: text.fontSize,
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
            width: '100%',
            height: '100%',
            borderRadius: 6,
          }}
          value={text.text}
          onChange={e => onChange(text.id, e.target.value)}
          onFocus={() => onSelect(text.id)}
          onKeyDown={e => {
            if (e.key === 'Enter' && e.ctrlKey) {
              const textarea = e.target as HTMLTextAreaElement;
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const newValue = text.text.slice(0, start) + '\n' + text.text.slice(end);
              onChange(text.id, newValue);
              setTimeout(() => {
                if (textareaRef.current) {
                  textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
                }
              }, 0);
              e.preventDefault();
            }
          }}
        />
      ) : (
        <input
          className="bg-transparent border-none outline-none text-center p-0 m-0 w-full h-full"
          style={{
            color: text.color,
            fontFamily: text.font,
            fontSize: text.fontSize,
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
            width: '100%',
            height: '100%',
          }}
          value={text.text}
          onChange={e => onChange(text.id, e.target.value)}
          onFocus={() => onSelect(text.id)}
          readOnly
        />
      )}
      {/* Controls for selected text */}
      {selected && (
        <div className="flex flex-wrap gap-2 items-center mb-1 p-1 bg-white/80 rounded border border-gray-200 absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20">
          {/* Color picker */}
          <div className="flex gap-1 items-center">
            {colors.map(c => (
              <button
                key={c}
                className={`w-5 h-5 rounded-full border-2 ${text.color === c ? 'border-black' : 'border-gray-300'}`}
                style={{ background: c }}
                onClick={() => onColorChange(text.id, c)}
                aria-label={c}
                type="button"
              />
            ))}
          </div>
          {/* Font dropdown */}
          <select
            className="border rounded px-2 py-1 text-xs"
            value={text.font}
            onChange={e => onFontChange(text.id, e.target.value)}
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
              value={text.fontSize}
              onChange={e => onFontSizeChange(text.id, Number(e.target.value))}
              className="w-20"
            />
            <span className="text-xs">{text.fontSize}px</span>
          </div>
        </div>
      )}
      {/* Remove button */}
      <button
        className="ml-1 text-xs text-red-500 opacity-0 group-hover:opacity-100"
        onClick={() => onRemove(text.id)}
        tabIndex={-1}
        type="button"
        style={{ position: 'absolute', top: 2, right: 2, zIndex: 4 }}
      >
        ✕
      </button>
      {/* Resize handles */}
      {(selected || isResizing) && (
        <>
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
            onMouseDown={e => onResizeMouseDown(e, text.id, 'right')}
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
            onMouseDown={e => onResizeMouseDown(e, text.id, 'bottom')}
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
            onMouseDown={e => onResizeMouseDown(e, text.id, 'corner')}
          />
        </>
      )}
    </div>
  );
};

export default MemeTextOverlay; 