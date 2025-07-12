//hookswap-frontend\src\hooks\useWalletAutoConnect.ts
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const WALLET_STORAGE_KEY = 'hookswap-wallet-preference';
const AUTO_CONNECT_DELAY = 1000; // 1 second delay
const MAX_RECONNECT_ATTEMPTS = 3;

interface WalletPreference {
  walletName: string;
  lastConnected: number;
  autoConnect: boolean;
}

export const useWalletAutoConnect = () => {
  const { 
    wallets, 
    wallet, 
    connected, 
    connecting, 
    select, 
    connect, 
    disconnect 
  } = useWallet();
  
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Save wallet preference when connected
  useEffect(() => {
    if (connected && wallet && mounted) {
      const preference: WalletPreference = {
        walletName: wallet.adapter.name,
        lastConnected: Date.now(),
        autoConnect: true,
      };
      
      try {
        localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(preference));
        console.log('💾 Wallet preference saved:', wallet.adapter.name);
        
        // Reset reconnect attempts on successful connection
        setReconnectAttempts(0);
        
        // Show success toast only for manual connections
        if (!isAutoConnecting) {
          toast.success(`Connected to ${wallet.adapter.name}!`);
        }
      } catch (error) {
        console.warn('Failed to save wallet preference:', error);
      }
    }
  }, [connected, wallet, mounted, isAutoConnecting]);

  // Clear preference when disconnected manually
  const handleDisconnect = useCallback(async () => {
    try {
      // Clear auto-connect preference
      const preference = getStoredPreference();
      if (preference) {
        preference.autoConnect = false;
        localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(preference));
      }
      
      await disconnect();
      toast.success('Wallet disconnected');
    } catch (error: any) {
      console.error('Disconnect failed:', error);
      toast.error('Failed to disconnect wallet');
    }
  }, [disconnect]);

  // Get stored preference
  const getStoredPreference = useCallback((): WalletPreference | null => {
    if (!mounted) return null;
    
    try {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (!stored) return null;
      
      const preference = JSON.parse(stored) as WalletPreference;
      
      // Check if preference is still valid (not older than 7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      if (Date.now() - preference.lastConnected > maxAge) {
        localStorage.removeItem(WALLET_STORAGE_KEY);
        return null;
      }
      
      return preference;
    } catch (error) {
      console.warn('Failed to parse wallet preference:', error);
      localStorage.removeItem(WALLET_STORAGE_KEY);
      return null;
    }
  }, [mounted]);

  // Auto-connect logic
  useEffect(() => {
    if (!mounted || connected || connecting || isAutoConnecting) return;
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;

    const attemptAutoConnect = async () => {
      const preference = getStoredPreference();
      if (!preference || !preference.autoConnect) return;

      const savedWallet = wallets.find(w => w.adapter.name === preference.walletName);
      if (!savedWallet) {
        console.log('🔍 Previously connected wallet not found:', preference.walletName);
        return;
      }

      try {
        setIsAutoConnecting(true);
        setReconnectAttempts(prev => prev + 1);
        
        console.log('🔄 Attempting auto-reconnect to:', preference.walletName);
        
        // Select the wallet first
        select(savedWallet.adapter.name);
        
        // Small delay to ensure wallet is selected
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Attempt to connect
        await connect();
        
        console.log('✅ Auto-reconnect successful');
        
      } catch (error: any) {
        console.warn('🔄 Auto-reconnect attempt failed:', error.message);
        
        // If this was the last attempt, clear the preference
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS - 1) {
          console.log('❌ Max reconnect attempts reached, clearing preference');
          localStorage.removeItem(WALLET_STORAGE_KEY);
          
          // Show a subtle notification
          toast('Wallet auto-connect disabled after multiple failures', {
            icon: '⚠️',
            duration: 3000,
          });
        }
      } finally {
        setIsAutoConnecting(false);
      }
    };

    // Delay auto-connect to allow page to fully load
    const timer = setTimeout(attemptAutoConnect, AUTO_CONNECT_DELAY);
    return () => clearTimeout(timer);
  }, [
    mounted, 
    connected, 
    connecting, 
    isAutoConnecting, 
    wallets, 
    select, 
    connect, 
    getStoredPreference, 
    reconnectAttempts
  ]);

  // Enable auto-connect for a wallet
  const enableAutoConnect = useCallback((walletName: string) => {
    const preference: WalletPreference = {
      walletName,
      lastConnected: Date.now(),
      autoConnect: true,
    };
    
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(preference));
      console.log('✅ Auto-connect enabled for:', walletName);
    } catch (error) {
      console.warn('Failed to enable auto-connect:', error);
    }
  }, []);

  // Disable auto-connect
  const disableAutoConnect = useCallback(() => {
    try {
      localStorage.removeItem(WALLET_STORAGE_KEY);
      console.log('❌ Auto-connect disabled');
      toast.success('Auto-connect disabled');
    } catch (error) {
      console.warn('Failed to disable auto-connect:', error);
    }
  }, []);

  // Check if auto-connect is enabled
  const isAutoConnectEnabled = useCallback(() => {
    const preference = getStoredPreference();
    return preference?.autoConnect ?? false;
  }, [getStoredPreference]);

  return {
    isAutoConnecting,
    reconnectAttempts,
    maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    handleDisconnect,
    enableAutoConnect,
    disableAutoConnect,
    isAutoConnectEnabled,
    storedWalletName: getStoredPreference()?.walletName,
  };
};