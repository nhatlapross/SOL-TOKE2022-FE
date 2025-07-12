//hookswap-frontend\src\components\forms\TokenCreateForm.tsx - COMPLETE
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, Loader2, Plus, Shield, Users, Zap } from 'lucide-react';
import type { TokenCreateFormProps } from '@/types';

const TokenCreateForm: React.FC<TokenCreateFormProps> = ({
  formState,
  setFormState,
  onCreateToken,
  loading,
  balance
}) => {
  const hasInsufficientBalance = balance !== null && balance < 0.01;
  const isFormValid = formState.tokenName && formState.tokenSymbol && formState.totalSupply;

  const renderHookInfo = () => {
    if (formState.selectedHookType === 'kyc') {
      return (
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-orange-200 font-medium mb-1">KYC Validation Hook</h4>
              <p className="text-orange-200/80 text-sm mb-2">
                This token will require KYC validation for all transfers
              </p>
              <ul className="text-orange-200/80 text-xs space-y-1">
                <li>• Users must be KYC verified to send/receive tokens</li>
                <li>• Transfer limits based on KYC level (Basic/Enhanced)</li>
                <li>• Automatic compliance enforcement</li>
                <li>• Suitable for regulated assets and securities</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (formState.selectedHookType === 'whitelist') {
      return (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-blue-200 font-medium mb-1">Whitelist Control Hook</h4>
              <p className="text-blue-200/80 text-sm mb-2">
                This token will only allow transfers between whitelisted addresses
              </p>
              <ul className="text-blue-200/80 text-xs space-y-1">
                <li>• Only whitelisted addresses can send/receive tokens</li>
                <li>• Granular access control management</li>
                <li>• Ideal for private tokens and restricted distributions</li>
                <li>• Admin can add/remove addresses from whitelist</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (formState.selectedHookType === 'none') {
      return (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-green-200 font-medium mb-1">Standard Token</h4>
              <p className="text-green-200/80 text-sm mb-2">
                This will be a standard Token-2022 without transfer hooks
              </p>
              <ul className="text-green-200/80 text-xs space-y-1">
                <li>• No transfer restrictions or validations</li>
                <li>• Standard SPL token functionality</li>
                <li>• Maximum compatibility with existing tools</li>
                <li>• Best for general-purpose tokens</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Token-2022 with Transfer Hooks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Token Information */}
        <div className="space-y-4">
          <h3 className="text-white font-medium">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-white text-sm">Token Name</label>
              <Input 
                placeholder="My Awesome Token" 
                value={formState.tokenName}
                onChange={(e) => setFormState(prev => ({ ...prev, tokenName: e.target.value }))}
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-white text-sm">Token Symbol</label>
              <Input 
                placeholder="MAT" 
                value={formState.tokenSymbol}
                onChange={(e) => setFormState(prev => ({ ...prev, tokenSymbol: e.target.value.toUpperCase() }))}
                maxLength={10}
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-white text-sm">Decimals</label>
              <Select 
                value={formState.tokenDecimals} 
                onValueChange={(value) => setFormState(prev => ({ ...prev, tokenDecimals: value }))}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[6, 8, 9].map(decimal => (
                    <SelectItem key={decimal} value={decimal.toString()}>
                      {decimal} decimals {decimal === 9 && '(Recommended)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-white text-sm">Total Supply</label>
              <Input 
                placeholder="1000000" 
                value={formState.totalSupply}
                onChange={(e) => setFormState(prev => ({ ...prev, totalSupply: e.target.value }))}
                type="number"
                min="1"
                step="1"
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
              />
            </div>
          </div>
        </div>

        {/* Transfer Hook Configuration */}
        <div className="space-y-4">
          <h3 className="text-white font-medium">Transfer Hook Configuration</h3>
          <div className="space-y-2">
            <label className="text-white text-sm">Transfer Hook Type</label>
            <Select 
              value={formState.selectedHookType} 
              onValueChange={(value) => setFormState(prev => ({ ...prev, selectedHookType: value }))}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select hook type (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    No Transfer Hook
                  </div>
                </SelectItem>
                <SelectItem value="kyc">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    KYC Validation Hook
                  </div>
                </SelectItem>
                <SelectItem value="whitelist">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Whitelist Control Hook
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hook Information Cards */}
          {renderHookInfo()}
        </div>

        {/* Cost and Requirements */}
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
          <h4 className="text-purple-200 font-medium mb-2">Cost & Requirements</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-purple-200/80">Creation Cost:</p>
              <p className="text-white">~0.01 SOL</p>
            </div>
            <div>
              <p className="text-purple-200/80">Network:</p>
              <p className="text-white">Solana Devnet</p>
            </div>
            <div>
              <p className="text-purple-200/80">Token Standard:</p>
              <p className="text-white">Token-2022</p>
            </div>
            <div>
              <p className="text-purple-200/80">Hook Program:</p>
              <p className="text-white">
                {formState.selectedHookType === 'kyc' ? 'KYC Hook' : 
                 formState.selectedHookType === 'whitelist' ? 'Whitelist Hook' : 
                 'None'}
              </p>
            </div>
          </div>
          
          {/* Real-time validation */}
          <div className="mt-3 pt-3 border-t border-purple-500/30">
            <div className="flex items-center gap-2 text-xs">
              {hasInsufficientBalance ? (
                <>
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span className="text-red-400">Insufficient SOL balance for creation</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">Sufficient SOL balance available</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Create Button */}
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          onClick={onCreateToken}
          disabled={loading || !isFormValid || hasInsufficientBalance}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Token...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Token with Hooks
            </>
          )}
        </Button>

        {/* Form Validation Messages */}
        {!isFormValid && (
          <div className="text-white/60 text-sm text-center">
            Please fill all required fields to create your token
          </div>
        )}
        
        {hasInsufficientBalance && (
          <div className="text-red-400 text-sm text-center">
            You need at least 0.01 SOL to create a token
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenCreateForm;