//hookswap-frontend\src\components\cards\ProgramIDsCard.tsx - Updated
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Copy, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PROGRAM_IDS } from '@/lib/RealHookSwapSDK';
import type { ProgramIDsProps } from '@/types';

// Program IDs for display
const PROGRAM_ID_DISPLAY = {
  TOKEN_LAYER: PROGRAM_IDS.TOKEN_LAYER.toString(),
  HOOKSWAP_AMM: PROGRAM_IDS.HOOKSWAP_AMM.toString(),
  KYC_HOOK: PROGRAM_IDS.KYC_HOOK.toString(),
  HOOK_REGISTRY: PROGRAM_IDS.HOOK_REGISTRY.toString(),
  WHITELIST_HOOK: PROGRAM_IDS.WHITELIST_HOOK.toString()
};

const ProgramIDsCard: React.FC<ProgramIDsProps> = ({ 
  copyToClipboard, 
  programsValidated, 
  showValidationStatus = false 
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Deployed Programs (Devnet)
          {showValidationStatus && programsValidated && (
            <span className="ml-auto text-sm">
              {Object.values(programsValidated).filter(Boolean).length}/{Object.keys(programsValidated).length} Active
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(PROGRAM_ID_DISPLAY).map(([name, id]) => {
            const isValidated = programsValidated?.[name];
            const validationStatus = programsValidated ? (isValidated ? 'deployed' : 'missing') : 'checking';
            
            return (
              <div key={name} className="bg-black/20 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/80 text-sm font-medium">
                    {name.replace(/_/g, ' ')}
                  </p>
                  {showValidationStatus && (
                    <div className="flex items-center gap-1">
                      {validationStatus === 'deployed' && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      {validationStatus === 'missing' && (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      {validationStatus === 'checking' && (
                        <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <p className="text-white/60 font-mono text-xs flex-1 truncate">
                    {id}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(id)}
                    className="p-1 h-auto hover:bg-white/10"
                  >
                    <Copy className="w-3 h-3 text-white" />
                  </Button>
                </div>
                
                {showValidationStatus && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`
                        ${validationStatus === 'deployed' ? 'text-green-400' : ''}
                        ${validationStatus === 'missing' ? 'text-red-400' : ''}
                        ${validationStatus === 'checking' ? 'text-yellow-400' : ''}
                      `}>
                        {validationStatus === 'deployed' && '✅ Deployed'}
                        {validationStatus === 'missing' && '❌ Not Found'}
                        {validationStatus === 'checking' && '⏳ Checking...'}
                      </span>
                      
                      <button
                        onClick={() => window.open(`https://explorer.solana.com/address/${id}?cluster=devnet`, '_blank')}
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Explorer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Summary Status */}
        {showValidationStatus && programsValidated && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="text-green-400 font-bold text-lg">
                  {Object.values(programsValidated).filter(Boolean).length}
                </div>
                <div className="text-green-300 text-xs">Deployed</div>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="text-red-400 font-bold text-lg">
                  {Object.values(programsValidated).filter(v => !v).length}
                </div>
                <div className="text-red-300 text-xs">Missing</div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="text-blue-400 font-bold text-lg">
                  {Object.keys(programsValidated).length}
                </div>
                <div className="text-blue-300 text-xs">Total</div>
              </div>
              
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <div className="text-purple-400 font-bold text-lg">
                  {Math.round((Object.values(programsValidated).filter(Boolean).length / Object.keys(programsValidated).length) * 100)}%
                </div>
                <div className="text-purple-300 text-xs">Ready</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Network Info */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <div className="text-white/60">
              Network: <span className="text-blue-400">Solana Devnet</span>
            </div>
            <div className="text-white/60">
              RPC: <span className="text-green-400">Connected</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramIDsCard;