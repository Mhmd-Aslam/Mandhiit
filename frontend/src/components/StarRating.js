import React, { useRef, useState } from 'react';

export default function StarRating({ value = 0, onChange, readOnly = false, small = false }) {
  const stars = [1, 2, 3, 4, 5];
  const size = small ? 'w-4 h-4' : 'w-6 h-6';

  // Hover preview and temporary fill on click
  const [hoverValue, setHoverValue] = useState(0);
  const [flashValue, setFlashValue] = useState(0);
  const flashTimer = useRef(null);

  const displayValue = hoverValue || flashValue || value;

  const handleClick = (s) => {
    if (readOnly) return;
    // Trigger parent change if provided
    if (onChange) onChange(s);
    // Temporary fill for UX even if parent doesn't update immediately
    setFlashValue(s);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashValue(0), 800);
  };

  return (
    <div className="inline-flex items-center gap-1" aria-label={`Rating: ${displayValue} out of 5`}>
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          className={`p-0 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          onMouseEnter={readOnly ? undefined : () => setHoverValue(s)}
          onMouseLeave={readOnly ? undefined : () => setHoverValue(0)}
          onClick={() => handleClick(s)}
          disabled={readOnly}
          aria-label={`${s} star${s > 1 ? 's' : ''}`}
          title={`${s} star${s > 1 ? 's' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill={s <= displayValue ? '#f59e0b' : 'none'}
            stroke="#f59e0b"
            className={`${size}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.802-2.036a1 1 0 00-1.176 0l-2.802 2.036c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
