//hookswap-frontend\src\components\MobileOptimized.tsx
import React from 'react';
import { useResponsive } from '@/hooks/useResponsive';

interface MobileOptimizedProps {
  children: React.ReactNode;
  mobileComponent?: React.ReactNode;
  tabletComponent?: React.ReactNode;
  desktopComponent?: React.ReactNode;
}

export const MobileOptimized: React.FC<MobileOptimizedProps> = ({
  children,
  mobileComponent,
  tabletComponent,
  desktopComponent,
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile && mobileComponent) {
    return <>{mobileComponent}</>;
  }

  if (isTablet && tabletComponent) {
    return <>{tabletComponent}</>;
  }

  if (isDesktop && desktopComponent) {
    return <>{desktopComponent}</>;
  }

  return <>{children}</>;
};