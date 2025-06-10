import Lottie from 'lottie-react';
import { useEffect, useRef, useState } from 'react';
import loaderAnimation from '@/assets/loader.json';

interface LoaderAnimationProps {
  size?: 'sm' | 'md' | 'lg';
}

export const LoaderAnimation = ({ size = 'md' }: LoaderAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate angle based on mouse position relative to center
      // Limit the rotation to 2 degrees
      const rotateY = ((e.clientX - centerX) / rect.width) * 2;
      const rotateX = ((e.clientY - centerY) / rect.height) * 2;

      setRotation({ x: -rotateX, y: rotateY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`${sizeMap[size]} mx-auto transition-transform duration-200`}
      style={{ 
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transformStyle: 'preserve-3d'
      }}
    >
      <Lottie animationData={loaderAnimation} loop={true} />
    </div>
  );
}; 