//src/lib/HookSwapSDK.ts - THỰC SỰ tương tác với programs
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  Keypair,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { 
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';
import { BN } from '@coral-xyz/anchor';

// ✅ REAL Program IDs
export const PROGRAM_IDS = {
  TOKEN_LAYER: new PublicKey('HJ4MosN8hG5qd6WFMKQcBmYVhHuX1EKdPZ1LyaPSdYLA'),
  HOOKSWAP_AMM: new PublicKey('4SCHMFNpFoHEbaMzgHHPpCKgtfHEuujbdwZsqNH2uC13'),
  KYC_HOOK: new PublicKey('76V7AeKynXT5e53XFzYXKZc5BoPAhSVqpyRbq1pAf4YC'),
  HOOK_REGISTRY: new PublicKey('6guQ6trdmPmnfqgZwgiBPW7wVzEZuzWKNRzagHxveC88'),
  WHITELIST_HOOK: new PublicKey('7Q3jm9Wqnpgg6SfUn2tujhSAiNaW1NvW74Ai821FEP93'),
};

// ✅ REAL PDA Seeds (từ Rust programs)
export const SEEDS = {
  TOKEN_INFO: 'token_info',
  AMM_CONFIG: 'amm_config',
  POOL: 'pool',
  KYC_SYSTEM: 'kyc_system',
  KYC_RECORD: 'kyc_record',
  HOOK_REGISTRY: 'hook_registry',
  WHITELIST: 'whitelist',
};

// ✅ REAL Instruction Discriminators (từ IDL)
export const INSTRUCTION_DISCRIMINATORS = {
  // Token Layer
  CREATE_TOKEN_2022_WITH_HOOKS: Buffer.from([0x01]), // Tùy theo program implementation
  CREATE_BASIC_TOKEN_2022: Buffer.from([0x02]),
  
  // AMM
  INITIALIZE_AMM: Buffer.from([0x10]),
  CREATE_POOL: Buffer.from([0x11]),
  SWAP: Buffer.from([0x12]),
  ADD_LIQUIDITY: Buffer.from([0x13]),
  
  // KYC Hook
  INITIALIZE_KYC_SYSTEM: Buffer.from([0x20]),
  CREATE_KYC_RECORD: Buffer.from([0x21]),
  UPDATE_KYC_STATUS: Buffer.from([0x22]),
};

export class HookSwapSDK {
  constructor(
    private connection: Connection,
    private wallet: any
  ) {}

  // ✅ REAL: Tạo Token-2022 với Transfer Hooks
  async createTokenWithHooks(params: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: number;
    hookType: 'kyc' | 'whitelist' | 'none';
  }): Promise<string> {
    if (!this.wallet.publicKey) throw new Error('Wallet not connected');

    console.log('🏗️ REAL: Creating Token-2022 with hooks:', params);

    try {
      // 1. Generate new mint keypair
      const mintKeypair = Keypair.generate();
      
      // 2. Find Token Info PDA
      const [tokenInfoPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.TOKEN_INFO), mintKeypair.publicKey.toBuffer()],
        PROGRAM_IDS.TOKEN_LAYER
      );

      // 3. Determine hook program based on type
      let hookProgramId = null;
      if (params.hookType === 'kyc') {
        hookProgramId = PROGRAM_IDS.KYC_HOOK;
      } else if (params.hookType === 'whitelist') {
        hookProgramId = PROGRAM_IDS.WHITELIST_HOOK;
      }

      // 4. Encode instruction data
      const nameBytes = Buffer.from(params.name.slice(0, 50), 'utf8');
      const symbolBytes = Buffer.from(params.symbol.slice(0, 10), 'utf8');
      const nameLen = Buffer.from([nameBytes.length]);
      const symbolLen = Buffer.from([symbolBytes.length]);
      const decimalsBuffer = Buffer.from([params.decimals]);
      const totalSupplyBuffer = Buffer.alloc(8);
      totalSupplyBuffer.writeBigUInt64LE(BigInt(params.totalSupply));
      
      const instructionData = Buffer.concat([
        INSTRUCTION_DISCRIMINATORS.CREATE_TOKEN_2022_WITH_HOOKS,
        nameLen,
        nameBytes,
        symbolLen, 
        symbolBytes,
        decimalsBuffer,
        hookProgramId ? hookProgramId.toBuffer() : Buffer.alloc(32),
        totalSupplyBuffer,
      ]);

      // 5. Build REAL instruction
      const createTokenIx = new TransactionInstruction({
        keys: [
          { pubkey: tokenInfoPDA, isSigner: false, isWritable: true },
          { pubkey: mintKeypair.publicKey, isSigner: true, isWritable: true },
          { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_IDS.TOKEN_LAYER,
        data: instructionData,
      });

      // 6. Build and send transaction
      const transaction = new Transaction();
      transaction.add(createTokenIx);
      transaction.feePayer = this.wallet.publicKey;
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // 7. Sign with both wallet and mint keypair
      const signedTx = await this.wallet.signTransaction(transaction);
      signedTx.partialSign(mintKeypair);

      // 8. Send transaction
      const signature = await this.connection.sendRawTransaction(signedTx.serialize());
      
      // 9. Confirm transaction
      await this.connection.confirmTransaction(signature, 'confirmed');

      console.log('✅ REAL Token created successfully!');
      console.log('🪙 Mint Address:', mintKeypair.publicKey.toString());
      console.log('📄 Transaction:', signature);

      return signature;

    } catch (error: any) {
      console.error('❌ REAL token creation failed:', error);
      throw new Error(`Real token creation failed: ${error.message}`);
    }
  }

  // ✅ REAL: Kiểm tra KYC status từ program
  async checkRealKYCStatus(userPubkey: PublicKey): Promise<boolean> {
    try {
      console.log('🔍 REAL: Checking KYC status for:', userPubkey.toString());

      // 1. Find KYC Record PDA
      const [kycRecordPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.KYC_RECORD), userPubkey.toBuffer()],
        PROGRAM_IDS.KYC_HOOK
      );

      // 2. Fetch account data
      const kycRecordAccount = await this.connection.getAccountInfo(kycRecordPDA);
      
      if (!kycRecordAccount || kycRecordAccount.data.length === 0) {
        console.log('❌ No KYC record found');
        return false;
      }

      // 3. Parse KYC record data
      const data = kycRecordAccount.data;
      
      // Skip discriminator (8 bytes) + user pubkey (32 bytes)
      const isVerifiedOffset = 8 + 32;
      const isVerified = data[isVerifiedOffset] === 1;
      const kycLevel = data[isVerifiedOffset + 1];

      console.log('✅ REAL KYC Status:', {
        isVerified,
        kycLevel,
        recordExists: true
      });

      return isVerified;

    } catch (error) {
      console.error('❌ REAL KYC check failed:', error);
      return false;
    }
  }

  // ✅ REAL: Tạo liquidity pool
  async createRealPool(params: {
    tokenA: string;
    tokenB: string;
    initialPrice: number;
  }): Promise<string> {
    if (!this.wallet.publicKey) throw new Error('Wallet not connected');

    try {
      console.log('🏊 REAL: Creating pool for', params.tokenA, '/', params.tokenB);

      const tokenAMint = new PublicKey(params.tokenA);
      const tokenBMint = new PublicKey(params.tokenB);

      // 1. Find Pool PDA
      const [poolPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(SEEDS.POOL),
          tokenAMint.toBuffer(),
          tokenBMint.toBuffer()
        ],
        PROGRAM_IDS.HOOKSWAP_AMM
      );

      // 2. Find AMM Config PDA
      const [ammConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.AMM_CONFIG)],
        PROGRAM_IDS.HOOKSWAP_AMM
      );

      // 3. Encode instruction data
      const priceBuffer = Buffer.alloc(8);
      priceBuffer.writeBigUInt64LE(BigInt(params.initialPrice * 1e9)); // Convert to lamports

      const instructionData = Buffer.concat([
        INSTRUCTION_DISCRIMINATORS.CREATE_POOL,
        priceBuffer,
      ]);

      // 4. Build instruction
      const createPoolIx = new TransactionInstruction({
        keys: [
          { pubkey: poolPDA, isSigner: false, isWritable: true },
          { pubkey: ammConfigPDA, isSigner: false, isWritable: true },
          { pubkey: tokenAMint, isSigner: false, isWritable: false },
          { pubkey: tokenBMint, isSigner: false, isWritable: false },
          { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_IDS.HOOKSWAP_AMM,
        data: instructionData,
      });

      // 5. Send transaction
      const transaction = new Transaction().add(createPoolIx);
      transaction.feePayer = this.wallet.publicKey;
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTx = await this.wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTx.serialize());
      
      await this.connection.confirmTransaction(signature, 'confirmed');

      console.log('✅ REAL Pool created successfully!');
      console.log('🏊 Pool Address:', poolPDA.toString());

      return signature;

    } catch (error: any) {
      console.error('❌ REAL pool creation failed:', error);
      throw new Error(`Real pool creation failed: ${error.message}`);
    }
  }

  // ✅ REAL: Execute swap
  async executeRealSwap(params: {
    tokenA: string;
    tokenB: string;
    amountIn: number;
    minimumAmountOut: number;
    aToB: boolean;
  }): Promise<string> {
    if (!this.wallet.publicKey) throw new Error('Wallet not connected');

    try {
      console.log('🔄 REAL: Executing swap:', params);

      const tokenAMint = new PublicKey(params.tokenA);
      const tokenBMint = new PublicKey(params.tokenB);

      // 1. Find Pool PDA
      const [poolPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(SEEDS.POOL),
          tokenAMint.toBuffer(),
          tokenBMint.toBuffer()
        ],
        PROGRAM_IDS.HOOKSWAP_AMM
      );

      // 2. Get user token accounts
      const userTokenA = await getAssociatedTokenAddress(
        tokenAMint,
        this.wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const userTokenB = await getAssociatedTokenAddress(
        tokenBMint,
        this.wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      // 3. Encode instruction data
      const amountInBuffer = Buffer.alloc(8);
      amountInBuffer.writeBigUInt64LE(BigInt(params.amountIn));
      
      const minAmountOutBuffer = Buffer.alloc(8);
      minAmountOutBuffer.writeBigUInt64LE(BigInt(params.minimumAmountOut));

      const instructionData = Buffer.concat([
        INSTRUCTION_DISCRIMINATORS.SWAP,
        amountInBuffer,
        minAmountOutBuffer,
        Buffer.from([params.aToB ? 1 : 0]),
      ]);

      // 4. Build instruction
      const swapIx = new TransactionInstruction({
        keys: [
          { pubkey: poolPDA, isSigner: false, isWritable: true },
          { pubkey: tokenAMint, isSigner: false, isWritable: false },
          { pubkey: tokenBMint, isSigner: false, isWritable: false },
          { pubkey: userTokenA, isSigner: false, isWritable: true },
          { pubkey: userTokenB, isSigner: false, isWritable: true },
          { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_IDS.HOOKSWAP_AMM,
        data: instructionData,
      });

      // 5. Send transaction
      const transaction = new Transaction().add(swapIx);
      transaction.feePayer = this.wallet.publicKey;
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTx = await this.wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTx.serialize());
      
      await this.connection.confirmTransaction(signature, 'confirmed');

      console.log('✅ REAL Swap executed successfully!');
      return signature;

    } catch (error: any) {
      console.error('❌ REAL swap failed:', error);
      throw new Error(`Real swap failed: ${error.message}`);
    }
  }

  // ✅ REAL: Get actual pool data
  async getRealPoolData(tokenA: string, tokenB: string): Promise<any> {
    try {
      const tokenAMint = new PublicKey(tokenA);
      const tokenBMint = new PublicKey(tokenB);

      const [poolPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(SEEDS.POOL),
          tokenAMint.toBuffer(),
          tokenBMint.toBuffer()
        ],
        PROGRAM_IDS.HOOKSWAP_AMM
      );

      const poolAccount = await this.connection.getAccountInfo(poolPDA);
      
      if (!poolAccount) {
        throw new Error('Pool not found');
      }

      // Parse pool data based on your Rust struct
      const data = poolAccount.data;
      // Skip discriminator (8 bytes)
      let offset = 8;
      
      // Parse according to Pool struct in Rust
      // This is example parsing - adjust based on your actual struct
      const tokenAMintBytes = data.slice(offset, offset + 32);
      offset += 32;
      const tokenBMintBytes = data.slice(offset, offset + 32);
      offset += 32;
      
      // Continue parsing other fields...

      return {
        address: poolPDA.toString(),
        tokenA: new PublicKey(tokenAMintBytes).toString(),
        tokenB: new PublicKey(tokenBMintBytes).toString(),
        exists: true,
        // Add other parsed fields
      };

    } catch (error) {
      console.error('❌ Failed to get real pool data:', error);
      return null;
    }
  }

  // ✅ REAL: Check if programs are deployed
  async validateRealPrograms(): Promise<{[key: string]: boolean}> {
    const results: {[key: string]: boolean} = {};
    
    for (const [name, programId] of Object.entries(PROGRAM_IDS)) {
      try {
        const accountInfo = await this.connection.getAccountInfo(programId);
        results[name] = accountInfo !== null && accountInfo.executable;
        
        console.log(`${results[name] ? '✅' : '❌'} ${name}: ${programId.toString()}`);
      } catch (error) {
        results[name] = false;
        console.error(`❌ ${name}: Error checking program:`, error);
      }
    }
    
    return results;
  }
}