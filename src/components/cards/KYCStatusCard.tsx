//hookswap-frontend\src\components\cards\KYCStatusCard.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from 'lucide-react';
import type { KYCStatusCardProps } from '@/types';

const KYCStatusCard: React.FC<KYCStatusCardProps> = ({ kycStatus }) => {
  const getStatusColor = () => {
    if (kycStatus === true) return 'green';
    if (kycStatus === false) return 'red';
    return 'gray';
  };

  const getStatusText = () => {
    if (kycStatus === null) return 'Checking...';
    return kycStatus ? 'Verified' : 'Not Verified';
  };

  const statusColor = getStatusColor();

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${statusColor}-500/20`}>
            <Shield className={`w-5 h-5 text-${statusColor}-400`} />
          </div>
          <div>
            <p className="text-white/80 text-sm">KYC Status</p>
            <p className={`font-semibold text-${statusColor}-400`}>
              {getStatusText()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KYCStatusCard;