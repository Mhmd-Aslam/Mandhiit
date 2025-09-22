import React, { useEffect, useRef, useState } from 'react';

// WhatsApp-like DP selector: square viewport, drag to position and zoom.
// Props:
// - src: data URL or object URL of selected image
// - onCancel: () => void
// - onSave: (blob: Blob) => void
export default function AvatarCropper({ src, onCancel, onSave }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [img, setImg] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // in px relative to center
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  useEffect(() => {
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = src;
  }, [src]);

  const onMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  };
  const endDrag = () => setDragging(false);

  const onWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY; // up = zoom in
    const factor = delta > 0 ? 1.05 : 0.95;
    setScale((s) => Math.min(6, Math.max(0.5, s * factor)));
  };

  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      dragStart.current = { x: t.clientX, y: t.clientY, ox: offset.x, oy: offset.y };
      setDragging(true);
    } else if (e.touches.length === 2) {
      setDragging(false);
      // pinch zoom setup
      const d = dist(e.touches[0], e.touches[1]);
      dragStart.current.pinchDist = d;
      dragStart.current.scale = scale;
    }
  };
  const onTouchMove = (e) => {
    if (e.touches.length === 1 && dragging) {
      const t = e.touches[0];
      const dx = t.clientX - dragStart.current.x;
      const dy = t.clientY - dragStart.current.y;
      setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
    } else if (e.touches.length === 2 && dragStart.current.pinchDist) {
      const d = dist(e.touches[0], e.touches[1]);
      const ratio = d / dragStart.current.pinchDist;
      const newScale = Math.min(6, Math.max(0.5, dragStart.current.scale * ratio));
      setScale(newScale);
    }
  };
  const onTouchEnd = () => setDragging(false);
  const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

  const handleSave = () => {
    if (!img || !containerRef.current) return;
    const size = 512; // output size
    // Compute how the image maps into the square:
    // We center the image, then apply offset and scale.
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Fit image such that min dimension fits the square at scale 1
    const baseScale = size / Math.min(img.width, img.height);
    const finalScale = baseScale * scale;

    const imgDrawW = img.width * finalScale;
    const imgDrawH = img.height * finalScale;

    // Center position plus user offset
    const cx = size / 2 + offset.x;
    const cy = size / 2 + offset.y;

    const dx = cx - imgDrawW / 2;
    const dy = cy - imgDrawH / 2;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, dx, dy, imgDrawW, imgDrawH);

    canvas.toBlob((blob) => {
      if (blob) onSave(blob);
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onMouseUp={endDrag} onMouseLeave={endDrag}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4">
        <h3 className="text-lg font-semibold text-slate-800">Set profile photo</h3>
        <div
          ref={containerRef}
          className="mt-4 mx-auto w-64 h-64 bg-slate-100 rounded-lg overflow-hidden relative touch-none"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {img && (
            <img
              ref={imgRef}
              src={src}
              alt="to crop"
              draggable={false}
              className="absolute select-none"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                // Fit min dimension to container at scale 1
                width: img.width <= img.height ? '256px' : 'auto',
                height: img.height < img.width ? '256px' : 'auto',
              }}
            />
          )}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <input
            type="range"
            min="50"
            max="600"
            value={Math.round(scale * 100)}
            onChange={(e) => setScale(parseInt(e.target.value, 10) / 100)}
          />
          <span className="text-xs text-slate-600">Zoom</span>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200" onClick={onCancel}>Cancel</button>
          <button className="px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
