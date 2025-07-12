import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Browser polyfills for Solana
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      };
      
      // Provide global polyfills using webpack from parameter
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }
    
    // Ignore missing optional dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      'pino-pretty': false,
    };
    
    // Ignore webpack warnings
    config.ignoreWarnings = [
      {
        module: /node_modules\/pino/,
        message: /Can't resolve 'pino-pretty'/,
      },
      {
        module: /node_modules\/@walletconnect/,
        message: /Critical dependency/,
      },
    ];
    
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    
    return config;
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SOLANA_NETWORK: 'devnet',
    NEXT_PUBLIC_SOLANA_RPC_URL: 'https://api.devnet.solana.com',
  },
  
  // Transpile Solana packages
  transpilePackages: [
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-wallets',
  ],
  
  // Reduce hydration issues
  reactStrictMode: false,
  
  // Output configuration
  output: 'standalone',
};

export default nextConfig;