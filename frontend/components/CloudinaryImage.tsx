import Image from 'next/image';
import { useState } from 'react';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function CloudinaryImage({ 
  src, 
  alt, 
  width = 300, 
  height = 300, 
  className = "",
  priority = false 
}: CloudinaryImageProps) {
  const [imageError, setImageError] = useState(false);

  // Fallback image if Cloudinary image fails to load
  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='150' y='150' text-anchor='middle' dy='.3em' font-family='Arial' font-size='16' fill='%236b7280'%3EImage not available%3C/text%3E%3C/svg%3E";

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Image
      src={imageError ? fallbackImage : src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={handleImageError}
      style={{ objectFit: 'cover' }}
    />
  );
} 