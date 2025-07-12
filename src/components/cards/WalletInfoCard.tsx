//hookswap-frontend\src\components\cards\WalletInfoCard.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import type { WalletInfoCardProps } from '@/types';

const WalletInfoCard: React.FC<WalletInfoCardProps> = ({
  publicKey,
  wallet,
  balance,
  disconnect,
  copyToClipboard
}) => {
  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success('Wallet disconnected successfully');
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <p className="text-white/80 text-sm">Connected Wallet</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-mono text-sm">
                {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(publicKey?.toString() || '')}
                className="p-1 h-auto"
              >
                <Copy className="w-3 h-3 text-white" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-green-400 text-xs">{wallet?.adapter.name}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDisconnect}
                className="px-2 py-1 h-auto text-xs bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletInfoCard;