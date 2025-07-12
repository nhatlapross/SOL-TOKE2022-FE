//hookswap-frontend\src\components\ClientWrapper.tsx
'use client';

import { ReactNode } from 'react';
import DynamicWalletProvider from './DynamicWalletProvider';
import { Toaster } from 'react-hot-toast';

interface ClientWrapperProps {
  children: ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <DynamicWalletProvider>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0.75rem',
          },
        }}
      />
    </DynamicWalletProvider>
  );
}