//hookswap-frontend\src\contexts\WalletContext.tsx - FIXED WITH AUTO-RECONNECT
'use client';

import React, { ReactNode, useMemo, useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { 
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
  Coin98WalletAdapter,
  LedgerWalletAdapter,
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet CSS
require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: React.FC<WalletContextProviderProps> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [walletModalReady, setWalletModalReady] = useState(false);

  // Only run on client side
  useEffect(() => {
    setIsClient(true);
    // Delay wallet modal initialization
    const timer = setTimeout(() => {
      setWalletModalReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Network configuration
  const network = WalletAdapterNetwork.Devnet;
  
  // RPC endpoint
  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);
  }, [network]);

  // Wallets - only create on client side with proper error handling
  const wallets = useMemo(() => {
    if (!isClient) return [];
    
    try {
      const walletAdapters = [];
      
      // Core Solana wallets (most popular)
      try {
        walletAdapters.push(new PhantomWalletAdapter());
      } catch (error) {
        console.warn('Phantom wallet adapter initialization failed:', error);
      }
      
      try {
        walletAdapters.push(new SolflareWalletAdapter({ network }));
      } catch (error) {
        console.warn('Solflare wallet adapter initialization failed:', error);
      }
      
      // Additional popular wallets
      try {
        walletAdapters.push(new CoinbaseWalletAdapter());
      } catch (error) {
        console.warn('Coinbase wallet adapter initialization failed:', error);
      }
      
      try {
        walletAdapters.push(new TrustWalletAdapter());
      } catch (error) {
        console.warn('Trust wallet adapter initialization failed:', error);
      }
      
      try {
        walletAdapters.push(new Coin98WalletAdapter());
      } catch (error) {
        console.warn('Coin98 wallet adapter initialization failed:', error);
      }
      
      // Hardware wallet
      try {
        walletAdapters.push(new LedgerWalletAdapter());
      } catch (error) {
        console.warn('Ledger wallet adapter initialization failed:', error);
      }
      
      // Web3Auth integration
      try {
        walletAdapters.push(new TorusWalletAdapter());
      } catch (error) {
        console.warn('Torus wallet adapter initialization failed:', error);
      }
      
      // Remove duplicates based on adapter name
      const uniqueWallets = walletAdapters.filter((wallet, index, array) => 
        array.findIndex(w => w.name === wallet.name) === index
      );
      
      console.log('Available wallets:', uniqueWallets.map(w => w.name));
      return uniqueWallets;
      
    } catch (error) {
      console.warn('Wallet adapter initialization failed:', error);
      return [];
    }
  }, [network, isClient]);

  // Don't render anything until client side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white/80">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <ConnectionProvider 
      endpoint={endpoint}
      config={{
        commitment: 'processed',
        confirmTransactionInitialTimeout: 30000,
      }}
    >
      <WalletProvider 
        wallets={wallets} 
        autoConnect={true} // ✅ ENABLE AUTO-CONNECT
        onError={(error) => {
          console.error('Wallet error:', error);
          // Don't show error toast here as it's handled in component
        }}
        localStorageKey="hookswap-wallet" // ✅ PERSIST WALLET SELECTION
      >
        {walletModalReady ? (
          <WalletModalProvider>
            <AutoReconnectHandler>
              {children}
            </AutoReconnectHandler>
          </WalletModalProvider>
        ) : (
          <AutoReconnectHandler>
            {children}
          </AutoReconnectHandler>
        )}
      </WalletProvider>
    </ConnectionProvider>
  );
};

// ✅ NEW: Auto-Reconnect Handler Component
const AutoReconnectHandler: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white/80">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};