//hookswap-frontend\src\components\CustomWalletButton.tsx - UPDATED WITH AUTO-RECONNECT
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useWalletAutoConnect } from '@/hooks/useWalletAutoConnect';
import { Settings, Wifi, WifiOff } from 'lucide-react';

export default function CustomWalletButton() {
  const { wallets, select, wallet, connect, connecting, connected } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  const {
    isAutoConnecting,
    reconnectAttempts,
    maxReconnectAttempts,
    handleDisconnect,
    enableAutoConnect,
    disableAutoConnect,
    isAutoConnectEnabled,
    storedWalletName,
  } = useWalletAutoConnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen]);

  // Handle wallet connection
  const handleConnect = async (walletName: string) => {
    if (connectingWallet) return; // Prevent multiple connections
    
    try {
      setConnectingWallet(walletName);
      
      // If already connected to a different wallet, disconnect first
      if (connected && wallet && wallet.adapter.name !== walletName) {
        toast.loading('Disconnecting current wallet...', { id: 'wallet-switch' });
        await handleDisconnect();
        // Small delay to ensure clean disconnect
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const selectedWallet = wallets.find(w => w.adapter.name === walletName);
      if (!selectedWallet) {
        throw new Error(`Wallet ${walletName} not found`);
      }

      toast.loading(`Connecting to ${walletName}...`, { id: 'wallet-connect' });
      
      // Select the wallet
      select(selectedWallet.adapter.name);
      
      // Small delay to ensure wallet is selected
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Connect to the wallet
      await connect();
      
      // Enable auto-connect for this wallet
      enableAutoConnect(walletName);
      
      toast.success(`Connected to ${walletName}!`, { id: 'wallet-connect' });
      setIsModalOpen(false);
      
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to connect wallet';
      if (error?.message?.includes('User rejected')) {
        errorMessage = 'Connection rejected by user';
      } else if (error?.message?.includes('already pending')) {
        errorMessage = 'Connection already in progress';
      } else if (error?.message?.includes('not found')) {
        errorMessage = `${walletName} wallet not installed`;
      }
      
      toast.error(errorMessage, { id: 'wallet-connect' });
    } finally {
      setConnectingWallet(null);
    }
  };

  // Handle auto-connect toggle
  const toggleAutoConnect = async () => {
    if (isAutoConnectEnabled()) {
      disableAutoConnect();
    } else if (wallet) {
      enableAutoConnect(wallet.adapter.name);
      toast.success('Auto-connect enabled!');
    }
  };

  // Filter and categorize wallets for better UX
  const categorizeWallets = (wallets: any[]) => {
    const categories = {
      popular: [] as any[],
      mobile: [] as any[],
      hardware: [] as any[],
      web3: [] as any[]
    };

    wallets.forEach(wallet => {
      const name = wallet.adapter.name.toLowerCase();
      
      if (name.includes('phantom') || name.includes('solflare')) {
        categories.popular.push(wallet);
      } else if (name.includes('coinbase') || name.includes('trust') || name.includes('coin98')) {
        categories.mobile.push(wallet);
      } else if (name.includes('ledger') || name.includes('trezor')) {
        categories.hardware.push(wallet);
      } else if (name.includes('torus') || name.includes('walletconnect')) {
        categories.web3.push(wallet);
      } else {
        categories.popular.push(wallet); // Default to popular
      }
    });

    return categories;
  };

  // Get all unique wallets and categorize them
  const availableWallets = wallets.filter((wallet, index, array) => {
    // Remove duplicates by name
    const isDuplicate = array.findIndex(w => w.adapter.name === wallet.adapter.name) !== index;
    return !isDuplicate;
  });

  const walletCategories = categorizeWallets(availableWallets);

  // Don't render until mounted (SSR protection)
  if (!mounted) {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg animate-pulse">
        Loading...
      </div>
    );
  }

  // Auto-connecting state
  if (isAutoConnecting) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg animate-pulse flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>Auto-connecting...</span>
        {storedWalletName && (
          <span className="text-white/80 text-sm">({storedWalletName})</span>
        )}
        {reconnectAttempts > 0 && (
          <span className="text-white/60 text-xs">
            Attempt {reconnectAttempts}/{maxReconnectAttempts}
          </span>
        )}
      </div>
    );
  }

  // Connected state
  if (connected && wallet) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDisconnect}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          {wallet.adapter.name}
        </button>
        
        {/* Auto-connect toggle */}
        <button
          onClick={toggleAutoConnect}
          className={`p-3 rounded-lg transition-all duration-200 ${
            isAutoConnectEnabled() 
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
              : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
          }`}
          title={isAutoConnectEnabled() ? 'Auto-connect enabled' : 'Auto-connect disabled'}
        >
          {isAutoConnectEnabled() ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  // Connecting state
  if (connecting) {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg animate-pulse flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        Connecting...
      </div>
    );
  }

  // Default state - show connect button
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
      >
        Connect Wallet
        {storedWalletName && (
          <span className="text-white/80 text-sm">({storedWalletName})</span>
        )}
      </button>

      {/* Custom Modal with proper z-index */}
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" 
            onClick={() => setIsModalOpen(false)}
            style={{ zIndex: 9998 }}
          />
          
          {/* Modal content */}
          <div 
            className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none"
            style={{ zIndex: 9999 }}
          >
            <div 
              className="bg-gradient-to-br from-purple-900 to-blue-900 border border-white/20 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl pointer-events-auto animate-fade-in" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Connect Wallet</h3>
                  {storedWalletName && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Wifi className="w-3 h-3" />
                      <span>Auto: {storedWalletName}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {/* Popular Wallets */}
                  {walletCategories.popular.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-2 text-left">Popular Wallets</h4>
                      <div className="space-y-2">
                        {walletCategories.popular.map((wallet, index) => (
                          <WalletButton 
                            key={`popular-${wallet.adapter.name}-${index}`}
                            wallet={wallet}
                            onConnect={handleConnect}
                            isConnecting={connectingWallet === wallet.adapter.name}
                            isDisabled={connectingWallet !== null || connecting}
                            isStored={wallet.adapter.name === storedWalletName}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile Wallets */}
                  {walletCategories.mobile.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-2 text-left">Mobile Wallets</h4>
                      <div className="space-y-2">
                        {walletCategories.mobile.map((wallet, index) => (
                          <WalletButton 
                            key={`mobile-${wallet.adapter.name}-${index}`}
                            wallet={wallet}
                            onConnect={handleConnect}
                            isConnecting={connectingWallet === wallet.adapter.name}
                            isDisabled={connectingWallet !== null || connecting}
                            isStored={wallet.adapter.name === storedWalletName}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hardware Wallets */}
                  {walletCategories.hardware.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-2 text-left">Hardware Wallets</h4>
                      <div className="space-y-2">
                        {walletCategories.hardware.map((wallet, index) => (
                          <WalletButton 
                            key={`hardware-${wallet.adapter.name}-${index}`}
                            wallet={wallet}
                            onConnect={handleConnect}
                            isConnecting={connectingWallet === wallet.adapter.name}
                            isDisabled={connectingWallet !== null || connecting}
                            isStored={wallet.adapter.name === storedWalletName}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Web3 Wallets */}
                  {walletCategories.web3.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-2 text-left">Web3 Wallets</h4>
                      <div className="space-y-2">
                        {walletCategories.web3.map((wallet, index) => (
                          <WalletButton 
                            key={`web3-${wallet.adapter.name}-${index}`}
                            wallet={wallet}
                            onConnect={handleConnect}
                            isConnecting={connectingWallet === wallet.adapter.name}
                            isDisabled={connectingWallet !== null || connecting}
                            isStored={wallet.adapter.name === storedWalletName}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No wallets found */}
                  {availableWallets.length === 0 && (
                    <div className="text-white/60 text-center py-8">
                      <div className="text-4xl mb-2">🔌</div>
                      <p>No supported wallets found.</p>
                      <p className="text-sm mt-1">Please install a Solana wallet extension.</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    disabled={connectingWallet !== null}
                    className={`text-sm transition-colors ${
                      connectingWallet !== null 
                        ? 'text-white/30 cursor-not-allowed' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {connectingWallet ? 'Connecting...' : 'Cancel'}
                  </button>
                  
                  {isAutoConnectEnabled() && (
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <Wifi className="w-3 h-3" />
                      <span>Auto-connect enabled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Separate Wallet Button Component with stored indicator
interface WalletButtonProps {
  wallet: any;
  onConnect: (walletName: string) => void;
  isConnecting: boolean;
  isDisabled: boolean;
  isStored?: boolean;
}

function WalletButton({ wallet, onConnect, isConnecting, isDisabled, isStored }: WalletButtonProps) {
  // Get wallet description
  const getWalletDescription = (walletName: string) => {
    const descriptions: { [key: string]: string } = {
      'Phantom': 'Most popular Solana wallet',
      'Solflare': 'Feature-rich Solana wallet',
      'Coinbase Wallet': 'Secure multi-chain wallet',
      'Trust Wallet': 'Mobile-first wallet',
      'Coin98': 'Multi-chain DeFi wallet',
      'Ledger': 'Hardware security',
      'Torus': 'Social login wallet',
      'WalletConnect': 'Connect via QR code'
    };
    return descriptions[walletName] || 'Solana compatible wallet';
  };

  return (
    <button
      onClick={() => onConnect(wallet.adapter.name)}
      disabled={isDisabled}
      className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 relative ${
        isDisabled 
          ? 'bg-white/5 border-white/10 cursor-not-allowed opacity-50' 
          : 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 hover:shadow-lg'
      } ${
        isStored ? 'ring-2 ring-green-500/50' : ''
      }`}
    >
      {/* Stored wallet indicator */}
      {isStored && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1 text-xs text-green-400">
            <Wifi className="w-3 h-3" />
            <span>Auto</span>
          </div>
        </div>
      )}

      {/* Wallet Icon or Loading Spinner */}
      <div className="w-8 h-8 flex items-center justify-center">
        {isConnecting ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <img 
            src={wallet.adapter.icon} 
            alt={wallet.adapter.name}
            className="w-8 h-8 rounded"
            onError={(e) => {
              // Fallback for missing icons
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              // Create fallback text
              const fallback = document.createElement('div');
              fallback.textContent = wallet.adapter.name.charAt(0);
              fallback.className = 'w-8 h-8 bg-white/20 rounded flex items-center justify-center text-white font-bold';
              target.parentNode?.appendChild(fallback);
            }}
          />
        )}
      </div>
      
      {/* Wallet Info */}
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className={`font-medium block ${isDisabled ? 'text-white/50' : 'text-white'}`}>
            {isConnecting ? `Connecting...` : wallet.adapter.name}
          </span>
          {isStored && <span className="text-xs text-green-400">Previously connected</span>}
        </div>
        {!isConnecting && (
          <span className="text-xs text-white/60">
            {getWalletDescription(wallet.adapter.name)}
          </span>
        )}
      </div>

      {/* Connection indicator */}
      {!isConnecting && !isDisabled && (
        <div className="w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      )}
    </button>
  );
}