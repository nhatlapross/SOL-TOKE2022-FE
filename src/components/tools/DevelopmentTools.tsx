//hookswap-frontend\src\components\tools\DevelopmentTools.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, ExternalLink, Copy } from 'lucide-react';
import { PROGRAM_IDS } from '@/lib/HookSwapSDK';
import toast from 'react-hot-toast';
import type { DevelopmentToolsProps } from '@/types';

const PROGRAM_ID_DISPLAY = {
  TOKEN_LAYER: PROGRAM_IDS.TOKEN_LAYER.toString(),
  HOOKSWAP_AMM: PROGRAM_IDS.HOOKSWAP_AMM.toString(),
  KYC_HOOK: PROGRAM_IDS.KYC_HOOK.toString(),
  HOOK_REGISTRY: PROGRAM_IDS.HOOK_REGISTRY.toString(),
  WHITELIST_HOOK: PROGRAM_IDS.WHITELIST_HOOK.toString()
};

const DevelopmentTools: React.FC<DevelopmentToolsProps> = ({ 
  publicKey, 
  copyToClipboard 
}) => {
  const handleCopyAllProgramIds = () => {
    const programIds = Object.values(PROGRAM_ID_DISPLAY).join('\n');
    copyToClipboard(programIds);
    toast.success('All Program IDs copied!');
  };

  return (
    <Card className="bg-black/20 border border-white/10">
      <CardHeader>
        <CardTitle className="text-white/80 text-sm flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Development Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
            onClick={() => window.open('https://explorer.solana.com/?cluster=devnet', '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            Solana Explorer
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
            onClick={() => window.open('https://faucet.solana.com/', '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            SOL Faucet
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
            onClick={() => {
              if (publicKey) {
                window.open(`https://explorer.solana.com/address/${publicKey.toString()}?cluster=devnet`, '_blank');
              }
            }}
            disabled={!publicKey}
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            Your Account
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
            onClick={handleCopyAllProgramIds}
          >
            <Copy className="w-3 h-3 mr-2" />
            Copy All Program IDs
          </Button>
        </div>
        
        <div className="text-white/40 text-xs pt-2 border-t border-white/10">
          <p>🔧 Development mode active - All transactions on Solana Devnet</p>
          <p>💡 Use SOL faucet to get test tokens for transaction fees</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevelopmentTools;