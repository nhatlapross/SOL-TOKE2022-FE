//hookswap-frontend\src\components\cards\ProgramIDsCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Copy } from 'lucide-react';
import { PROGRAM_IDS } from '@/lib/HookSwapSDK';
import type { ProgramIDsProps } from '@/types';

// Program IDs for display
const PROGRAM_ID_DISPLAY = {
  TOKEN_LAYER: PROGRAM_IDS.TOKEN_LAYER.toString(),
  HOOKSWAP_AMM: PROGRAM_IDS.HOOKSWAP_AMM.toString(),
  KYC_HOOK: PROGRAM_IDS.KYC_HOOK.toString(),
  HOOK_REGISTRY: PROGRAM_IDS.HOOK_REGISTRY.toString(),
  WHITELIST_HOOK: PROGRAM_IDS.WHITELIST_HOOK.toString()
};

const ProgramIDsCard: React.FC<ProgramIDsProps> = ({ copyToClipboard }) => {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Deployed Programs (Devnet)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(PROGRAM_ID_DISPLAY).map(([name, id]) => (
            <div key={name} className="bg-black/20 p-3 rounded-lg">
              <p className="text-white/80 text-sm font-medium mb-1">
                {name.replace(/_/g, ' ')}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-white/60 font-mono text-xs flex-1 truncate">
                  {id}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(id)}
                  className="p-1 h-auto"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramIDsCard;