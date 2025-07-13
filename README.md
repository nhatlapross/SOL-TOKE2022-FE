# HookSwap AMM - Frontend Application

A modern, responsive web application for interacting with HookSwap AMM - the first Automated Market Maker (AMM) on Solana with native Token-2022 and Transfer Hooks support. Built with Next.js, React, and TypeScript for a seamless DeFi trading experience.

## 🌟 Features

### ✅ Core Functionality
- **Token-2022 Support**: Create and trade tokens with advanced features
- **Transfer Hooks Integration**: KYC, whitelist, and custom compliance hooks
- **AMM Trading**: Swap tokens with advanced hook validation
- **Liquidity Management**: Add/remove liquidity from pools
- **Wallet Integration**: Multi-wallet support with auto-reconnect

### ✅ Advanced Features
- **Real-time Updates**: Live balance and pool data
- **Hook Validation**: Pre-swap hook compatibility checks
- **Development Tools**: Built-in debugging and testing tools
- **Responsive Design**: Mobile-first, accessible UI
- **Error Handling**: Comprehensive error management and user feedback

## 🏗️ Architecture

```
Frontend Architecture
├── Next.js App Router     # Server-side rendering & routing
├── React Components       # Modular, reusable UI components
├── TypeScript SDK         # HookSwap AMM integration layer
├── Solana Integration    # Wallet & blockchain connectivity
├── State Management      # React hooks & context
└── Styling               # Tailwind CSS + shadcn/ui
```

## 📁 Project Structure

```
hookswap-frontend/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── forms/            # Form components
│   │   │   ├── TokenCreateForm.tsx
│   │   │   ├── SwapForm.tsx
│   │   │   └── PoolForm.tsx
│   │   ├── cards/            # Data display cards
│   │   │   ├── WalletInfoCard.tsx
│   │   │   ├── BalanceCard.tsx
│   │   │   └── KYCStatusCard.tsx
│   │   ├── tokens/           # Token management
│   │   │   └── TokenList.tsx
│   │   ├── tools/            # Developer tools
│   │   │   └── DevelopmentTools.tsx
│   │   ├── debug/            # Debug components
│   │   │   └── EnhancedDebugPanel.tsx
│   │   ├── empty-states/     # Empty state components
│   │   ├── HookSwapDashboard.tsx  # Main dashboard
│   │   ├── CustomWalletButton.tsx # Wallet connection
│   │   └── ClientWrapper.tsx      # Client-side wrapper
│   │
│   ├── lib/                   # Utilities & SDK
│   │   ├── RealHookSwapSDK.ts # Main SDK
│   │   ├── ProgramIntegrationTester.ts # Testing tools
│   │   ├── PDADebugger.ts     # Program Derived Address debugging
│   │   └── utils.ts           # Helper functions
│   │
│   ├── contexts/              # React contexts
│   │   └── WalletContext.tsx  # Wallet provider
│   │
│   ├── hooks/                 # Custom React hooks
│   │   └── useWalletAutoConnect.ts
│   │
│   ├── types/                 # TypeScript definitions
│   │   └── index.ts           # Type exports
│   │
│   └── styles/                # Styling
│       └── globals.css        # Global CSS
│
├── public/                    # Static assets
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd hookswap-frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment setup**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_APP_NAME=HookSwap AMM
NEXT_PUBLIC_APP_VERSION=1.0.0
```

4. **Start development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:watch   # Watch mode testing
npm run test:coverage # Coverage report
```

### Development Workflow

1. **Component Development**
   - Create components in appropriate subdirectories
   - Follow TypeScript best practices
   - Use shadcn/ui components when possible
   - Implement responsive design

2. **SDK Integration**
   - Use `RealHookSwapSDK` for blockchain interactions
   - Handle loading states and errors gracefully
   - Validate user inputs before transactions

3. **Styling**
   - Use Tailwind CSS utility classes
   - Follow design system patterns
   - Ensure mobile responsiveness

## 🔧 Configuration

### Next.js Configuration (`next.config.ts`)

The application includes specialized configuration for Solana development:

```typescript
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Browser polyfills for Solana
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      };
    }
    return config;
  },
  transpilePackages: [
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-wallets',
  ],
};
```

### TypeScript Configuration

Strict TypeScript configuration with path mapping:

```json
{
  "compilerOptions": {
    "strict": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "target": "ES2017"
  }
}
```

## 📱 User Interface

### Main Components

#### 1. **Dashboard** (`HookSwapDashboard.tsx`)
- **Overview**: Central hub for all AMM interactions
- **Features**: Tabbed interface with swap, pools, and token creation
- **Real-time Data**: Live balance updates and pool information

#### 2. **Token Creation** (`TokenCreateForm.tsx`)
- **Purpose**: Create Token-2022 with transfer hooks
- **Hook Types**: KYC, Whitelist, or None
- **Validation**: Real-time form validation and error handling

#### 3. **Swap Interface** (`SwapForm.tsx`)
- **Functionality**: Token swapping with hook validation
- **Features**: Slippage protection, price impact calculation
- **Safety**: Pre-swap hook compatibility checks

#### 4. **Pool Management** (`PoolForm.tsx`)
- **Capabilities**: Create and manage liquidity pools
- **Validation**: Token compatibility and initial pricing
- **Monitoring**: Real-time pool statistics

### Wallet Integration

#### Supported Wallets
- Phantom
- Solflare  
- Coinbase Wallet
- Trust Wallet
- Coin98
- Ledger
- Torus

#### Auto-reconnect Feature
```typescript
// Automatic wallet reconnection on page load
const { autoConnect, handleDisconnect } = useWalletAutoConnect();
```

## 🔍 Debugging Tools

### Enhanced Debug Panel

The application includes comprehensive debugging tools:

#### Program Integration Tester
- Tests all smart contract deployments
- Validates Program Derived Addresses (PDAs)
- Checks instruction compatibility
- Reports deployment health

#### PDA Debugger
- Debugging Program Derived Addresses
- Account validation
- Seed verification
- Address generation testing

### Usage Example
```typescript
// Access debugging tools in development
if (process.env.NODE_ENV === 'development') {
  const tester = new ProgramIntegrationTester(sdk, connection, wallet);
  const results = await tester.runComprehensiveTests();
}
```

## 🎨 Styling & Design

### Design System
- **Framework**: Tailwind CSS
- **Components**: shadcn/ui
- **Theme**: Dark mode with purple/blue gradients
- **Typography**: Inter font family
- **Responsive**: Mobile-first approach

### Key Design Elements
```css
/* Primary gradient background */
background: linear-gradient(to bottom right, 
  theme('colors.purple.900'), 
  theme('colors.blue.900'), 
  theme('colors.indigo.900')
);

/* Glass morphism cards */
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

## 📊 State Management

### React Context Pattern
```typescript
// Wallet context for global wallet state
const { connected, publicKey, wallet } = useWallet();

// Local state for component-specific data
const [dashboardState, setDashboardState] = useState({
  loading: false,
  balance: null,
  tokens: [],
  pools: []
});
```

### Form State Management
```typescript
// Type-safe form state
interface TokenFormState {
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  selectedHookType: HookType;
}

const [formState, setFormState] = useState<TokenFormState>({
  tokenName: '',
  tokenSymbol: '',
  totalSupply: 1000000,
  selectedHookType: 'none'
});
```

## 🔐 Security Features

### Input Validation
- Client-side form validation
- TypeScript type safety
- Sanitized user inputs
- Error boundary protection

### Transaction Safety
- Pre-transaction validation
- Hook compatibility checks
- Slippage protection
- Transaction confirmation

### Wallet Security
- Secure wallet connection
- Auto-disconnect on page close
- Encrypted local storage
- No private key exposure

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Start production server
npm run start

# Or export static files
npm run export
```

### Environment Variables
```env
# Production environment
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=<your-rpc-endpoint>
NEXT_PUBLIC_APP_NAME=HookSwap AMM
```

### Deployment Platforms
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Static site deployment
- **AWS**: S3 + CloudFront
- **Docker**: Containerized deployment

## 📈 Performance Optimization

### Code Splitting
```typescript
// Lazy loading for heavy components
const HookSwapDashboard = lazy(() => import('@/components/HookSwapDashboard'));

// Suspense with loading fallback
<Suspense fallback={<DashboardSkeleton />}>
  <HookSwapDashboard />
</Suspense>
```

### Bundle Optimization
- Dynamic imports for wallet adapters
- Tree shaking for unused code
- Image optimization with Next.js
- CSS purging with Tailwind

### Caching Strategy
- Next.js automatic static optimization
- Browser caching for static assets
- Service worker for offline support
- Local storage for user preferences

## 🧪 Testing

### Testing Framework
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Structure
```typescript
// Component testing example
describe('TokenCreateForm', () => {
  it('validates form inputs correctly', () => {
    // Test implementation
  });
  
  it('handles token creation flow', async () => {
    // Test token creation
  });
});
```

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use existing component patterns
3. Maintain responsive design principles
4. Add comprehensive error handling
5. Write meaningful commit messages

### Code Standards
- ESLint configuration enforcement
- Prettier code formatting
- TypeScript strict mode
- Component prop validation

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request

## 📚 API Reference

### HookSwap SDK Methods

```typescript
// Create Token-2022 with hooks
await sdk.createTokenWithHooks({
  name: 'MyToken',
  symbol: 'MTK',
  decimals: 9,
  totalSupply: 1000000,
  hookType: 'kyc'
});

// Create liquidity pool
await sdk.createPool({
  tokenA: tokenAMint,
  tokenB: tokenBMint,
  initialPrice: 1000000000
});

// Execute swap
await sdk.executeSwap({
  tokenA: tokenAMint.toString(),
  tokenB: tokenBMint.toString(),
  amountIn: 1000000,
  minimumAmountOut: 900000,
  aToB: true
});
```

### Component Props

```typescript
// Form component props
interface TokenCreateFormProps {
  formState: TokenFormState;
  setFormState: (state: TokenFormState) => void;
  onCreateToken: (params: CreateTokenParams) => Promise<void>;
  loading: boolean;
  balance: number | null;
}
```

## 🔗 Links & Resources

- **Live Demo**: [https://hookswap-demo.vercel.app](https://hookswap-demo.vercel.app)
- **Smart Contracts**: [GitHub Repository](https://github.com/hookswap/contracts)
- **Documentation**: [GitBook Docs](https://docs.hookswap.io)
- **Discord**: [Community Chat](https://discord.gg/hookswap)
- **Twitter**: [@HookSwapAMM](https://twitter.com/HookSwapAMM)

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   ```bash
   # Clear browser cache and local storage
   # Try different RPC endpoint
   # Update wallet extension
   ```

2. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

3. **TypeScript Errors**
   ```bash
   # Check type definitions
   npm run type-check
   ```

### Getting Help
- Check the [Issues](https://github.com/hookswap/frontend/issues) page
- Join our [Discord community](https://discord.gg/hookswap)
- Read the [documentation](https://docs.hookswap.io)

---

**Built with ❤️ for the Solana DeFi ecosystem**

*Empowering compliant and feature-rich token trading on Solana*
