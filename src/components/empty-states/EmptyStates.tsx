//src/components/empty-states/EmptyStates.tsx - Complete Empty State Components
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  Droplets, 
  Plus, 
  Code, 
  Zap, 
  AlertTriangle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Shield,
  Users,
  TrendingUp,
  History,
  Settings,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Activity
} from 'lucide-react';
import CustomWalletButton from '@/components/CustomWalletButton';
import type { 
  Token, 
  EmptyPoolsProps, 
  EmptyCreatedTokensProps, 
  LoadingStateProps,
  Pool,
  TransactionHistory
} from '@/types';

// ========== WALLET NOT CONNECTED STATE ==========
export const WalletNotConnected = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-white/60 mb-6">
            Connect your Solana wallet to start trading Token-2022 with Transfer Hooks
          </p>
          <CustomWalletButton />
          
          {/* Wallet Features */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-white/60">
              <Shield className="w-4 h-4" />
              <span>Secure & Non-custodial</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-white/60">
              <Zap className="w-4 h-4" />
              <span>Lightning fast transactions</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-white/60">
              <Users className="w-4 h-4" />
              <span>KYC & Compliance ready</span>
            </div>
          </div>

          {/* Supported Wallets */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-white/40 text-sm mb-2">Supported Wallets:</p>
            <div className="flex items-center justify-center gap-3 text-xs text-white/50">
              <span>Phantom</span>
              <span>•</span>
              <span>Solflare</span>
              <span>•</span>
              <span>Coinbase</span>
              <span>•</span>
              <span>Trust</span>
            </div>
          </div>

          {/* Network Info */}
          <div className="mt-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 text-blue-300 text-sm">
                <Info className="w-4 h-4" />
                <span>Running on Solana Devnet</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ========== EMPTY POOLS STATE ==========
export const EmptyPools: React.FC<EmptyPoolsProps> = ({
  availableTokens,
  onCreateFirstPool,
  loading = false
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Droplets className="w-5 h-5" />
          Liquidity Pools
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingState message="Loading pools..." />
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Droplets className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-white font-medium mb-2">No Liquidity Pools Yet</h3>
            <p className="text-white/60 text-sm mb-6">
              Create the first liquidity pool to enable trading between tokens with transfer hooks
            </p>
            
            {availableTokens.length >= 2 ? (
              <div className="space-y-4">
                <Button
                  onClick={onCreateFirstPool}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Pool
                </Button>
                
                {/* Available Token Preview */}
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-white/60 text-xs mb-2">Available for pooling:</p>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    {availableTokens.slice(0, 3).map((token, index) => (
                      <div key={token.mint} className="flex items-center gap-1">
                        <span className="text-white">{token.symbol}</span>
                        {token.hasHooks && <Shield className="w-3 h-3 text-orange-400" />}
                        {index < Math.min(availableTokens.length - 1, 2) && (
                          <span className="text-white/40 mx-1">•</span>
                        )}
                      </div>
                    ))}
                    {availableTokens.length > 3 && (
                      <span className="text-white/40">+{availableTokens.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-orange-300 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Insufficient Tokens</span>
                  </div>
                  <p className="text-orange-200/80 text-sm">
                    You need at least 2 tokens to create a pool. Create some tokens first in the "Create" tab.
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => window.location.hash = '#create'}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Tokens First
                </Button>
              </div>
            )}

            {/* Pool Benefits */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="text-white/80 text-sm font-medium mb-4">Why Create Pools?</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-300 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-medium">Earn Fees</span>
                  </div>
                  <p className="text-green-200/80">Collect trading fees from every swap</p>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-300 mb-1">
                    <Shield className="w-3 h-3" />
                    <span className="font-medium">Hook Support</span>
                  </div>
                  <p className="text-blue-200/80">Full Token-2022 + Transfer Hooks</p>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-300 mb-1">
                    <Users className="w-3 h-3" />
                    <span className="font-medium">KYC Ready</span>
                  </div>
                  <p className="text-purple-200/80">Automatic compliance enforcement</p>
                </div>
                
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-orange-300 mb-1">
                    <Zap className="w-3 h-3" />
                    <span className="font-medium">First Mover</span>
                  </div>
                  <p className="text-orange-200/80">Be first in Hook ecosystem</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ========== EMPTY CREATED TOKENS STATE ==========
export const EmptyCreatedTokens: React.FC<EmptyCreatedTokensProps> = ({
  onFillExampleData,
  onCreateToken,
  loading = false
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Start Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingState message="Loading tokens..." size="sm" />
        ) : (
          <div className="space-y-6">
            {/* Quick Start Actions */}
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Code className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-white font-medium mb-2">Try Example Token</h3>
              <p className="text-white/60 text-sm mb-4">
                Fill the form with sample data to quickly test token creation
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={onFillExampleData}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Fill Example
                </Button>
                {onCreateToken && (
                  <Button
                    onClick={onCreateToken}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2 " />
                    Create Now
                  </Button>
                )}
              </div>
            </div>

            {/* Token Creation Steps */}
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Token Creation Steps
              </h4>
              <div className="space-y-3">
                {[
                  { step: 1, title: "Basic Info", desc: "Enter token name, symbol, and supply", icon: "📝" },
                  { step: 2, title: "Choose Hook", desc: "Select KYC, Whitelist, or No Hook", icon: "🔗" },
                  { step: 3, title: "Configure", desc: "Set decimals and advanced options", icon: "⚙️" },
                  { step: 4, title: "Deploy", desc: "Sign transaction and deploy to Solana", icon: "🚀" }
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 bg-purple-500/20 text-purple-300 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{item.title}</span>
                        <span>{item.icon}</span>
                      </div>
                      <p className="text-white/60 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hook Types Information */}
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Transfer Hook Types
              </h4>
              <div className="space-y-2">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-orange-400" />
                    <span className="font-medium text-orange-300 text-sm">KYC Hook</span>
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">Compliance</span>
                  </div>
                  <p className="text-orange-200/80 text-xs">
                    Requires user verification for all transfers. Perfect for regulated assets and securities.
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-orange-300">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Automatic KYC validation</span>
                  </div>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="font-medium text-blue-300 text-sm">Whitelist Hook</span>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Access Control</span>
                  </div>
                  <p className="text-blue-200/80 text-xs">
                    Only approved addresses can transfer. Ideal for private tokens and restricted distributions.
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-300">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Granular access control</span>
                  </div>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="font-medium text-green-300 text-sm">No Hook</span>
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Standard</span>
                  </div>
                  <p className="text-green-200/80 text-xs">
                    Standard Token-2022 without restrictions. Maximum compatibility with existing tools.
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-300">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Universal compatibility</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Information */}
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Creation Costs
              </h4>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-white/60">Token Creation:</p>
                    <p className="text-white">~0.01 SOL</p>
                  </div>
                  <div>
                    <p className="text-white/60">Network:</p>
                    <p className="text-white">Solana Devnet</p>
                  </div>
                  <div>
                    <p className="text-white/60">Standard:</p>
                    <p className="text-white">Token-2022</p>
                  </div>
                  <div>
                    <p className="text-white/60">Time:</p>
                    <p className="text-white">~30 seconds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ========== LOADING STATE ==========
export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading...", 
  size = "md",
  showSpinner = true 
}) => {
  const sizeClasses = {
    sm: "py-4",
    md: "py-8", 
    lg: "py-12"
  };

  const spinnerSizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className={`text-center ${sizeClasses[size]}`}>
      {showSpinner && (
        <div className={`animate-spin rounded-full border-b-2 border-white/20 mx-auto mb-4 ${spinnerSizes[size]}`}></div>
      )}
      <p className="text-white/60">{message}</p>
    </div>
  );
};

// ========== ERROR STATE ==========
interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  showDetails?: boolean;
  errorDetails?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  onGoBack,
  showDetails = false,
  errorDetails
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-white font-medium mb-2">{title}</h3>
        <p className="text-white/60 text-sm mb-6">{message}</p>
        
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          {onGoBack && (
            <Button
              onClick={onGoBack}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Go Back
            </Button>
          )}
        </div>

        {showDetails && errorDetails && (
          <details className="mt-6 text-left">
            <summary className="text-white/80 text-sm cursor-pointer mb-2">
              Error Details
            </summary>
            <div className="bg-black/20 rounded-lg p-3 text-xs text-red-400 font-mono">
              {errorDetails}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

// ========== EMPTY TRANSACTIONS STATE ==========
interface EmptyTransactionsProps {
  onCreateFirst?: () => void;
  showCreateButton?: boolean;
}

export const EmptyTransactions: React.FC<EmptyTransactionsProps> = ({
  onCreateFirst,
  showCreateButton = true
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <History className="w-5 h-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-white font-medium mb-2">No Transactions Yet</h3>
          <p className="text-white/60 text-sm mb-6">
            Your transaction history will appear here once you start trading
          </p>
          
          {showCreateButton && onCreateFirst && (
            <Button
              onClick={onCreateFirst}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Make First Transaction
            </Button>
          )}

          {/* Transaction Types Info */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h4 className="text-white/80 text-sm font-medium mb-3">Track Everything</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <Coins className="w-3 h-3" />
                <span>Token Creation</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-3 h-3" />
                <span>Pool Creation</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                <span>Swaps & Trades</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                <span>Hook Validations</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ========== EMPTY SEARCH RESULTS ==========
interface EmptySearchResultsProps {
  query: string;
  onClearSearch: () => void;
  suggestions?: string[];
}

export const EmptySearchResults: React.FC<EmptySearchResultsProps> = ({
  query,
  onClearSearch,
  suggestions = []
}) => {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-white font-medium mb-2">No Results Found</h3>
      <p className="text-white/60 text-sm mb-4">
        No results found for "<span className="text-white font-medium">{query}</span>"
      </p>
      
      <Button
        onClick={onClearSearch}
        variant="outline"
        size="sm"
        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        <XCircle className="w-4 h-4 mr-2" />
        Clear Search
      </Button>

      {suggestions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-white/60 text-sm mb-2">Try searching for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {/* Handle suggestion click */}}
                className="text-xs bg-white/10 text-white/80 px-3 py-1 rounded-full hover:bg-white/20 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ========== MAINTENANCE MODE ==========
interface MaintenanceModeProps {
  title?: string;
  message?: string;
  estimatedTime?: string;
  showProgress?: boolean;
}

export const MaintenanceMode: React.FC<MaintenanceModeProps> = ({
  title = "Maintenance in Progress",
  message = "We're currently performing scheduled maintenance to improve your experience.",
  estimatedTime,
  showProgress = false
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
          <p className="text-white/60 mb-6">{message}</p>
          
          {estimatedTime && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center gap-2 text-orange-300 text-sm">
                <Clock className="w-4 h-4" />
                <span>Estimated time: {estimatedTime}</span>
              </div>
            </div>
          )}

          {showProgress && (
            <div className="w-full bg-white/10 rounded-full h-2 mb-4">
              <div className="bg-orange-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}

          <div className="space-y-2 text-sm text-white/60">
            <p>• Smart contracts remain secure</p>
            <p>• No funds are affected</p>
            <p>• Normal service will resume shortly</p>
          </div>

          <div className="mt-6">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ========== COMING SOON ==========
interface ComingSoonProps {
  featureName: string;
  description?: string;
  estimatedLaunch?: string;
  onNotifyMe?: () => void;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  featureName,
  description,
  estimatedLaunch,
  onNotifyMe
}) => {
  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-white font-medium mb-2">{featureName}</h3>
        <p className="text-white/60 text-sm mb-6">
          {description || `${featureName} is coming soon to HookSwap!`}
        </p>
        
        {estimatedLaunch && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center gap-2 text-purple-300 text-sm">
              <Clock className="w-4 h-4" />
              <span>Expected: {estimatedLaunch}</span>
            </div>
          </div>
        )}

        {onNotifyMe && (
          <Button
            onClick={onNotifyMe}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Notify Me When Ready
          </Button>
        )}
      </CardContent>
    </Card>
  );
};