//hookswap-frontend\src\components\AnimatedSection.tsx
import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'fade-in';
  delay?: number;
  threshold?: number;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1,
}) => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold,
    triggerOnce: true,
  });

  return (
    <div
      className={cn(
        'transition-all duration-700 ease-out',
        {
          'opacity-0 translate-y-8': animation === 'fade-up' && !isIntersecting,
          'opacity-100 translate-y-0': animation === 'fade-up' && isIntersecting,
          'opacity-0 -translate-x-8': animation === 'fade-left' && !isIntersecting,
          'opacity-100 translate-x-0': animation === 'fade-left' && isIntersecting,
          'opacity-0 translate-x-8': animation === 'fade-right' && !isIntersecting,
          'opacity-0': animation === 'fade-in' && !isIntersecting,
          'opacity-100': animation === 'fade-in' && isIntersecting,
        },
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};