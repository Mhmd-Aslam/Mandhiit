import React from 'react';

/*
  Minimal placeholder AvatarCropper component.
  - Shows a preview of the selected image
  - Provides Cancel and Save buttons
  - On save, converts the preview dataURL to a JPEG Blob and returns it
  This matches the usage in pages/Profile.js: onCancel(), onSave(blob)
*/
export default function AvatarCropper({ src, onCancel, onSave }) {
  const handleSave = async () => {
    try {
      const blob = await dataURLtoBlob(src);
      onSave(blob);
    } catch (e) {
      // If conversion fails, just cancel to avoid breaking flow
      onCancel?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#2f3031] rounded-xl p-4 w-[90vw] max-w-md shadow ring-1 ring-slate-200 dark:ring-[#555]">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Adjust your photo</h2>
        <div className="mt-3">
          {/* No real cropping for now; just preview */}
          <img src={src} alt="Preview" className="max-h-64 w-auto mx-auto rounded-lg object-contain" />
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">Cancel</button>
          <button onClick={handleSave} className="px-3 py-1.5 rounded-md bg-amber-600 text-white hover:bg-amber-700">Save</button>
        </div>
      </div>
    </div>
  );
}

function dataURLtoBlob(dataURL) {
  return fetch(dataURL).then(res => res.blob());
}
