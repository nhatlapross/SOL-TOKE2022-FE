import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Droplets, Plus, ExternalLink, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { HookSwapSDK } from '@/lib/HookSwapSDK';
import { PublicKey } from '@solana/web3.js';

// Import all components
import WalletInfoCard from '@/components/cards/WalletInfoCard';
import BalanceCard from '@/components/cards/BalanceCard';
import KYCStatusCard from '@/components/cards/KYCStatusCard';
import ProgramIDsCard from '@/components/cards/ProgramIDsCard';
import TokenList from '@/components/tokens/TokenList';
import SwapForm from '@/components/forms/SwapForm';
import PoolForm from '@/components/forms/PoolForm';
import TokenCreateForm from '@/components/forms/TokenCreateForm';
import DevelopmentTools from '@/components/tools/DevelopmentTools';
import { EmptyPools, EmptyCreatedTokens, WalletNotConnected } from '@/components/empty-states/EmptyStates';

// Import types
import type {
  Token,
  DashboardState,
  TokenFormState,
  SwapFormState,
  PoolFormState,
  TokenCreateParams,
  SwapParams,
  PoolCreateParams
} from '@/types';

const HookSwapDashboard = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, wallet, disconnect } = useWallet();
  
  // Initialize SDK
  const [sdk, setSdk] = useState<HookSwapSDK | null>(null);
  
  // Main dashboard state
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    loading: false,
    balance: null,
    kycStatus: null,
    availableTokens: [],
    userTokens: []
  });

  // Tab state
  const [activeTab, setActiveTab] = useState('swap');
  
  // Form states
  const [tokenFormState, setTokenFormState] = useState<TokenFormState>({
    tokenName: '',
    tokenSymbol: '',
    tokenDecimals: '9',
    totalSupply: '',
    selectedHookType: ''
  });

  const [swapFormState, setSwapFormState] = useState<SwapFormState>({
    swapFromAmount: '',
    swapToAmount: '',
    selectedFromToken: '',
    selectedToToken: ''
  });

  const [poolFormState, setPoolFormState] = useState<PoolFormState>({
    poolTokenA: '',
    poolTokenB: '',
    liquidityAmountA: '',
    liquidityAmountB: ''
  });

  // Initialize SDK when wallet connects
  useEffect(() => {
    if (connected && wallet && connection) {
      const newSdk = new HookSwapSDK(connection, wallet.adapter);
      setSdk(newSdk);
    } else {
      setSdk(null);
    }
  }, [connected, wallet, connection]);

  // Get SOL balance
  useEffect(() => {
    if (publicKey && connection) {
      connection.getBalance(publicKey)
        .then(balance => {
          const solBalance = balance / 1e9;
          setDashboardState(prev => ({ ...prev, balance: solBalance }));
        })
        .catch(console.error);
    }
  }, [publicKey, connection]);

  // Get user data when SDK is ready
  useEffect(() => {
    if (publicKey && connection && sdk) {
      // Check KYC status using the correct SDK method
      sdk.checkRealKYCStatus(publicKey)
        .then(status => setDashboardState(prev => ({ ...prev, kycStatus: status })))
        .catch(() => setDashboardState(prev => ({ ...prev, kycStatus: false })));

      // Since there's no direct getUserTokenBalances method in the SDK,
      // we'll use a mock implementation for now
      // In a real implementation, you would fetch token accounts from the connection
      // and process them accordingly
      fetchUserTokens(publicKey)
        .then((realTokens) => {
          const processedTokens = processTokenData(realTokens, dashboardState.balance);
          setDashboardState(prev => ({
            ...prev,
            availableTokens: processedTokens,
            userTokens: processedTokens
          }));
        })
        .catch((error) => {
          console.warn('Failed to fetch token balances:', error);
          const solOnly = createSOLOnlyTokens(dashboardState.balance);
          setDashboardState(prev => ({
            ...prev,
            availableTokens: solOnly,
            userTokens: solOnly
          }));
        });
    }
  }, [publicKey, connection, sdk, dashboardState.balance]);

  // Mock function to fetch user tokens
  // In a real implementation, this would use the connection to get token accounts
  const fetchUserTokens = async (publicKey: PublicKey) => {
    // This is a placeholder - in reality, you would:
    // 1. Get all token accounts for the user
    // 2. Filter for Token-2022 accounts
    // 3. Get metadata for each token
    
    // For now, return just SOL
    return [];
  };

  // Update SOL balance in tokens when balance changes
  useEffect(() => {
    if (dashboardState.balance !== null) {
      setDashboardState(prev => ({
        ...prev,
        availableTokens: prev.availableTokens.map(token => 
          token.mint === 'So11111111111111111111111111111111111111112' 
            ? { ...token, balance: prev.balance!.toString() }
            : token
        ),
        userTokens: prev.userTokens.map(token => 
          token.mint === 'So11111111111111111111111111111111111111112' 
            ? { ...token, balance: prev.balance!.toString() }
            : token
        )
      }));
    }
  }, [dashboardState.balance]);

  // Helper functions
  const processTokenData = (realTokens: any[], solBalance?: number | null): Token[] => {
    const solToken: Token = {
      mint: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      hasHooks: false,
      balance: (solBalance || 0).toString(),
      decimals: 9
    };
    
    const filteredRealTokens = realTokens.filter(token => 
      token.mint !== 'So11111111111111111111111111111111111111112'
    );
    
    const processedRealTokens: Token[] = filteredRealTokens.map(token => ({
      mint: token.mint,
      symbol: token.symbol || 'UNKNOWN',
      name: token.name || token.symbol || 'Unknown Token',
      hasHooks: token.hasHooks || false,
      balance: token.balance?.toString() || token.amount?.toString() || '0',
      decimals: token.decimals || 9,
      hookType: token.hookType
    }));
    
    const tokensWithSol = [solToken, ...processedRealTokens];
    const uniqueTokens = tokensWithSol.filter((token, index, array) =>
      array.findIndex(t => t.mint === token.mint) === index
    );
    
    return uniqueTokens;
  };

  const createSOLOnlyTokens = (solBalance?: number | null): Token[] => {
    return [{
      mint: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      hasHooks: false,
      balance: (solBalance || 0).toString(),
      decimals: 9
    }];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const openInExplorer = (signature: string) => {
    window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank');
  };

  // Transaction handlers - Updated to use the correct SDK methods
  const handleCreateToken = async () => {
    if (!tokenFormState.tokenName || !tokenFormState.tokenSymbol || !tokenFormState.totalSupply || !sdk) {
      toast.error('Please fill all required fields');
      return;
    }

    if (dashboardState.balance !== null && dashboardState.balance < 0.01) {
      toast.error('Insufficient SOL balance for token creation');
      return;
    }

    setDashboardState(prev => ({ ...prev, loading: true }));
    try {
      // Use the correct SDK method: createTokenWithHooks instead of createToken
      const signature = await sdk.createTokenWithHooks({
        name: tokenFormState.tokenName,
        symbol: tokenFormState.tokenSymbol,
        decimals: parseInt(tokenFormState.tokenDecimals),
        totalSupply: parseFloat(tokenFormState.totalSupply),
        hookType: tokenFormState.selectedHookType as 'kyc' | 'whitelist' | 'none'
      });

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Token created successfully!</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openInExplorer(signature)}
            className="ml-2"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      );

      // Reset form
      setTokenFormState({
        tokenName: '',
        tokenSymbol: '',
        tokenDecimals: '9',
        totalSupply: '',
        selectedHookType: ''
      });
      
    } catch (error: any) {
      console.error('Token creation failed:', error);
      toast.error(`Token creation failed: ${error.message || 'Unknown error'}`);
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSwap = async () => {
    if (!swapFormState.swapFromAmount || !swapFormState.selectedFromToken || !swapFormState.selectedToToken || !sdk) {
      toast.error('Please fill all swap details');
      return;
    }

    if (swapFormState.selectedFromToken === swapFormState.selectedToToken) {
      toast.error('Cannot swap same token');
      return;
    }

    setDashboardState(prev => ({ ...prev, loading: true }));
    try {
      const fromToken = dashboardState.availableTokens.find(t => t.symbol === swapFormState.selectedFromToken);
      const toToken = dashboardState.availableTokens.find(t => t.symbol === swapFormState.selectedToToken);

      if (!fromToken || !toToken) {
        throw new Error('Token not found');
      }

      // Calculate minimum amount out with 1% slippage
      const amount = parseFloat(swapFormState.swapFromAmount);
      const minimumAmountOut = parseFloat(swapFormState.swapToAmount) * 0.99;

      // Use the correct SDK method: executeRealSwap instead of swap
      const signature = await sdk.executeRealSwap({
        tokenA: fromToken.mint,
        tokenB: toToken.mint,
        amountIn: amount,
        minimumAmountOut: minimumAmountOut,
        aToB: true // Assuming fromToken is tokenA, adjust as needed
      });

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Swap executed successfully!</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openInExplorer(signature)}
            className="ml-2"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      );

      // Reset form
      setSwapFormState(prev => ({
        ...prev,
        swapFromAmount: '',
        swapToAmount: ''
      }));
      
    } catch (error: any) {
      console.error('Swap failed:', error);
      toast.error(`Swap failed: ${error.message || 'Unknown error'}`);
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCreatePool = async () => {
    if (!poolFormState.poolTokenA || !poolFormState.poolTokenB || !poolFormState.liquidityAmountA || !poolFormState.liquidityAmountB || !sdk) {
      toast.error('Please fill all pool details');
      return;
    }

    if (poolFormState.poolTokenA === poolFormState.poolTokenB) {
      toast.error('Cannot create pool with same token');
      return;
    }

    setDashboardState(prev => ({ ...prev, loading: true }));
    try {
      const tokenA = dashboardState.availableTokens.find(t => t.symbol === poolFormState.poolTokenA);
      const tokenB = dashboardState.availableTokens.find(t => t.symbol === poolFormState.poolTokenB);

      if (!tokenA || !tokenB) {
        throw new Error('Token not found');
      }

      // Calculate initial price from the provided liquidity amounts
      const amountA = parseFloat(poolFormState.liquidityAmountA);
      const amountB = parseFloat(poolFormState.liquidityAmountB);
      const initialPrice = amountB / amountA;

      // Use the correct SDK method: createRealPool instead of createPool
      const signature = await sdk.createRealPool({
        tokenA: tokenA.mint,
        tokenB: tokenB.mint,
        initialPrice: initialPrice
      });

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Pool created successfully!</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openInExplorer(signature)}
            className="ml-2"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      );

      // Reset form
      setPoolFormState({
        poolTokenA: '',
        poolTokenB: '',
        liquidityAmountA: '',
        liquidityAmountB: ''
      });
      
    } catch (error: any) {
      console.error('Pool creation failed:', error);
      toast.error(`Pool creation failed: ${error.message || 'Unknown error'}`);
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  };

  // Helper action handlers
  const handleCreateFirstPool = () => {
    if (dashboardState.availableTokens.length >= 2) {
      setPoolFormState(prev => ({
        ...prev,
        poolTokenA: dashboardState.availableTokens[0]?.symbol || '',
        poolTokenB: dashboardState.availableTokens[1]?.symbol || ''
      }));
    }
  };

  const handleFillExampleData = () => {
    setTokenFormState({
      tokenName: 'My Sample Token',
      tokenSymbol: 'MST',
      tokenDecimals: '9',
      totalSupply: '1000000',
      selectedHookType: 'none'
    });
  };

  // Render wallet not connected state
  if (!connected) {
    return <WalletNotConnected />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">HookSwap AMM</h1>
          <p className="text-blue-200">Trade Token-2022 with Transfer Hooks on Solana Devnet</p>
        </div>

        {/* Status Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <WalletInfoCard
            publicKey={publicKey}
            wallet={wallet}
            balance={dashboardState.balance}
            disconnect={disconnect}
            copyToClipboard={copyToClipboard}
          />
          <BalanceCard balance={dashboardState.balance} />
          <KYCStatusCard kycStatus={dashboardState.kycStatus} />
        </div>

        {/* Program IDs Info */}
        {/* <ProgramIDsCard copyToClipboard={copyToClipboard} /> */}

        <div className="mb-6" />

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/10">
            <TabsTrigger value="swap" className="flex items-center gap-2 text-white">
              <ArrowUpDown className="w-4 h-4" />
              Swap
            </TabsTrigger>
            <TabsTrigger value="pool" className="flex items-center gap-2 text-white">
              <Droplets className="w-4 h-4" />
              Pool
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2 text-white">
              <Plus className="w-4 h-4" />
              Create
            </TabsTrigger>
          </TabsList>

          {/* Swap Tab */}
          <TabsContent value="swap">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SwapForm
                availableTokens={dashboardState.availableTokens}
                formState={swapFormState}
                setFormState={setSwapFormState}
                onSwap={handleSwap}
                loading={dashboardState.loading}
              />
              <TokenList
                tokens={dashboardState.availableTokens}
                title="Your Tokens"
                loading={dashboardState.availableTokens.length === 0}
                emptyMessage="Loading your tokens..."
              />
            </div>
          </TabsContent>

          {/* Pool Tab */}
          <TabsContent value="pool">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PoolForm
                availableTokens={dashboardState.availableTokens}
                formState={poolFormState}
                setFormState={setPoolFormState}
                onCreatePool={handleCreatePool}
                loading={dashboardState.loading}
              />
              <EmptyPools
                availableTokens={dashboardState.availableTokens}
                onCreateFirstPool={handleCreateFirstPool}
              />
            </div>
          </TabsContent>

          {/* Create Token Tab */}
          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Token Create Form */}
              <div>
                <TokenCreateForm
                  formState={tokenFormState}
                  setFormState={setTokenFormState}
                  onCreateToken={handleCreateToken}
                  loading={dashboardState.loading}
                  balance={dashboardState.balance}
                />
              </div>

              {/* Right Column - Additional Cards */}
              <div className="space-y-6">
                <EmptyCreatedTokens onFillExampleData={handleFillExampleData} />
                
                <DevelopmentTools
                  publicKey={publicKey}
                  copyToClipboard={copyToClipboard}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HookSwapDashboard;
