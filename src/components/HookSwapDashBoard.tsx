import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, Droplets, Plus, ExternalLink, CheckCircle, AlertTriangle, Loader2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  RealHookSwapSDK,
  type TokenAccount,
  type CreateTokenParams as SDKCreateTokenParams,
  type SwapParams as SDKSwapParams,
  type PoolCreateParams as SDKPoolCreateParams
} from '@/lib/RealHookSwapSDK';
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
  Pool,
  TransactionHistory,
  UserSettings,
  Notification
} from '@/types';

const HookSwapDashboard = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, wallet, disconnect } = useWallet();

  // ✅ Initialize REAL SDK
  const [sdk, setSdk] = useState<RealHookSwapSDK | null>(null);
  const [programsValidated, setProgramsValidated] = useState<{ [key: string]: boolean } | null>(null);

  // Main dashboard state
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    loading: false,
    balance: null,
    kycStatus: null,
    availableTokens: [],
    userTokens: [],
    pools: [],
    transactions: [],
    notifications: [],
    settings: {
      slippageTolerance: 1.0,
      autoApprove: false,
      showTestTokens: true,
      defaultRpcEndpoint: 'https://api.devnet.solana.com',
      theme: 'dark',
      language: 'en',
      notifications: {
        transactions: true,
        priceAlerts: false,
        poolUpdates: true,
      }
    }
  });

  // Tab state
  const [activeTab, setActiveTab] = useState('swap');

  // Form states
  const [tokenFormState, setTokenFormState] = useState<TokenFormState>({
    tokenName: '',
    tokenSymbol: '',
    tokenDecimals: '9',
    totalSupply: '',
    selectedHookType: '',
    description: '',
    imageUrl: '',
    website: '',
    twitter: '',
    discord: ''
  });

  const [swapFormState, setSwapFormState] = useState<SwapFormState>({
    swapFromAmount: '',
    swapToAmount: '',
    selectedFromToken: '',
    selectedToToken: '',
    slippageTolerance: 1.0,
    priceImpact: undefined,
    minimumReceived: undefined,
    tradingFee: undefined
  });

  const [poolFormState, setPoolFormState] = useState<PoolFormState>({
    poolTokenA: '',
    poolTokenB: '',
    liquidityAmountA: '',
    liquidityAmountB: '',
    shareOfPool: undefined,
    priceAPerB: undefined,
    priceBPerA: undefined,
    poolExists: false
  });

  // ✅ Initialize REAL SDK when wallet connects
  useEffect(() => {
    if (connected && wallet && connection) {
      console.log('🚀 Initializing Real SDK...');
      const newSdk = new RealHookSwapSDK(connection, wallet.adapter);
      setSdk(newSdk);

      // Validate programs immediately
      newSdk.validatePrograms()
        .then(results => {
          setProgramsValidated(results);
          const allValid = Object.values(results).every(valid => valid);
          if (allValid) {
            toast.success('All programs validated successfully!');
          } else {
            toast.error('Some programs are not deployed correctly');
          }
        })
        .catch(error => {
          console.error('Program validation failed:', error);
          toast.error('Failed to validate programs');
        });
    } else {
      setSdk(null);
      setProgramsValidated(null);
    }
  }, [connected, wallet, connection]);

  // ✅ Get SOL balance
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

  // ✅ Get REAL user data when SDK is ready
  useEffect(() => {
    if (publicKey && connection && sdk) {
      // Check REAL KYC status
      sdk.checkKYCStatus(publicKey)
        .then(status => {
          setDashboardState(prev => ({ ...prev, kycStatus: status }));
          console.log('✅ KYC Status:', status);
        })
        .catch(error => {
          console.warn('KYC check failed:', error);
          setDashboardState(prev => ({ ...prev, kycStatus: false }));
        });

      // Get REAL token accounts
      sdk.getUserTokenAccounts()
        .then(tokenAccounts => {
          const processedTokens = processTokenAccounts(tokenAccounts, dashboardState.balance);
          setDashboardState(prev => ({
            ...prev,
            availableTokens: processedTokens,
            userTokens: processedTokens
          }));
          console.log('✅ Token accounts loaded:', processedTokens.length);
        })
        .catch(error => {
          console.warn('Failed to fetch token accounts:', error);
          const solOnly = createSOLOnlyTokens(dashboardState.balance);
          setDashboardState(prev => ({
            ...prev,
            availableTokens: solOnly,
            userTokens: solOnly
          }));
        });
    }
  }, [publicKey, connection, sdk]);

  // ✅ Process REAL token accounts to match new Token interface
  const processTokenAccounts = (tokenAccounts: TokenAccount[], solBalance?: number | null): Token[] => {
    const solToken: Token = {
      mint: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      hasHooks: false,
      balance: (solBalance || 0).toString(),
      decimals: 9,
      hookType: 'None',
      verified: true,
      isActive: true,
      creator: 'Solana Labs',
      totalSupply: '∞',
      logoUri: undefined
    };

    const processedTokens: Token[] = tokenAccounts.map(account => ({
      mint: account.mint,
      symbol: 'UNKNOWN',
      name: `Token ${account.mint.slice(0, 8)}`,
      hasHooks: false,
      balance: (parseFloat(account.amount) / Math.pow(10, account.decimals)).toString(),
      decimals: account.decimals,
      hookType: 'None',
      verified: false,
      isActive: true,
      creator: undefined,
      totalSupply: undefined,
      logoUri: undefined
    }));

    return [solToken, ...processedTokens];
  };

  const createSOLOnlyTokens = (solBalance?: number | null): Token[] => {
    return [{
      mint: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      hasHooks: false,
      balance: (solBalance || 0).toString(),
      decimals: 9,
      hookType: 'None',
      verified: true,
      isActive: true,
      creator: 'Solana Labs',
      totalSupply: '∞',
      logoUri: undefined
    }];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const openInExplorer = (signature: string) => {
    window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank');
  };

  // ========== DEBUG HANDLERS ==========

  const handleTestBasicTransaction = async () => {
    if (!sdk) {
      toast.error('SDK not initialized');
      return;
    }

    setDashboardState(prev => ({ ...prev, loading: true }));

    try {
      console.log('🧪 Starting basic transaction test...');
      const signature = await sdk.testBasicTransaction();

      toast.success(
        <div className="flex items-center gap-2">
          <span>✅ Basic transaction successful!</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openInExplorer(signature)}
            className="ml-2"
          >
            View
          </Button>
        </div>
      );

    } catch (error: any) {
      console.error('❌ Basic transaction failed:', error);
      toast.error(`Basic transaction failed: ${error.message}`);
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDebugNetwork = async () => {
    if (!sdk) {
      toast.error('SDK not initialized');
      return;
    }

    try {
      await sdk.debugNetworkInfo();
      toast.success('Network info logged to console');
    } catch (error: any) {
      console.error('❌ Network debug failed:', error);
      toast.error(`Network debug failed: ${error.message}`);
    }
  };

  const handleTestTokenAccount = async () => {
    if (!sdk) {
      toast.error('SDK not initialized');
      return;
    }

    setDashboardState(prev => ({ ...prev, loading: true }));

    try {
      console.log('🧪 Starting token account test...');
      const signature = await sdk.testCreateTokenAccount();

      toast.success(
        <div className="flex items-center gap-2">
          <span>✅ Token account creation successful!</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openInExplorer(signature)}
            className="ml-2"
          >
            View
          </Button>
        </div>
      );

    } catch (error: any) {
      console.error('❌ Token account creation failed:', error);
      toast.error(`Token account creation failed: ${error.message}`);
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleTestSimpleToken = async () => {
    if (!sdk) {
      toast.error('SDK not initialized');
      return;
    }

    setDashboardState(prev => ({ ...prev, loading: true }));

    try {
      console.log('🧪 Starting simple token test...');
      const signature = await sdk.testSimpleTokenCreation({
        name: 'Test Token',
        symbol: 'TEST'
      });

      toast.success(
        <div className="flex items-center gap-2">
          <span>✅ Simple token creation successful!</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openInExplorer(signature)}
            className="ml-2"
          >
            View
          </Button>
        </div>
      );

    } catch (error: any) {
      console.error('❌ Simple token creation failed:', error);
      toast.error(`Simple token creation failed: ${error.message}`);
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRunHealthCheck = async () => {
    if (!sdk) {
      toast.error('SDK not initialized');
      return;
    }

    try {
      console.log('🏥 Running comprehensive health check...');
      const results = await sdk.runHealthCheck();

      if (results.overall) {
        toast.success('✅ All systems healthy! Check console for details.');
      } else {
        toast.error('❌ Some issues detected. Check console for details.');
      }

    } catch (error: any) {
      console.error('❌ Health check failed:', error);
      toast.error(`Health check failed: ${error.message}`);
    }
  };

  const handleCheckPrograms = async () => {
    if (!sdk) {
      toast.error('SDK not initialized');
      return;
    }

    try {
      const results = await sdk.checkProgramDeployment();
      setProgramsValidated(results);

      const deployedCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;

      toast.success(`Programs checked: ${deployedCount}/${totalCount} deployed`);

    } catch (error: any) {
      console.error('❌ Program check failed:', error);
      toast.error(`Program check failed: ${error.message}`);
    }
  };

  const handleTestSimpleTokenCreation = async () => {
    if (!sdk) {
      toast.error('SDK not initialized');
      return;
    }

    setDashboardState(prev => ({ ...prev, loading: true }));

    try {
      console.log('🧪 Starting simple token creation test...');
      const signature = await sdk.createTokenWithHooksSimple({
        name: 'Simple Test Token',
        symbol: 'SIMPLE',
        decimals: 9,
        totalSupply: 1000000,
        hookType: 'none'
      });

      toast.success(
        <div className="flex items-center gap-2">
          <span>✅ Simple token creation successful!</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openInExplorer(signature)}
            className="ml-2"
          >
            View
          </Button>
        </div>
      );

    } catch (error: any) {
      console.error('❌ Simple token creation failed:', error);
      toast.error(`Simple token creation failed: ${error.message}`);
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleTestDebugMode = async () => {
    if (!sdk) {
      toast.error('SDK not initialized');
      return;
    }

    setDashboardState(prev => ({ ...prev, loading: true }));

    try {
      console.log('🐛 Starting debug mode test...');
      const signature = await sdk.createTokenDebugMode({
        name: 'Debug Token',
        symbol: 'DEBUG',
        decimals: 9,
        totalSupply: 1000000,
        hookType: 'none'
      });

      toast.success(
        <div className="flex items-center gap-2">
          <span>✅ Debug mode test successful!</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openInExplorer(signature)}
            className="ml-2"
          >
            View
          </Button>
        </div>
      );

    } catch (error: any) {
      console.error('❌ Debug mode test failed:', error);
      toast.error(`Debug mode test failed: ${error.message}`);
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  };

  // ========== ORIGINAL HANDLERS ==========

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
      console.log('🏗️ Creating REAL token...');

      const tokenParams: SDKCreateTokenParams = {
        name: tokenFormState.tokenName,
        symbol: tokenFormState.tokenSymbol,
        decimals: parseInt(tokenFormState.tokenDecimals),
        totalSupply: parseFloat(tokenFormState.totalSupply),
        hookType: (tokenFormState.selectedHookType as 'kyc' | 'whitelist' | 'none') || 'none',
        description: tokenFormState.description,
        image: tokenFormState.imageUrl,
        externalUrl: tokenFormState.website,
        properties: {
          twitter: tokenFormState.twitter,
          discord: tokenFormState.discord
        }
      };

      const signature = await sdk.createTokenWithHooks(tokenParams);

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
        selectedHookType: '',
        description: '',
        imageUrl: '',
        website: '',
        twitter: '',
        discord: ''
      });

      // Refresh token list
      if (sdk && publicKey) {
        sdk.getUserTokenAccounts().then(accounts => {
          const processed = processTokenAccounts(accounts, dashboardState.balance);
          setDashboardState(prev => ({
            ...prev,
            availableTokens: processed,
            userTokens: processed
          }));
        });
      }

    } catch (error: any) {
      console.error('❌ REAL token creation failed:', error);
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

      console.log('🔄 Executing REAL swap...');

      const amount = parseFloat(swapFormState.swapFromAmount);
      const estimatedOut = parseFloat(swapFormState.swapToAmount || '0');
      const slippage = swapFormState.slippageTolerance || 1.0;
      const minimumAmountOut = estimatedOut * (1 - slippage / 100);

      const swapParams: SDKSwapParams = {
        tokenA: fromToken.mint,
        tokenB: toToken.mint,
        amountIn: amount,
        minimumAmountOut: minimumAmountOut,
        aToB: true,
        slippageTolerance: slippage,
        deadline: undefined
      };

      const signature = await sdk.executeSwap(swapParams);

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

      setSwapFormState(prev => ({
        ...prev,
        swapFromAmount: '',
        swapToAmount: ''
      }));

      if (sdk && publicKey) {
        setTimeout(() => {
          connection.getBalance(publicKey).then(balance => {
            setDashboardState(prev => ({ ...prev, balance: balance / 1e9 }));
          });
        }, 2000);
      }

    } catch (error: any) {
      console.error('❌ REAL swap failed:', error);
      toast.error(`Swap failed: ${error.message || 'Unknown error'}`);
    } finally {
      setDashboardState(prev => ({ ...prev, loading: false }));
    }
  };

  // ========== CONTINUE POOL HANDLER ==========
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

      console.log('🏊 Creating REAL pool...');

      const amountA = parseFloat(poolFormState.liquidityAmountA);
      const amountB = parseFloat(poolFormState.liquidityAmountB);
      const initialPrice = amountB / amountA;

      const poolParams: SDKPoolCreateParams = {
        tokenA: tokenA.mint,
        tokenB: tokenB.mint,
        initialPrice: initialPrice,
        feeRate: undefined,
        ampFactor: undefined
      };

      const signature = await sdk.createPool(poolParams);

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

      setPoolFormState({
        poolTokenA: '',
        poolTokenB: '',
        liquidityAmountA: '',
        liquidityAmountB: '',
        shareOfPool: undefined,
        priceAPerB: undefined,
        priceBPerA: undefined,
        poolExists: false
      });

    } catch (error: any) {
      console.error('❌ REAL pool creation failed:', error);
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
      selectedHookType: 'none',
      description: 'A sample token created with HookSwap AMM for testing purposes',
      imageUrl: '',
      website: 'https://hookswap.example.com',
      twitter: '',
      discord: ''
    });
  };

  // Render wallet not connected state
  if (!connected) {
    return <WalletNotConnected />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Program Status */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">HookSwap AMM</h1>
          <p className="text-blue-200">Trade Token-2022 with Transfer Hooks on Solana Devnet</p>

          {/* ✅ Program Status Indicator */}
          {programsValidated && (
            <div className="mt-3 flex items-center justify-center gap-2">
              {Object.values(programsValidated).every(valid => valid) ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">All programs validated</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Some programs not found</span>
                </>
              )}
            </div>
          )}
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
        <ProgramIDsCard
          copyToClipboard={copyToClipboard}
          programsValidated={programsValidated}
          showValidationStatus={true}
        />

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
                quoteLoading={false}
                onGetQuote={undefined}
              />
              <TokenList
                tokens={dashboardState.availableTokens}
                title="Your Tokens"
                loading={dashboardState.availableTokens.length === 0}
                emptyMessage="Loading your tokens..."
                showBalances={true}
                showHookIcons={true}
                maxItems={10}
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
                existingPools={dashboardState.pools}
              />
              <EmptyPools
                availableTokens={dashboardState.availableTokens}
                onCreateFirstPool={handleCreateFirstPool}
                loading={dashboardState.loading}
              />
            </div>
          </TabsContent>

          {/* Create Token Tab with Debug Panel */}
          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Debug Panel + Token Create Form */}
              <div className="space-y-6">
                {/* ✅ DEBUG PANEL - Only in development */}
                {process.env.NODE_ENV === 'development' && (
                  <Card className="bg-red-500/10 backdrop-blur-md border-red-500/20">
                    <CardHeader>
                      <CardTitle className="text-red-300 text-sm flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        🔧 Debug Panel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <Button
                          onClick={handleDebugNetwork}
                          variant="outline"
                          size="sm"
                          className="bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                        >
                          🔍 Check Network
                        </Button>

                        <Button
                          onClick={handleTestBasicTransaction}
                          variant="outline"
                          size="sm"
                          className="bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
                          disabled={dashboardState.loading}
                        >
                          {dashboardState.loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            '🧪 Test Basic TX'
                          )}
                        </Button>

                        <Button
                          onClick={handleTestTokenAccount}
                          variant="outline"
                          size="sm"
                          className="bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30"
                          disabled={dashboardState.loading}
                        >
                          {dashboardState.loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            '🪙 Test Account'
                          )}
                        </Button>

                        <Button
                          onClick={handleTestSimpleToken}
                          variant="outline"
                          size="sm"
                          className="bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                          disabled={dashboardState.loading}
                        >
                          {dashboardState.loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            '🚀 Test Token'
                          )}
                        </Button>
                      </div>

                      {/* NEW: Additional debug row */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <Button
                          onClick={handleTestSimpleTokenCreation}
                          variant="outline"
                          size="sm"
                          className="bg-teal-500/20 border-teal-500/30 text-teal-300 hover:bg-teal-500/30"
                          disabled={dashboardState.loading}
                        >
                          {dashboardState.loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            '💎 Simple Token'
                          )}
                        </Button>

                        <Button
                          onClick={handleTestDebugMode}
                          variant="outline"
                          size="sm"
                          className="bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
                          disabled={dashboardState.loading}
                        >
                          {dashboardState.loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            '🐛 Debug Mode'
                          )}
                        </Button>
                      </div>

                      {/* Advanced Debug Row */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <Button
                          onClick={handleCheckPrograms}
                          variant="outline"
                          size="sm"
                          className="bg-indigo-500/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30"
                        >
                          📦 Check Programs
                        </Button>

                        <Button
                          onClick={handleRunHealthCheck}
                          variant="outline"
                          size="sm"
                          className="bg-cyan-500/20 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30"
                        >
                          🏥 Health Check
                        </Button>
                      </div>

                      <p className="text-red-200/60 text-xs">
                        Use these buttons to debug step by step. Check console for detailed logs.
                      </p>

                      {/* Debug Status */}
                      <div className="mt-3 pt-3 border-t border-red-500/20">
                        <p className="text-red-200/80 text-xs mb-2">Test Progress:</p>
                        <div className="text-xs space-y-1">
                          <div className="text-green-400">✅ All basic checks passed</div>
                          <div className="text-orange-400">⚠️ Custom program instruction failed</div>
                          <div className="text-blue-400">🔄 Testing simplified approaches...</div>
                        </div>
                      </div>

                      {/* Program Status */}
                      {programsValidated && (
                        <div className="mt-3 pt-3 border-t border-red-500/20">
                          <p className="text-red-200/80 text-xs mb-2">Program Status:</p>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {Object.entries(programsValidated).map(([name, status]) => (
                              <div key={name} className="flex items-center gap-1">
                                <span className={status ? 'text-green-400' : 'text-red-400'}>
                                  {status ? '✅' : '❌'}
                                </span>
                                <span className="text-red-200/60 truncate">
                                  {name.replace('_', ' ')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Original TokenCreateForm */}
                <TokenCreateForm
                  formState={tokenFormState}
                  setFormState={setTokenFormState}
                  onCreateToken={handleCreateToken}
                  loading={dashboardState.loading}
                  balance={dashboardState.balance}
                  validateForm={true}
                />
              </div>

              {/* Right Column - Additional Cards */}
              <div className="space-y-6">
                <EmptyCreatedTokens
                  onFillExampleData={handleFillExampleData}
                  onCreateToken={handleCreateToken}
                  loading={dashboardState.loading}
                />

                <DevelopmentTools
                  publicKey={publicKey}
                  copyToClipboard={copyToClipboard}
                  programsValidated={programsValidated}
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