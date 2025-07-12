//hookswap-frontend\src\components\forms\PoolForm.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Droplets, Loader2 } from 'lucide-react';
import type { PoolFormProps } from '@/types';

const PoolForm: React.FC<PoolFormProps> = ({
  availableTokens,
  formState,
  setFormState,
  onCreatePool,
  loading
}) => {
  const isSameToken = formState.poolTokenA === formState.poolTokenB && Boolean(formState.poolTokenA);

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Droplets className="w-5 h-5" />
          Create Liquidity Pool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-white text-sm">Token A</label>
            <Select 
              value={formState.poolTokenA} 
              onValueChange={(value) => setFormState(prev => ({ ...prev, poolTokenA: value }))}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select Token A" />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.length > 0 ? (
                  availableTokens.map((token, index) => (
                    <SelectItem key={`pool-a-${token.mint}-${index}`} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        {token.symbol}
                        {token.hasHooks && <AlertCircle className="w-3 h-3 text-orange-400" />}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>
                    Loading tokens...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-white text-sm">Token B</label>
            <Select 
              value={formState.poolTokenB} 
              onValueChange={(value) => setFormState(prev => ({ ...prev, poolTokenB: value }))}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select Token B" />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.length > 0 ? (
                  availableTokens.map((token, index) => (
                    <SelectItem key={`pool-b-${token.mint}-${index}`} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        {token.symbol}
                        {token.hasHooks && <AlertCircle className="w-3 h-3 text-orange-400" />}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>
                    Loading tokens...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-white text-sm">Amount A</label>
            <Input 
              placeholder="0.00" 
              value={formState.liquidityAmountA}
              onChange={(e) => setFormState(prev => ({ ...prev, liquidityAmountA: e.target.value }))}
              type="number"
              step="0.000001"
              min="0"
              className="bg-white/10 border-white/20 text-white placeholder-white/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-white text-sm">Amount B</label>
            <Input 
              placeholder="0.00" 
              value={formState.liquidityAmountB}
              onChange={(e) => setFormState(prev => ({ ...prev, liquidityAmountB: e.target.value }))}
              type="number"
              step="0.000001"
              min="0"
              className="bg-white/10 border-white/20 text-white placeholder-white/50"
            />
          </div>
        </div>

        {/* Pool Warnings */}
        {isSameToken && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-200">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Cannot create pool with same token</span>
            </div>
          </div>
        )}

        <Button 
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          onClick={onCreatePool}
          disabled={
            loading || 
            !formState.poolTokenA || 
            !formState.poolTokenB || 
            !formState.liquidityAmountA || 
            !formState.liquidityAmountB || 
            isSameToken
          }
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Pool...
            </>
          ) : (
            'Create Pool'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PoolForm;