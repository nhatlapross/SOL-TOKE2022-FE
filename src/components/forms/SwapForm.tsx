//hookswap-frontend\src\components\forms\SwapForm.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ArrowUpDown, Loader2 } from 'lucide-react';
import type { SwapFormProps } from '@/types';

const SwapForm: React.FC<SwapFormProps> = ({
  availableTokens,
  formState,
  setFormState,
  onSwap,
  loading
}) => {
  const handleSwapTokens = () => {
    setFormState(prev => ({
      ...prev,
      selectedFromToken: prev.selectedToToken,
      selectedToToken: prev.selectedFromToken,
      swapFromAmount: prev.swapToAmount,
      swapToAmount: prev.swapFromAmount,
    }));
  };

  const fromToken = availableTokens.find(t => t.symbol === formState.selectedFromToken);
  const toToken = availableTokens.find(t => t.symbol === formState.selectedToToken);
  const hasHooks = fromToken?.hasHooks || toToken?.hasHooks;

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5" />
          Token Swap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <label className="text-white text-sm">From</label>
          <div className="flex gap-2">
            <Select 
              value={formState.selectedFromToken} 
              onValueChange={(value) => setFormState(prev => ({ ...prev, selectedFromToken: value }))}
            >
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Token" />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.length > 0 ? (
                  availableTokens.map((token, index) => (
                    <SelectItem key={`from-${token.mint}-${index}`} value={token.symbol}>
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
            <Input 
              placeholder="0.00" 
              value={formState.swapFromAmount}
              onChange={(e) => setFormState(prev => ({ ...prev, swapFromAmount: e.target.value }))}
              type="number"
              step="0.000001"
              min="0"
              className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
            />
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full p-2 bg-white/10 border-white/20"
            onClick={handleSwapTokens}
          >
            <ArrowUpDown className="w-4 h-4 text-white" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <label className="text-white text-sm">To</label>
          <div className="flex gap-2">
            <Select 
              value={formState.selectedToToken} 
              onValueChange={(value) => setFormState(prev => ({ ...prev, selectedToToken: value }))}
            >
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Token" />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.length > 0 ? (
                  availableTokens.map((token, index) => (
                    <SelectItem key={`to-${token.mint}-${index}`} value={token.symbol}>
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
            <Input 
              placeholder="0.00" 
              value={formState.swapToAmount}
              onChange={(e) => setFormState(prev => ({ ...prev, swapToAmount: e.target.value }))}
              type="number"
              disabled
              className="flex-1 bg-white/5 border-white/20 text-white/50 placeholder-white/30"
            />
          </div>
        </div>

        {/* Hook Warning */}
        {hasHooks && (
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-200">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                This token has transfer hooks - additional validation required
              </span>
            </div>
          </div>
        )}

        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          onClick={onSwap}
          disabled={
            loading || 
            !formState.swapFromAmount || 
            !formState.selectedFromToken || 
            !formState.selectedToToken ||
            formState.selectedFromToken === formState.selectedToToken
          }
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Swapping...
            </>
          ) : (
            'Execute Swap'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SwapForm;