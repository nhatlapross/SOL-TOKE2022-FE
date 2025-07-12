//hookswap-frontend\src\app\page.tsx - Optimized Version
'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CustomWalletButton from '@/components/CustomWalletButton';
import { ArrowRight, Shield, Users, Zap } from 'lucide-react';

// Lazy load heavy components
const WalletInfo = lazy(() => import('@/components/WalletInfo'));
const HookSwapDashboard = lazy(() => import('@/components/HookSwapDashBoard'));

// Lazy load icons to reduce initial bundle
const LazyIcons = {
  Github: lazy(() => import('lucide-react').then(mod => ({ default: mod.Github }))),
  Twitter: lazy(() => import('lucide-react').then(mod => ({ default: mod.Twitter }))),
  Code: lazy(() => import('lucide-react').then(mod => ({ default: mod.Code }))),
  Globe: lazy(() => import('lucide-react').then(mod => ({ default: mod.Globe }))),
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { connected, publicKey } = useWallet();
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Preload dashboard component when user is likely to use it
    const timer = setTimeout(() => {
      import('@/components/HookSwapDashBoard');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-show dashboard when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      setShowDashboard(true);
    } else {
      setShowDashboard(false);
    }
  }, [connected, publicKey]);

  // Show dashboard with loading fallback
  if (mounted && (showDashboard || connected)) {
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <HookSwapDashboard />
      </Suspense>
    );
  }

  return (
    <main className="min-h-screen relative">
      {/* Optimized Background - Reduced complexity */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Hero Section - Simplified */}
        <section className="min-h-screen flex flex-col items-center justify-center p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <h1 className="text-4xl sm:text-6xl font-bold text-gradient mb-4">
                HookSwap AMM
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"></div>
            </div>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
              Sàn giao dịch phi tập trung đầu tiên hỗ trợ{' '}
              <span className="text-purple-400 font-semibold">Token-2022</span>{' '}
              với{' '}
              <span className="text-blue-400 font-semibold">Transfer Hooks</span>
            </p>
          </div>

          {/* Main CTA Section */}
          <div className="glass-effect rounded-xl p-6 sm:p-8 max-w-md w-full mb-8">
            <div className="text-center space-y-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-white" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-semibold text-white">
                Kết nối để bắt đầu
              </h2>
              
              {/* Wallet Connection */}
              <div className="flex flex-col gap-3">
                {mounted ? <CustomWalletButton /> : <WalletSkeleton />}
                
                {/* Demo Access */}
                {!connected && (
                  <Button
                    variant="outline"
                    onClick={() => setShowDashboard(true)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    View Demo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
              
              {/* Wallet Info with Suspense */}
              {mounted && connected && (
                <Suspense fallback={<div className="h-20 bg-white/5 rounded animate-pulse" />}>
                  <WalletInfo />
                </Suspense>
              )}

              <div className="text-center text-white/60 text-sm">
                Hỗ trợ Phantom, Solflare và nhiều ví khác
              </div>
            </div>
          </div>

          {/* Simplified Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full px-4">
            {[
              {
                icon: Shield,
                title: "KYC Compliance",
                description: "Xác thực KYC tự động cho mọi giao dịch",
                color: "purple",
              },
              {
                icon: Users,
                title: "Whitelist Control", 
                description: "Kiểm soát truy cập với hệ thống whitelist",
                color: "blue",
              },
              {
                icon: Zap,
                title: "Token-2022",
                description: "Hỗ trợ đầy đủ Token-2022 với Transfer Hooks",
                color: "indigo", 
              },
            ].map((feature, idx) => (
              <SimpleFeatureCard key={idx} {...feature} />
            ))}
          </div>
        </section>

        {/* Lazy load remaining sections */}
        <LazySection />
      </div>
    </main>
  );
}

// Simplified Feature Card
function SimpleFeatureCard({ icon: Icon, title, description, color }: any) {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300">
      <CardContent className="p-4 sm:p-6 text-center">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${color}-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-400`} />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/60 text-xs sm:text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

// Lazy loading section
function LazySection() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldLoad(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldLoad) return null;

  return (
    <Suspense fallback={<div className="h-96 bg-white/5 animate-pulse" />}>
      <TechnologySection />
    </Suspense>
  );
}

// Technology section component
function TechnologySection() {
  return (
    <section className="py-16 px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">🚀 Live on Solana Devnet</h2>
        <p className="text-white/70 mb-8">
          Tất cả smart contracts đã được deploy và sẵn sàng sử dụng
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: "Token Layer", status: "✅ Live" },
            { name: "HookSwap AMM", status: "✅ Live" },
            { name: "KYC Hook", status: "✅ Live" },
            { name: "Whitelist Hook", status: "✅ Live" },
            { name: "Hook Registry", status: "✅ Live" },
            { name: "Frontend", status: "✅ Ready" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white/10 p-3 rounded-lg text-center">
              <p className="text-white text-sm font-medium">{item.name}</p>
              <p className="text-green-400 text-xs">{item.status}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Loading skeletons
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="h-10 bg-white/10 rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-white/5 rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/10 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
  );
}

function WalletSkeleton() {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg animate-pulse">
      Loading...
    </div>
  );
}