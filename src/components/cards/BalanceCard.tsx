//hookswap-frontend\src\components\cards\BalanceCard.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import type { BalanceCardProps } from '@/types';

const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <span className="text-yellow-400">◎</span>
          </div>
          <div>
            <p className="text-white/80 text-sm">SOL Balance</p>
            <p className="text-white font-semibold">
              {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;