//hookswap-frontend\src\components\tokens\TokenList.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users } from 'lucide-react';
import type { TokenListProps } from '@/types';

const TokenList: React.FC<TokenListProps> = ({
  tokens,
  title,
  loading = false,
  emptyMessage = "No tokens found",
  emptyAction
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20 mx-auto mb-4"></div>
              <p className="text-white/60">Loading tokens...</p>
            </div>
          ) : tokens.length > 0 ? (
            tokens.map((token, index) => (
              <div key={`token-${token.mint}-${index}`} className="bg-black/20 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{token.symbol}</span>
                      {token.hasHooks && (
                        <div className="flex items-center gap-1">
                          {token.hookType === 'KYC' && <Shield className="w-3 h-3 text-orange-400" />}
                          {token.hookType === 'Whitelist' && <Users className="w-3 h-3 text-blue-400" />}
                          <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                            {token.hookType}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-white/60 text-sm">{token.name}</p>
                    <p className="text-white/40 text-xs font-mono">
                      {token.mint.slice(0, 8)}...{token.mint.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      {parseFloat(token.balance || '0').toFixed(4)}
                    </p>
                    <p className="text-white/60 text-xs">{token.decimals} decimals</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-white/60 text-sm mb-2">{emptyMessage}</p>
              {emptyAction}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenList;