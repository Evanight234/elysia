import { useState } from 'react';

interface BookCoverProps {
  src: string | null;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  children?: React.ReactNode;
}

export default function BookCover({ src, alt, className = "book-cover", placeholderClassName = "book-cover-placeholder", children }: BookCoverProps) {
  const [error, setError] = useState(false);

  const containerStyle = { position: 'relative' as const };

  if (!src || error) {
    return (
      <div className={className} style={containerStyle}>
        <div className={placeholderClassName}>
          {alt ? alt[0].toUpperCase() : '?'}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={className} style={containerStyle}>
      <img 
        src={src} 
        alt={alt} 
        onError={() => setError(true)}
      />
      {children}
    </div>
  );
}
