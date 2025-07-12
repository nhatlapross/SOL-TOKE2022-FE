//src/types/index.ts - Complete type definitions for HookSwap
import { PublicKey } from '@solana/web3.js';
import { ReactNode, Dispatch, SetStateAction } from 'react';

// ========== TOKEN TYPES ==========
export interface Token {
  mint: string;
  symbol: string;
  name: string;
  hasHooks: boolean;
  balance: string;
  decimals: number;
  hookType?: 'KYC' | 'Whitelist' | 'RateLimit' | 'Royalty' | 'Custom' | 'None';
  verified?: boolean;
  isActive?: boolean;
  creator?: string;
  totalSupply?: string;
  logoUri?: string;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  external_url?: string;
  creator?: string;
  totalSupply?: number;
  decimals?: number;
  tags?: string[];
  properties?: {
    category?: string;
    files?: Array<{
      uri: string;
      type: string;
    }>;
  };
}

export interface TokenAccount {
  mint: string;
  owner: string;
  amount: string;
  decimals: number;
  address: string;
  isNative?: boolean;
  rentExemptReserve?: string;
  delegatedAmount?: string;
  delegate?: string;
  state: 'initialized' | 'uninitialized' | 'frozen';
  closeAuthority?: string;
}

export interface TokenBalance {
  mint: string;
  balance: number;
  uiAmount: number;
  decimals: number;
  formatted: string;
}

// ========== FORM STATE TYPES ==========
export interface TokenFormState {
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: string;
  totalSupply: string;
  selectedHookType: string;
  description?: string;
  imageUrl?: string;
  website?: string;
  twitter?: string;
  discord?: string;
}

export interface SwapFormState {
  swapFromAmount: string;
  swapToAmount: string;
  selectedFromToken: string;
  selectedToToken: string;
  slippageTolerance: number;
  priceImpact?: number;
  minimumReceived?: string;
  tradingFee?: string;
}

export interface PoolFormState {
  poolTokenA: string;
  poolTokenB: string;
  liquidityAmountA: string;
  liquidityAmountB: string;
  shareOfPool?: number;
  priceAPerB?: number;
  priceBPerA?: number;
  poolExists?: boolean;
}

export interface LiquidityFormState {
  poolAddress: string;
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  lpTokensToReceive?: string;
  shareOfPool?: number;
  action: 'add' | 'remove';
}

// ========== DASHBOARD STATE ==========
export interface DashboardState {
  loading: boolean;
  balance: number | null;
  kycStatus: boolean | null;
  availableTokens: Token[];
  userTokens: Token[];
  pools: Pool[];
  transactions: TransactionHistory[];
  notifications: Notification[];
  settings: UserSettings;
}

export interface UserSettings {
  slippageTolerance: number;
  autoApprove: boolean;
  showTestTokens: boolean;
  defaultRpcEndpoint: string;
  preferredWallet?: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    transactions: boolean;
    priceAlerts: boolean;
    poolUpdates: boolean;
  };
}

export interface AppState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  user: UserState | null;
  network: NetworkType;
  programsValidated: {[key: string]: boolean} | null;
}

export interface UserState {
  publicKey: string;
  walletName: string;
  isConnected: boolean;
  balance: number;
  tokenAccounts: TokenAccount[];
  kycStatus: boolean | null;
  whitelistStatus: boolean | null;
  lastActivityAt: number;
}

// ========== SDK PARAMETER TYPES ==========
export interface TokenCreateParams {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  hookType: 'kyc' | 'whitelist' | 'none';
  description?: string;
  image?: string;
  externalUrl?: string;
  properties?: Record<string, any>;
}

export interface SwapParams {
  tokenA: string;
  tokenB: string;
  amountIn: number;
  minimumAmountOut: number;
  aToB: boolean;
  slippageTolerance?: number;
  deadline?: number;
}

export interface PoolCreateParams {
  tokenA: string;
  tokenB: string;
  initialPrice: number;
  feeRate?: number;      // ✅ Added optional feeRate
  ampFactor?: number;    // ✅ Added optional ampFactor
}

export interface AddLiquidityParams {
  poolAddress: string;
  tokenA: string;
  tokenB: string;
  amountA: number;
  amountB: number;
  minLpTokens: number;
  deadline?: number;
}

export interface RemoveLiquidityParams {
  poolAddress: string;
  lpTokenAmount: number;
  minAmountA: number;
  minAmountB: number;
  deadline?: number;
}

export interface StakeParams {
  poolAddress: string;
  lpTokenAmount: number;
  duration?: number;
}

// ========== COMPONENT PROPS TYPES ==========
export interface WalletInfoCardProps {
  publicKey: PublicKey | null;
  wallet: any;
  balance: number | null;
  disconnect: () => Promise<void>;
  copyToClipboard: (text: string) => void;
}

export interface BalanceCardProps {
  balance: number | null;
  loading?: boolean;
  showFaucetLink?: boolean;
}

export interface KYCStatusCardProps {
  kycStatus: boolean | null;
  loading?: boolean;
  onUpdateKYC?: () => void;
}

export interface ProgramIDsProps {
  copyToClipboard: (text: string) => void;
  programsValidated?: {[key: string]: boolean} | null;
  showValidationStatus?: boolean;
}

export interface TokenListProps {
  tokens: Token[];
  title: string;
  loading?: boolean;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  onTokenSelect?: (token: Token) => void;
  showBalances?: boolean;
  showHookIcons?: boolean;
  maxItems?: number;
}

export interface SwapFormProps {
  availableTokens: Token[];
  formState: SwapFormState;
  setFormState: Dispatch<SetStateAction<SwapFormState>>;
  onSwap: () => Promise<void>;
  loading: boolean;
  quoteLoading?: boolean;
  onGetQuote?: () => Promise<void>;
}

export interface PoolFormProps {
  availableTokens: Token[];
  formState: PoolFormState;
  setFormState: Dispatch<SetStateAction<PoolFormState>>;
  onCreatePool: () => Promise<void>;
  loading: boolean;
  existingPools?: Pool[];
}

export interface TokenCreateFormProps {
  formState: TokenFormState;
  setFormState: Dispatch<SetStateAction<TokenFormState>>;
  onCreateToken: () => Promise<void>;
  loading: boolean;
  balance: number | null;
  validateForm?: boolean;
}

export interface DevelopmentToolsProps {
  publicKey: PublicKey | null;
  copyToClipboard: (text: string) => void;
  programsValidated?: {[key: string]: boolean} | null;
}

export interface EmptyPoolsProps {
  availableTokens: Token[];
  onCreateFirstPool: () => void;
  loading?: boolean;
}

export interface EmptyCreatedTokensProps {
  onFillExampleData: () => void;
  onCreateToken?: () => void;
  loading?: boolean;
}

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showSpinner?: boolean;
}

// ========== BLOCKCHAIN DATA TYPES ==========
export interface Pool {
  address: string;
  tokenA: string;
  tokenB: string;
  tokenASymbol?: string;
  tokenBSymbol?: string;
  reserveA: number;
  reserveB: number;
  lpTokenSupply: number;
  feeRate: number;
  currentPrice: number;
  priceChange24h?: number;
  volume24h?: number;
  liquidity?: number;
  hookEnabled: boolean;
  created: number;
  creator?: string;
  isActive: boolean;
  ampFactor?: number;
  tradingFeeCollected?: number;
}

export interface PoolStats {
  totalPools: number;
  totalLiquidity: number;
  totalVolume24h: number;
  totalFees24h: number;
  totalTransactions24h: number;
  topPools: Pool[];
  newPools: Pool[];
}

export interface PoolPosition {
  poolAddress: string;
  tokenA: string;
  tokenB: string;
  lpTokenAmount: number;
  shareOfPool: number;
  valueA: number;
  valueB: number;
  totalValue: number;
  feesEarned?: number;
  impermanentLoss?: number;
}

export interface KYCRecord {
  user: string;
  isVerified: boolean;
  kycLevel: number;
  verifiedAt: number;
  updatedAt: number;
  transferCount: number;
  lastTransferAt: number;
  verificationType?: 'basic' | 'enhanced' | 'institutional';
  verificationData?: {
    name?: string;
    email?: string;
    country?: string;
    documentType?: string;
    documentNumber?: string;
  };
}

export interface WhitelistEntry {
  address: string;
  isActive: boolean;
  addedAt: number;
  addedBy: string;
  expiresAt?: number;
  permissions?: string[];
  metadata?: Record<string, any>;
}

export interface HookRegistry {
  programId: string;
  hooks: HookInfo[];
  totalHooks: number;
  activeHooks: number;
  created: number;
  authority: string;
}

// ========== TRANSACTION TYPES ==========
export interface Transaction {
  signature: string;
  blockTime: number;
  slot: number;
  status: 'success' | 'failed' | 'pending';
  fee: number;
  instructions: TransactionInstruction[];
  logMessages?: string[];
  computeUnitsConsumed?: number;
}

export interface TransactionHistory {
  signature: string;
  type: 'swap' | 'pool_create' | 'add_liquidity' | 'remove_liquidity' | 'token_create' | 'transfer';
  status: 'success' | 'failed' | 'pending';
  timestamp: number;
  fee: number;
  from?: string;
  to?: string;
  amount?: number;
  tokenSymbol?: string;
  description: string;
  explorerUrl: string;
}

export interface TransactionResult {
  signature: string;
  confirmed: boolean;
  error?: string;
  logs?: string[];
  computeUnitsUsed?: number;
  fee?: number;
  blockTime?: number;
}

export interface TransactionParams {
  instructions: any[];
  signers?: any[];
  computeUnits?: number;
  priorityFee?: number;
  skipPreflight?: boolean;
  preflightCommitment?: string;
}

export interface TransactionInstruction {
  programId: string;
  keys: Array<{
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }>;
  data: string;
}

// ========== HOOK TYPES ==========
export interface HookInfo {
  programId: string;
  type: 'KYC' | 'Whitelist' | 'RateLimit' | 'Royalty' | 'Custom';
  name: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  isActive: boolean;
  version: string;
  created: number;
  updated: number;
  author?: string;
  documentation?: string;
  configurable?: boolean;
  parameters?: HookParameter[];
}

export interface HookParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'address';
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface TransferHookData {
  source: string;
  destination: string;
  amount: number;
  mint: string;
  hookProgram: string;
  validationResult: 'Success' | 'Failed' | 'Pending';
  validationMessage?: string;
  gasUsed?: number;
  hookSpecificData?: Record<string, any>;
}

export interface HookExecution {
  signature: string;
  hookProgram: string;
  mint: string;
  amount: number;
  from: string;
  to: string;
  status: 'success' | 'failed' | 'blocked';
  reason?: string;
  timestamp: number;
  gasUsed: number;
}

// ========== ERROR TYPES ==========
export interface HookSwapError {
  code: string;
  message: string;
  programId?: string;
  instruction?: string;
  logs?: string[];
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  userMessage?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  code?: string;
  severity: 'warning' | 'error';
}

export interface APIError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
  requestId?: string;
}

// ========== API RESPONSE TYPES ==========
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  timestamp: number;
  requestId?: string;
  pagination?: PaginationInfo;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  totalPages: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ========== NOTIFICATION TYPES ==========
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  persistent?: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  style?: React.CSSProperties;
  className?: string;
  icon?: ReactNode;
  action?: NotificationAction;
}

// ========== UTILITY TYPES ==========
export type NetworkType = 'devnet' | 'testnet' | 'mainnet-beta' | 'localnet';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled' | 'expired';

export type HookType = 'kyc' | 'whitelist' | 'royalty' | 'rate-limit' | 'custom' | 'none';

