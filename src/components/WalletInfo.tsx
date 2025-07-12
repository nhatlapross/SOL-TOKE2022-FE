//hookswap-frontend\src\components\WalletInfo.tsx
'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';

export default function WalletInfo() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey && connected && connection) {
      setLoading(true);
      connection.getBalance(publicKey)
        .then((balance) => {
          setBalance(balance / LAMPORTS_PER_SOL);
        })
        .catch((error) => {
          console.error('Failed to get balance:', error);
          setBalance(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setBalance(null);
      setLoading(false);
    }
  }, [publicKey, connected, connection]);

  if (!connected || !publicKey) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-black/20 rounded-lg animate-fade-in">
      <div className="space-y-3">
        {/* Wallet Address */}
        <div>
          <p className="text-white/80 text-sm mb-1">Địa chỉ ví:</p>
          <p className="text-white font-mono text-xs break-all bg-black/30 p-2 rounded">
            {publicKey.toString()}
          </p>
        </div>
        
        {/* Balance */}
        <div className="pt-3 border-t border-white/10">
          <p className="text-white/80 text-sm mb-1">Số dư SOL:</p>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-white/20 rounded w-20"></div>
            </div>
          ) : balance !== null ? (
            <p className="text-white font-semibold">
              {balance.toFixed(4)} SOL
            </p>
          ) : (
            <p className="text-red-400 text-sm">
              Failed to load balance
            </p>
          )}
        </div>
      </div>
    </div>
  );
}