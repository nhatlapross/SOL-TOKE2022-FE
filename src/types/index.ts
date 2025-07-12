//hookswap-frontend\src\types\index.ts
import { PublicKey } from '@solana/web3.js';

// Token interface for type safety
export interface Token {
  mint: string;
  symbol: string;
  name: string;
  hasHooks: boolean;
  balance: string;
  decimals: number;
  hookType?: string;
}

// Hook types
export type HookType = 'kyc' | 'whitelist' | 'none';

// Token creation parameters
export interface TokenCreateParams {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  hookType?: HookType;
}

// Swap parameters
export interface SwapParams {
  fromToken: string;
  toToken: string;
  amount: number;
  slippage: number;
}

// Pool creation parameters
export interface PoolCreateParams {
  tokenA: string;
  tokenB: string;
  amountA: number;
  amountB: number;
}

// Dashboard state interface
export interface DashboardState {
  loading: boolean;
  balance: number | null;
  kycStatus: boolean | null;
  availableTokens: Token[];
  userTokens: Token[];
}

// Form states
export interface TokenFormState {
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: string;
  totalSupply: string;
  selectedHookType: string;
}

export interface SwapFormState {
  swapFromAmount: string;
  swapToAmount: string;
  selectedFromToken: string;
  selectedToToken: string;
}

export interface PoolFormState {
  poolTokenA: string;
  poolTokenB: string;
  liquidityAmountA: string;
  liquidityAmountB: string;
}

// Component props
export interface WalletInfoCardProps {
  publicKey: PublicKey | null;
  wallet: any;
  balance: number | null;
  disconnect: () => Promise<void>;
  copyToClipboard: (text: string) => void;
}

export interface BalanceCardProps {
  balance: number | null;
}

export interface KYCStatusCardProps {
  kycStatus: boolean | null;
}

export interface TokenListProps {
  tokens: Token[];
  title: string;
  loading?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export interface SwapFormProps {
  availableTokens: Token[];
  formState: SwapFormState;
  setFormState: React.Dispatch<React.SetStateAction<SwapFormState>>;
  onSwap: () => Promise<void>;
  loading: boolean;
}

export interface PoolFormProps {
  availableTokens: Token[];
  formState: PoolFormState;
  setFormState: React.Dispatch<React.SetStateAction<PoolFormState>>;
  onCreatePool: () => Promise<void>;
  loading: boolean;
}

export interface TokenCreateFormProps {
  formState: TokenFormState;
  setFormState: React.Dispatch<React.SetStateAction<TokenFormState>>;
  onCreateToken: () => Promise<void>;
  loading: boolean;
  balance: number | null;
}

export interface ProgramIDsProps {
  copyToClipboard: (text: string) => void;
}

export interface DevelopmentToolsProps {
  publicKey: PublicKey | null;
  copyToClipboard: (text: string) => void;
}