export type WalletAdapterName = 
  | 'Phantom' 
  | 'Solflare' 
  | 'Coinbase Wallet' 
  | 'Trust Wallet' 
  | 'Coin98' 
  | 'Ledger' 
  | 'Torus'
  | 'WalletConnect'
  | 'Slope'
  | 'Sollet';

export type ThemeMode = 'light' | 'dark' | 'auto';

export type SortDirection = 'asc' | 'desc';

export type FilterOperator = 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';

// ========== FORM VALIDATION TYPES ==========
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export interface FormValidationRule<T = any> {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
}

export interface FormState<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// ========== SEARCH AND FILTER TYPES ==========
export interface SearchOptions {
  query: string;
  field?: string;
  exact?: boolean;
  caseSensitive?: boolean;
}

export interface FilterOptions {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface SortOptions {
  field: string;
  direction: SortDirection;
}

export interface QueryOptions {
  search?: SearchOptions;
  filters?: FilterOptions[];
  sort?: SortOptions[];
  pagination?: {
    page: number;
    limit: number;
  };
}

// ========== CHART AND ANALYTICS TYPES ==========
export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface PriceData {
  mint: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  marketCap?: number;
  timestamp: number;
}

export interface PoolAnalytics {
  poolAddress: string;
  volume24h: number;
  fees24h: number;
  transactions24h: number;
  liquidity: number;
  priceChart: ChartDataPoint[];
  volumeChart: ChartDataPoint[];
}

export interface UserAnalytics {
  totalValueLocked: number;
  totalFeesEarned: number;
  totalTransactions: number;
  portfolioValue: number;
  portfolioChange24h: number;
  positions: PoolPosition[];
  recentTransactions: TransactionHistory[];
}

// ========== MOBILE AND RESPONSIVE TYPES ==========
export interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface ResponsiveValue<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

export interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
}

// ========== INTERNATIONALIZATION TYPES ==========
export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag?: string;
}

export interface TranslationKey {
  key: string;
  defaultValue?: string;
  interpolation?: Record<string, any>;
}

// ========== TESTING TYPES ==========
export interface MockData<T> {
  data: T;
  delay?: number;
  shouldFail?: boolean;
  errorMessage?: string;
}

export interface TestScenario {
  name: string;
  description: string;
  setup: () => Promise<void>;
  execute: () => Promise<void>;
  verify: () => Promise<boolean>;
  cleanup?: () => Promise<void>;
}

// ========== EXPORT ALL TYPES ==========
export type {
  // Re-export commonly used React types
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

export type {
  // Re-export Solana types
  PublicKey,
} from '@solana/web3.js';

// ========== TYPE GUARDS ==========
export const isToken = (obj: any): obj is Token => {
  return obj && typeof obj.mint === 'string' && typeof obj.symbol === 'string';
};

export const isPool = (obj: any): obj is Pool => {
  return obj && typeof obj.address === 'string' && typeof obj.tokenA === 'string';
};

export const isTransactionResult = (obj: any): obj is TransactionResult => {
  return obj && typeof obj.signature === 'string' && typeof obj.confirmed === 'boolean';
};

export const isHookSwapError = (obj: any): obj is HookSwapError => {
  return obj && typeof obj.code === 'string' && typeof obj.message === 'string';
};

// ========== UTILITY FUNCTIONS ==========
export const createEmptyFormState = <T extends Record<string, any>>(initialValues: T): FormState<T> => ({
  values: initialValues,
  errors: {},
  touched: {},
  isValid: true,
  isSubmitting: false,
  isDirty: false,
});

export const formatTokenAmount = (amount: string | number, decimals: number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (num / Math.pow(10, decimals)).toFixed(Math.min(decimals, 6));
};

export const formatPrice = (price: number, decimals: number = 6): string => {
  return price.toFixed(decimals);
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const shortenAddress = (address: string, length: number = 4): string => {
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};