// Global type declarations for HookSwap

// Window extensions for browser environment
declare global {
  interface Window {
    Buffer: typeof Buffer;
    process: typeof process;
    solana?: any;
    phantom?: {
      solana?: any;
    };
  }
}

// Module declarations for packages without types
declare module '@solana/web3.js' {
  export * from '@solana/web3.js/lib/index';
}

declare module '@solana/wallet-adapter-base' {
  export * from '@solana/wallet-adapter-base/lib/esm/index';
}

declare module '@solana/wallet-adapter-react' {
  export * from '@solana/wallet-adapter-react/lib/esm/index';
}

declare module '@solana/wallet-adapter-react-ui' {
  export * from '@solana/wallet-adapter-react-ui/lib/esm/index';
}

declare module '@solana/wallet-adapter-wallets' {
  export * from '@solana/wallet-adapter-wallets/lib/esm/index';
}

declare module '@solana/spl-token' {
  export * from '@solana/spl-token/lib/esm/index';
}

declare module '@coral-xyz/anchor' {
  export * from '@coral-xyz/anchor/dist/esm/index';
}

// Enhanced environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SOLANA_NETWORK: 'devnet' | 'testnet' | 'mainnet-beta';
    NEXT_PUBLIC_SOLANA_RPC_URL: string;
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_APP_VERSION: string;
    NEXT_PUBLIC_TOKEN_LAYER_PROGRAM: string;
    NEXT_PUBLIC_HOOKSWAP_AMM_PROGRAM: string;
    NEXT_PUBLIC_KYC_HOOK_PROGRAM: string;
    NEXT_PUBLIC_HOOK_REGISTRY_PROGRAM: string;
    NEXT_PUBLIC_WHITELIST_HOOK_PROGRAM: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}

// Extend NodeJS global
declare global {
  namespace NodeJS {
    interface Global {
      Buffer: typeof Buffer;
    }
  }
}

export {};
