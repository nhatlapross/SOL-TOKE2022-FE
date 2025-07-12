//src/lib/WalletDebugUtils.ts - Debug utilities for wallet issues
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export class WalletDebugUtils {
  constructor(private connection: Connection) {}

  // ✅ Comprehensive wallet diagnostics
  async diagnoseWallet(publicKey: PublicKey): Promise<WalletDiagnostics> {
    const diagnostics: WalletDiagnostics = {
      address: publicKey.toString(),
      network: this.getNetworkFromRPC(),
      balance: {
        lamports: 0,
        sol: 0,
        formatted: '0 SOL'
      },
      accountInfo: null,
      issues: [],
      recommendations: []
    };

    try {
      // 1. Check account existence and balance
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      
      if (!accountInfo) {
        diagnostics.issues.push('Account does not exist on this network');
        diagnostics.recommendations.push('Ensure you are on the correct network (Devnet)');
        diagnostics.recommendations.push('Request SOL from faucet: https://faucet.solana.com/');
        return diagnostics;
      }

      diagnostics.accountInfo = {
        lamports: accountInfo.lamports,
        owner: accountInfo.owner.toString(),
        executable: accountInfo.executable,
        rentEpoch: accountInfo.rentEpoch
      };

      // 2. Calculate balance
      const balance = await this.connection.getBalance(publicKey);
      diagnostics.balance = {
        lamports: balance,
        sol: balance / LAMPORTS_PER_SOL,
        formatted: `${(balance / LAMPORTS_PER_SOL).toFixed(6)} SOL`
      };

      // 3. Check minimum balance requirements
      const rentExemption = await this.connection.getMinimumBalanceForRentExemption(0);
      const tokenCreationCost = 0.01 * LAMPORTS_PER_SOL; // Estimated cost
      const totalRequired = rentExemption + tokenCreationCost;

      if (balance < totalRequired) {
        diagnostics.issues.push(`Insufficient balance for token creation`);
        diagnostics.issues.push(`Required: ~${(totalRequired / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
        diagnostics.issues.push(`Current: ${(balance / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
        diagnostics.recommendations.push('Request more SOL from faucet');
        diagnostics.recommendations.push('Try creating with smaller compute budget');
      }

      // 4. Check network connectivity
      const slot = await this.connection.getSlot();
      const blockTime = await this.connection.getBlockTime(slot);
      
      diagnostics.networkInfo = {
        slot,
        blockTime,
        rpcUrl: this.connection.rpcEndpoint,
        commitment: this.connection.commitment || 'finalized'
      };

      // 5. Performance checks
      const startTime = Date.now();
      await this.connection.getLatestBlockhash();
      const responseTime = Date.now() - startTime;

      if (responseTime > 5000) {
        diagnostics.issues.push('Slow RPC response detected');
        diagnostics.recommendations.push('Try switching to a faster RPC endpoint');
      }

      // 6. Recent transaction history
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit: 5 });
      diagnostics.recentTransactions = signatures.map(sig => ({
        signature: sig.signature,
        slot: sig.slot,
        blockTime: sig.blockTime,
        confirmationStatus: sig.confirmationStatus,
        err: sig.err
      }));

      // 7. Success indicators
      if (balance >= totalRequired) {
        diagnostics.recommendations.push('✅ Wallet has sufficient balance for token creation');
      }

      if (responseTime < 2000) {
        diagnostics.recommendations.push('✅ RPC connection is responsive');
      }

    } catch (error: any) {
      diagnostics.issues.push(`Connection error: ${error.message}`);
      diagnostics.recommendations.push('Check network connection and RPC endpoint');
    }

    return diagnostics;
  }

  // ✅ Get network from RPC URL
  private getNetworkFromRPC(): string {
    const rpcUrl = this.connection.rpcEndpoint.toLowerCase();
    
    if (rpcUrl.includes('devnet')) return 'devnet';
    if (rpcUrl.includes('testnet')) return 'testnet';
    if (rpcUrl.includes('mainnet')) return 'mainnet-beta';
    if (rpcUrl.includes('localhost') || rpcUrl.includes('127.0.0.1')) return 'localnet';
    
    return 'unknown';
  }

  // ✅ Estimate transaction costs
  async estimateTokenCreationCost(): Promise<CostEstimate> {
    try {
      const rentExemption = await this.connection.getMinimumBalanceForRentExemption(165); // Token account size
      const baseFee = 5000; // Base transaction fee in lamports
      const computeFee = 200000 * 0; // Compute units * microLamports per unit
      
      const totalLamports = rentExemption + baseFee + computeFee;
      
      return {
        rentExemption: {
          lamports: rentExemption,
          sol: rentExemption / LAMPORTS_PER_SOL
        },
        transactionFee: {
          lamports: baseFee,
          sol: baseFee / LAMPORTS_PER_SOL
        },
        computeFee: {
          lamports: computeFee,
          sol: computeFee / LAMPORTS_PER_SOL
        },
        total: {
          lamports: totalLamports,
          sol: totalLamports / LAMPORTS_PER_SOL,
          formatted: `${(totalLamports / LAMPORTS_PER_SOL).toFixed(6)} SOL`
        }
      };
    } catch (error) {
      throw new Error(`Failed to estimate costs: ${error}`);
    }
  }

  // ✅ Test RPC connection
  async testRPCConnection(): Promise<RPCTestResult> {
    const startTime = Date.now();
    
    try {
      const [slot, blockHash, version] = await Promise.all([
        this.connection.getSlot(),
        this.connection.getLatestBlockhash(),
        this.connection.getVersion()
      ]);
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        responseTime,
        rpcUrl: this.connection.rpcEndpoint,
        slot,
        blockHash: blockHash.blockhash,
        solanaVersion: version['solana-core'],
        performance: responseTime < 2000 ? 'good' : responseTime < 5000 ? 'acceptable' : 'slow'
      };
    } catch (error: any) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        rpcUrl: this.connection.rpcEndpoint,
        error: error.message,
        performance: 'failed'
      };
    }
  }

  // ✅ Get faucet URL for current network
  getFaucetURL(): string {
    const network = this.getNetworkFromRPC();
    
    switch (network) {
      case 'devnet':
        return 'https://faucet.solana.com/';
      case 'testnet':
        return 'https://faucet.solana.com/';
      default:
        return 'https://faucet.solana.com/';
    }
  }

  // ✅ Generate diagnostic report
  async generateReport(publicKey: PublicKey): Promise<string> {
    const diagnostics = await this.diagnoseWallet(publicKey);
    const costEstimate = await this.estimateTokenCreationCost();
    const rpcTest = await this.testRPCConnection();
    
    let report = `
🔍 WALLET DIAGNOSTIC REPORT
═══════════════════════════════════

📍 WALLET INFO:
   Address: ${diagnostics.address}
   Network: ${diagnostics.network}
   Balance: ${diagnostics.balance.formatted}

💰 COST ANALYSIS:
   Required: ${costEstimate.total.formatted}
   Available: ${diagnostics.balance.formatted}
   Status: ${diagnostics.balance.lamports >= costEstimate.total.lamports ? '✅ SUFFICIENT' : '❌ INSUFFICIENT'}

🌐 NETWORK STATUS:
   RPC: ${rpcTest.rpcUrl}
   Performance: ${rpcTest.performance}
   Response: ${rpcTest.responseTime}ms

`;

    if (diagnostics.issues.length > 0) {
      report += `❌ ISSUES FOUND:\n`;
      diagnostics.issues.forEach(issue => {
        report += `   • ${issue}\n`;
      });
      report += `\n`;
    }

    if (diagnostics.recommendations.length > 0) {
      report += `💡 RECOMMENDATIONS:\n`;
      diagnostics.recommendations.forEach(rec => {
        report += `   • ${rec}\n`;
      });
      report += `\n`;
    }

    report += `🔗 HELPFUL LINKS:
   • Faucet: ${this.getFaucetURL()}
   • Explorer: https://explorer.solana.com/address/${publicKey.toString()}?cluster=${diagnostics.network}
   • RPC Status: ${rpcTest.rpcUrl}
`;

    return report;
  }
}

// ✅ Type definitions
export interface WalletDiagnostics {
  address: string;
  network: string;
  balance: {
    lamports: number;
    sol: number;
    formatted: string;
  };
  accountInfo: {
    lamports: number;
    owner: string;
    executable: boolean;
    rentEpoch: number;
  } | null;
  networkInfo?: {
    slot: number;
    blockTime: number | null;
    rpcUrl: string;
    commitment: string;
  };
  recentTransactions?: Array<{
    signature: string;
    slot: number | null;
    blockTime: number | null;
    confirmationStatus: string | null;
    err: any;
  }>;
  issues: string[];
  recommendations: string[];
}

export interface CostEstimate {
  rentExemption: { lamports: number; sol: number };
  transactionFee: { lamports: number; sol: number };
  computeFee: { lamports: number; sol: number };
  total: { lamports: number; sol: number; formatted: string };
}

export interface RPCTestResult {
  success: boolean;
  responseTime: number;
  rpcUrl: string;
  slot?: number;
  blockHash?: string;
  solanaVersion?: string;
  error?: string;
  performance: 'good' | 'acceptable' | 'slow' | 'failed';
}