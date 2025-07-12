//hookswap-frontend\src\components\DynamicWalletProvider.tsx
'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Loading component for wallet provider
const WalletLoadingComponent = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
      <p className="text-white/80">Loading wallet...</p>
    </div>
  </div>
);

// Dynamic import of WalletProvider with SSR disabled
const DynamicWalletContextProvider = dynamic(
  () => import('@/contexts/WalletContext').then((mod) => ({ default: mod.WalletContextProvider })),
  {
    ssr: false,
    loading: WalletLoadingComponent,
  }
);

interface DynamicWalletProviderProps {
  children: ReactNode;
}

export default function DynamicWalletProvider({ children }: DynamicWalletProviderProps) {
  return (
    <DynamicWalletContextProvider>
      {children}
    </DynamicWalletContextProvider>
  );
}