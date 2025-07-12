//hookswap-frontend\src\components\empty-states\EmptyStates.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Plus, Zap } from 'lucide-react';

// Empty Pools Component
export const EmptyPools: React.FC<{
  availableTokens: any[];
  onCreateFirstPool: () => void;
}> = ({ availableTokens, onCreateFirstPool }) => (
  <Card className="bg-white/10 backdrop-blur-md border-white/20">
    <CardHeader>
      <CardTitle className="text-white">Active Pools</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Droplets className="w-8 h-8 text-white/60" />
          </div>
          <p className="text-white/60 text-sm mb-2">No active pools found</p>
          <p className="text-white/40 text-xs">
            Create the first liquidity pool to start trading
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={onCreateFirstPool}
            disabled={availableTokens.length < 2}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Pool
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Empty Created Tokens Component
export const EmptyCreatedTokens: React.FC<{
  onFillExampleData: () => void;
}> = ({ onFillExampleData }) => (
  <Card className="bg-white/10 backdrop-blur-md border-white/20">
    <CardHeader>
      <CardTitle className="text-white">Your Created Tokens</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white/60" />
          </div>
          <p className="text-white/60 text-sm mb-2">No tokens created yet</p>
          <p className="text-white/40 text-xs">
            Create your first Token-2022 with transfer hooks above
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={onFillExampleData}
          >
            <Zap className="w-4 h-4 mr-2" />
            Fill Example Data
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Wallet Not Connected Component
export const WalletNotConnected: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
    <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md w-full">
      <CardContent className="p-8 text-center">
        <div className="text-6xl mb-4">🔌</div>
        <h2 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h2>
        <p className="text-white/60 mb-4">Please connect your wallet to access HookSwap AMM</p>
      </CardContent>
    </Card>
  </div>
);