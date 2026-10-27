import React, { useState } from 'react';

export default function Avatar({
  src,
  name = 'User',
  size = 'md',
  className = ''
}) {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl'
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.replace(/^dr\.\s*/i, '').trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-teal-100 text-teal-900 font-semibold border border-teal-200/60 shadow-xs select-none ${sizes[size] || sizes.md} ${className}`}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
