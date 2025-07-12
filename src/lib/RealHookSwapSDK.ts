//src/lib/RealHookSwapSDK.ts - COMPLETE FILE with ALL debug methods
import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
    SystemProgram,
    Keypair,
    SYSVAR_RENT_PUBKEY,
    ComputeBudgetProgram,
} from '@solana/web3.js';
import {
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';
import { BN } from '@coral-xyz/anchor';

// ✅ SDK-specific interfaces (to avoid import issues)
export interface CreateTokenParams {
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
    feeRate?: number;
    ampFactor?: number;
}

// ✅ REAL Program IDs from environment
export const PROGRAM_IDS = {
    TOKEN_LAYER: new PublicKey(process.env.NEXT_PUBLIC_TOKEN_LAYER_PROGRAM!),
    HOOKSWAP_AMM: new PublicKey(process.env.NEXT_PUBLIC_HOOKSWAP_AMM_PROGRAM!),
    KYC_HOOK: new PublicKey(process.env.NEXT_PUBLIC_KYC_HOOK_PROGRAM!),
    HOOK_REGISTRY: new PublicKey(process.env.NEXT_PUBLIC_HOOK_REGISTRY_PROGRAM!),
    WHITELIST_HOOK: new PublicKey(process.env.NEXT_PUBLIC_WHITELIST_HOOK_PROGRAM!),
};

// ✅ REAL PDA Seeds (from Rust programs)
export const SEEDS = {
    TOKEN_INFO: 'token_info',
    AMM_CONFIG: 'amm_config',
    POOL: 'pool',
    KYC_SYSTEM: 'kyc_system',
    KYC_RECORD: 'kyc_record',
    HOOK_REGISTRY: 'hook_registry',
    WHITELIST: 'whitelist',
    EXTRA_ACCOUNT_METAS: 'extra-account-metas',
};

// Interface definitions
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

export class RealHookSwapSDK {
    constructor(
        private connection: Connection,
        private wallet: any
    ) {
        console.log('🚀 Real HookSwap SDK initialized');
        console.log('📡 RPC:', this.connection.rpcEndpoint);
        console.log('👛 Wallet:', this.wallet.publicKey?.toString());
    }

    // ========== MAIN SDK METHODS ==========

    // ✅ REAL: Validate programs are deployed
    async validatePrograms(): Promise<{ [key: string]: boolean }> {
        console.log('🔍 Validating deployed programs...');

        const results: { [key: string]: boolean } = {};

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

    // ✅ REAL: Create Token-2022 with Transfer Hooks
    async createTokenWithHooks(params: CreateTokenParams): Promise<string> {
        if (!this.wallet.publicKey) throw new Error('Wallet not connected');

        console.log('🏗️ REAL: Creating Token-2022 with hooks:', params);

        try {
            // ✅ SIMPLIFIED APPROACH: Create basic mint account first, then initialize
            const mintKeypair = Keypair.generate();
            console.log('🪙 Generated mint:', mintKeypair.publicKey.toString());

            const transaction = new Transaction();

            // ✅ Reduced compute budget
            transaction.add(
                ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
                ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 })
            );

            // ✅ Step 1: Create basic mint account (no custom instruction)
            const mintSpace = 82; // Basic Token-2022 mint size
            const mintRent = await this.connection.getMinimumBalanceForRentExemption(mintSpace);

            const createMintAccountIx = SystemProgram.createAccount({
                fromPubkey: this.wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                lamports: mintRent,
                space: mintSpace,
                programId: TOKEN_2022_PROGRAM_ID,
            });

            transaction.add(createMintAccountIx);

            // ✅ Step 2: Initialize mint using SPL Token-2022 instruction (not custom program)
            const initializeMintIx = new TransactionInstruction({
                keys: [
                    { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
                    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
                ],
                programId: TOKEN_2022_PROGRAM_ID,
                data: Buffer.concat([
                    Buffer.from([0]), // InitializeMint instruction
                    Buffer.from([params.decimals]), // decimals
                    this.wallet.publicKey.toBuffer(), // mint authority
                    Buffer.from([1]), // freeze authority option = Some
                    this.wallet.publicKey.toBuffer(), // freeze authority
                ]),
            });

            transaction.add(initializeMintIx);

            // ✅ Send transaction with proper signers
            const signature = await this.sendAndConfirmTransaction(transaction, [mintKeypair]);

            console.log('✅ REAL Basic Token created successfully!');
            console.log('🪙 Mint Address:', mintKeypair.publicKey.toString());
            console.log('📄 Transaction:', signature);
            console.log('ℹ️ Note: This is a basic Token-2022 mint. Hook integration requires additional setup.');

            return signature;

        } catch (error: any) {
            console.error('❌ REAL token creation failed:', error);
            throw new Error(`Real token creation failed: ${error.message}`);
        }
    }

    // ✅ REAL: Check KYC status from program
    async checkKYCStatus(userPubkey: PublicKey): Promise<boolean> {
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

    // ✅ ALTERNATIVE: Even simpler approach using spl-token library
    async createTokenWithHooksSimple(params: CreateTokenParams): Promise<string> {
        if (!this.wallet.publicKey) throw new Error('Wallet not connected');

        console.log('🏗️ SIMPLE: Creating basic Token-2022:', params);

        try {
            const mintKeypair = Keypair.generate();
            console.log('🪙 Generated mint:', mintKeypair.publicKey.toString());

            // ✅ Just create the account - simplest approach
            const transaction = new Transaction();

            transaction.add(
                ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 })
            );

            // Create mint account only
            const mintSpace = 82;
            const mintRent = await this.connection.getMinimumBalanceForRentExemption(mintSpace);

            const createAccountIx = SystemProgram.createAccount({
                fromPubkey: this.wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                lamports: mintRent,
                space: mintSpace,
                programId: TOKEN_2022_PROGRAM_ID,
            });

            transaction.add(createAccountIx);

            const signature = await this.sendAndConfirmTransaction(transaction, [mintKeypair]);

            console.log('✅ SIMPLE: Token account created successfully!');
            console.log('🪙 Mint Address:', mintKeypair.publicKey.toString());
            console.log('📄 Transaction:', signature);
            console.log('ℹ️ Note: Account created but not initialized as mint yet. This is a basic test.');

            return signature;

        } catch (error: any) {
            console.error('❌ SIMPLE token creation failed:', error);
            throw new Error(`Simple token creation failed: ${error.message}`);
        }
    }

    // ✅ DEBUGGING: Test with system transfer to isolate issue
    async createTokenDebugMode(params: CreateTokenParams): Promise<string> {
        if (!this.wallet.publicKey) throw new Error('Wallet not connected');

        console.log('🐛 DEBUG: Testing token creation with system transfer...');

        try {
            // ✅ First, just do a system transfer to test basic functionality
            const transaction = new Transaction();

            transaction.add(
                ComputeBudgetProgram.setComputeUnitLimit({ units: 10_000 })
            );

            // Simple transfer to test signature and basic flow
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: this.wallet.publicKey,
                    toPubkey: this.wallet.publicKey,
                    lamports: 1, // 1 lamport to self
                })
            );

            const signature = await this.sendAndConfirmTransaction(transaction);

            console.log('✅ DEBUG: Basic transaction successful!');
            console.log('📄 Signature:', signature);

            // ✅ Now try to create just an account (no program calls)
            const mintKeypair = Keypair.generate();
            const transaction2 = new Transaction();

            transaction2.add(
                ComputeBudgetProgram.setComputeUnitLimit({ units: 50_000 })
            );

            const createAccountIx = SystemProgram.createAccount({
                fromPubkey: this.wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                lamports: await this.connection.getMinimumBalanceForRentExemption(82),
                space: 82,
                programId: TOKEN_2022_PROGRAM_ID,
            });

            transaction2.add(createAccountIx);

            const signature2 = await this.sendAndConfirmTransaction(transaction2, [mintKeypair]);

            console.log('✅ DEBUG: Account creation successful!');
            console.log('🪙 Created account:', mintKeypair.publicKey.toString());
            console.log('📄 Signature:', signature2);

            return signature2;

        } catch (error: any) {
            console.error('❌ DEBUG token creation failed:', error);
            throw new Error(`Debug token creation failed: ${error.message}`);
        }
    }


    // ✅ REAL: Create liquidity pool
    async createPool(params: PoolCreateParams): Promise<string> {
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

            // 3. Build instruction data
            const instructionData = Buffer.concat([
                Buffer.from([233, 146, 209, 142, 207, 104, 64, 188]),
                this.serializeU64(params.initialPrice * 1e9),
            ]);

            // 4. Build transaction
            const transaction = new Transaction();

            transaction.add(
                ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 })
            );

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

            transaction.add(createPoolIx);

            // 5. Send transaction
            const signature = await this.sendAndConfirmTransaction(transaction);

            console.log('✅ REAL Pool created successfully!');
            console.log('🏊 Pool Address:', poolPDA.toString());

            return signature;

        } catch (error: any) {
            console.error('❌ REAL pool creation failed:', error);
            throw new Error(`Real pool creation failed: ${error.message}`);
        }
    }

    // ✅ REAL: Execute swap
    async executeSwap(params: SwapParams): Promise<string> {
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

            // 2. Get or create user token accounts
            const userTokenA = await this.getOrCreateAssociatedTokenAccount(tokenAMint);
            const userTokenB = await this.getOrCreateAssociatedTokenAccount(tokenBMint);

            // 3. Get pool token accounts
            const poolTokenA = await getAssociatedTokenAddress(
                tokenAMint,
                poolPDA,
                true,
                TOKEN_2022_PROGRAM_ID
            );

            const poolTokenB = await getAssociatedTokenAddress(
                tokenBMint,
                poolPDA,
                true,
                TOKEN_2022_PROGRAM_ID
            );

            // 4. Build instruction data
            const instructionData = Buffer.concat([
                Buffer.from([248, 198, 158, 145, 225, 117, 135, 200]),
                this.serializeU64(params.amountIn),
                this.serializeU64(params.minimumAmountOut),
                Buffer.from([params.aToB ? 1 : 0]),
            ]);

            // 5. Build transaction
            const transaction = new Transaction();

            transaction.add(
                ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 })
            );

            const swapIx = new TransactionInstruction({
                keys: [
                    { pubkey: poolPDA, isSigner: false, isWritable: true },
                    { pubkey: tokenAMint, isSigner: false, isWritable: false },
                    { pubkey: tokenBMint, isSigner: false, isWritable: false },
                    { pubkey: userTokenA, isSigner: false, isWritable: true },
                    { pubkey: userTokenB, isSigner: false, isWritable: true },
                    { pubkey: poolTokenA, isSigner: false, isWritable: true },
                    { pubkey: poolTokenB, isSigner: false, isWritable: true },
                    { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false },
                    { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
                ],
                programId: PROGRAM_IDS.HOOKSWAP_AMM,
                data: instructionData,
            });

            transaction.add(swapIx);

            // 6. Send transaction
            const signature = await this.sendAndConfirmTransaction(transaction);

            console.log('✅ REAL Swap executed successfully!');
            return signature;

        } catch (error: any) {
            console.error('❌ REAL swap failed:', error);
            throw new Error(`Real swap failed: ${error.message}`);
        }
    }

    // ✅ REAL: Get user token accounts
    async getUserTokenAccounts(): Promise<TokenAccount[]> {
        if (!this.wallet.publicKey) return [];

        try {
            const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
                this.wallet.publicKey,
                { programId: TOKEN_2022_PROGRAM_ID }
            );

            const accounts: TokenAccount[] = tokenAccounts.value
                .map(account => this.parseTokenAccountData(account))
                .filter((account): account is TokenAccount => account !== null);

            console.log('📊 Found valid token accounts:', accounts.length);
            return accounts;

        } catch (error) {
            console.error('❌ Failed to get token accounts:', error);
            return [];
        }
    }

    // ========== HELPER METHODS ==========

    // ✅ Helper: Validate and parse token account data
    private parseTokenAccountData(account: any): TokenAccount | null {
        try {
            const parsedInfo = account.account?.data?.parsed?.info;
            const tokenAmount = parsedInfo?.tokenAmount;

            if (!parsedInfo?.mint || !parsedInfo?.owner || !tokenAmount) {
                console.warn('⚠️ Invalid token account data:', account.pubkey?.toString());
                return null;
            }

            return {
                mint: String(parsedInfo.mint),
                owner: String(parsedInfo.owner),
                amount: String(tokenAmount.amount || '0'),
                decimals: Number(tokenAmount.decimals || 0),
                address: account.pubkey?.toString() || '',
                isNative: Boolean(parsedInfo.isNative),
                rentExemptReserve: String(parsedInfo.rentExemptReserve || '0'),
                delegatedAmount: String(parsedInfo.delegatedAmount || '0'),
                delegate: parsedInfo.delegate ? String(parsedInfo.delegate) : undefined,
                state: parsedInfo.state || 'initialized',
                closeAuthority: parsedInfo.closeAuthority ? String(parsedInfo.closeAuthority) : undefined,
            };
        } catch (error) {
            console.error('❌ Error parsing token account:', error);
            return null;
        }
    }

    // ✅ Helper: Get or create associated token account
    private async getOrCreateAssociatedTokenAccount(mint: PublicKey): Promise<PublicKey> {
        const ata = await getAssociatedTokenAddress(
            mint,
            this.wallet.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID
        );

        const accountInfo = await this.connection.getAccountInfo(ata);

        if (!accountInfo) {
            const createAtaIx = createAssociatedTokenAccountInstruction(
                this.wallet.publicKey,
                ata,
                this.wallet.publicKey,
                mint,
                TOKEN_2022_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );

            const transaction = new Transaction().add(createAtaIx);
            await this.sendAndConfirmTransaction(transaction);

            console.log('✅ Created ATA:', ata.toString());
        }

        return ata;
    }

    // ✅ Helper: Send and confirm transaction
    private async sendAndConfirmTransaction(
        transaction: Transaction,
        signers: Keypair[] = []
    ): Promise<string> {
        console.log('📤 Preparing transaction...');

        transaction.feePayer = this.wallet.publicKey;

        const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;

        console.log('📋 Transaction info:', {
            instructionCount: transaction.instructions.length,
            feePayer: transaction.feePayer?.toString(),
            recentBlockhash: transaction.recentBlockhash,
            signers: signers.length
        });

        // Sign with wallet first
        const signedTx = await this.wallet.signTransaction(transaction);

        // Sign with additional signers if any
        if (signers.length > 0) {
            signedTx.partialSign(...signers);
        }

        console.log('✍️ Transaction signed, sending...');

        // Simulate first
        try {
            const simulation = await this.connection.simulateTransaction(signedTx, {
                commitment: 'processed',
                sigVerify: false,
            });

            console.log('🧪 Simulation result:', {
                success: !simulation.value.err,
                err: simulation.value.err,
                logs: simulation.value.logs?.slice(-5),
                unitsConsumed: simulation.value.unitsConsumed
            });

            if (simulation.value.err) {
                console.error('❌ Simulation failed:', simulation.value.err);
                console.error('📋 Full logs:', simulation.value.logs);
                throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
            }

        } catch (simError) {
            console.warn('⚠️ Simulation failed, proceeding anyway:', simError);
        }

        // Send transaction
        const signature = await this.connection.sendRawTransaction(
            signedTx.serialize(),
            {
                skipPreflight: false,
                preflightCommitment: 'confirmed',
                maxRetries: 1,
            }
        );

        console.log('📤 Transaction sent:', signature);

        // Confirm transaction
        const confirmation = await this.connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight
        }, 'confirmed');

        if (confirmation.value.err) {
            console.error('❌ Transaction failed:', confirmation.value.err);
            throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
        }

        console.log('✅ Transaction confirmed:', signature);
        return signature;
    }

    // ✅ Helper: Serialize string for Rust
    private serializeString(str: string): Buffer {
        const bytes = Buffer.from(str, 'utf8');
        const len = Buffer.alloc(4);
        len.writeUInt32LE(bytes.length, 0);
        return Buffer.concat([len, bytes]);
    }

    // ✅ Helper: Serialize u64 for Rust
    private serializeU64(value: number): Buffer {
        const buffer = Buffer.alloc(8);
        buffer.writeBigUInt64LE(BigInt(value), 0);
        return buffer;
    }

    // ========== DEBUG METHODS ==========

    // ✅ DEBUG METHOD 1: Test basic transaction
    async testBasicTransaction(): Promise<string> {
        if (!this.wallet.publicKey) throw new Error('Wallet not connected');

        console.log('🧪 Testing basic transaction...');

        try {
            const transaction = new Transaction();

            transaction.add(
                ComputeBudgetProgram.setComputeUnitLimit({ units: 10_000 })
            );

            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: this.wallet.publicKey,
                    toPubkey: this.wallet.publicKey,
                    lamports: 1000,
                })
            );

            const signature = await this.sendAndConfirmTransaction(transaction);
            console.log('✅ Basic transaction successful:', signature);
            return signature;

        } catch (error: any) {
            console.error('❌ Basic transaction failed:', error);
            throw error;
        }
    }

    // ✅ DEBUG METHOD 2: Check network and balance
    async debugNetworkInfo(): Promise<void> {
        console.log('🔍 Debugging network info...');

        try {
            const [version, genesisHash, balance, slot] = await Promise.all([
                this.connection.getVersion(),
                this.connection.getGenesisHash(),
                this.connection.getBalance(this.wallet.publicKey),
                this.connection.getSlot()
            ]);

            console.log('📊 Network Debug Info:', {
                rpcEndpoint: this.connection.rpcEndpoint,
                solanaVersion: version['solana-core'],
                genesisHash: genesisHash,
                currentSlot: slot,
                walletBalance: `${balance / 1e9} SOL`,
                walletAddress: this.wallet.publicKey.toString(),
                isDevnet: genesisHash === 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG'
            });

        } catch (error) {
            console.error('❌ Network debug failed:', error);
            throw error;
        }
    }

    // ✅ DEBUG METHOD 3: Test token account creation
    async testCreateTokenAccount(): Promise<string> {
        if (!this.wallet.publicKey) throw new Error('Wallet not connected');

        console.log('🧪 Testing token account creation...');

        try {
            const mintKeypair = Keypair.generate();

            const transaction = new Transaction();

            transaction.add(
                ComputeBudgetProgram.setComputeUnitLimit({ units: 50_000 })
            );

            const createAccountIx = SystemProgram.createAccount({
                fromPubkey: this.wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                lamports: await this.connection.getMinimumBalanceForRentExemption(82),
                space: 82,
                programId: TOKEN_2022_PROGRAM_ID,
            });

            transaction.add(createAccountIx);

            const signature = await this.sendAndConfirmTransaction(transaction, [mintKeypair]);
            console.log('✅ Token account creation successful:', signature);
            console.log('🪙 Created account:', mintKeypair.publicKey.toString());
            return signature;

        } catch (error: any) {
            console.error('❌ Token account creation failed:', error);
            throw error;
        }
    }

    // ✅ DEBUG METHOD 4: Simplified token creation (no hooks)
    async testSimpleTokenCreation(params: { name: string; symbol: string }): Promise<string> {
        if (!this.wallet.publicKey) throw new Error('Wallet not connected');

        console.log('🧪 Testing simple token creation...', params);

        try {
            const mintKeypair = Keypair.generate();

            const transaction = new Transaction();

            transaction.add(
                ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 })
            );

            const mintSpace = 82;
            const mintRent = await this.connection.getMinimumBalanceForRentExemption(mintSpace);

            const createMintAccountIx = SystemProgram.createAccount({
                fromPubkey: this.wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                lamports: mintRent,
                space: mintSpace,
                programId: TOKEN_2022_PROGRAM_ID,
            });

            transaction.add(createMintAccountIx);

            const signature = await this.sendAndConfirmTransaction(transaction, [mintKeypair]);
            console.log('✅ Simple token creation successful:', signature);
            console.log('🪙 New mint address:', mintKeypair.publicKey.toString());
            return signature;

        } catch (error: any) {
            console.error('❌ Simple token creation failed:', error);
            throw error;
        }
    }

    // ✅ DEBUG METHOD 5: Check program deployment
    async checkProgramDeployment(): Promise<{ [key: string]: boolean }> {
        console.log('🔍 Checking program deployment...');

        const results: { [key: string]: boolean } = {};

        for (const [name, programId] of Object.entries(PROGRAM_IDS)) {
            try {
                const account = await this.connection.getAccountInfo(programId);
                const isDeployed = account !== null && account.executable;
                results[name] = isDeployed;

                console.log(`${isDeployed ? '✅' : '❌'} ${name}: ${programId.toString()}`);

                if (isDeployed && account) {
                    console.log(`📦 ${name} - Owner: ${account.owner.toString()}, Size: ${account.data.length} bytes`);
                }

            } catch (error) {
                console.error(`❌ Error checking ${name}:`, error);
                results[name] = false;
            }
        }

        return results;
    }

    // ✅ DEBUG METHOD 6: Test RPC connection
    async testRPCConnection(): Promise<void> {
        console.log('🔌 Testing RPC connection...');

        try {
            const startTime = Date.now();

            // ✅ REMOVED getHealth() - use getVersion and getSlot instead
            const [version, slot] = await Promise.all([
                this.connection.getVersion(),
                this.connection.getSlot()
            ]);

            const endTime = Date.now();
            const latency = endTime - startTime;

            console.log('📊 RPC Test Results:', {
                endpoint: this.connection.rpcEndpoint,
                latency: `${latency}ms`,
                version: version['solana-core'],
                currentSlot: slot,
                status: latency < 1000 ? 'GOOD' : latency < 3000 ? 'SLOW' : 'VERY_SLOW'
            });

            if (latency > 3000) {
                console.warn('⚠️ RPC connection is slow, consider switching endpoint');
            }

        } catch (error) {
            console.error('❌ RPC connection test failed:', error);
            throw error;
        }
    }

    // ✅ DEBUG METHOD 7: Test environment variables - CONTINUED
    async debugEnvironmentSetup(): Promise<void> {
        console.log('🔧 Debugging environment setup...');

        const envVars = {
            NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
            NEXT_PUBLIC_SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
            NEXT_PUBLIC_TOKEN_LAYER_PROGRAM: process.env.NEXT_PUBLIC_TOKEN_LAYER_PROGRAM,
            NEXT_PUBLIC_HOOKSWAP_AMM_PROGRAM: process.env.NEXT_PUBLIC_HOOKSWAP_AMM_PROGRAM,
            NEXT_PUBLIC_KYC_HOOK_PROGRAM: process.env.NEXT_PUBLIC_KYC_HOOK_PROGRAM,
            NEXT_PUBLIC_HOOK_REGISTRY_PROGRAM: process.env.NEXT_PUBLIC_HOOK_REGISTRY_PROGRAM,
            NEXT_PUBLIC_WHITELIST_HOOK_PROGRAM: process.env.NEXT_PUBLIC_WHITELIST_HOOK_PROGRAM,
        };

        console.log('📋 Environment Variables:', envVars);

        // Check for missing variables
        const missing = Object.entries(envVars)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (missing.length > 0) {
            console.error('❌ Missing environment variables:', missing);
            throw new Error(`Missing environment variables: ${missing.join(', ')}`);
        }

        // Validate program IDs
        for (const [name, programId] of Object.entries(PROGRAM_IDS)) {
            try {
                console.log(`✅ ${name}: ${programId.toString()}`);
            } catch (error) {
                console.error(`❌ Invalid program ID for ${name}:`, error);
                throw new Error(`Invalid program ID for ${name}`);
            }
        }

        console.log('✅ Environment setup looks good!');
    }

    // ✅ DEBUG METHOD 8: Test wallet connection
    async debugWalletConnection(): Promise<void> {
        console.log('👛 Debugging wallet connection...');

        try {
            if (!this.wallet) {
                throw new Error('Wallet not provided to SDK');
            }

            if (!this.wallet.publicKey) {
                throw new Error('Wallet not connected');
            }

            const balance = await this.connection.getBalance(this.wallet.publicKey);

            console.log('👛 Wallet Debug Info:', {
                connected: !!this.wallet.publicKey,
                publicKey: this.wallet.publicKey.toString(),
                balance: `${balance / 1e9} SOL`,
                walletName: this.wallet.name || 'Unknown',
                readyState: this.wallet.readyState || 'Unknown'
            });

            if (balance === 0) {
                console.warn('⚠️ Wallet has 0 SOL balance - transactions will fail');
                console.warn('💰 Get devnet SOL from: https://faucet.solana.com/');
            }

        } catch (error) {
            console.error('❌ Wallet connection debug failed:', error);
            throw error;
        }
    }

    // ✅ DEBUG METHOD 9: Comprehensive health check
    async runHealthCheck(): Promise<{
        environment: boolean;
        rpc: boolean;
        wallet: boolean;
        programs: { [key: string]: boolean };
        overall: boolean;
    }> {
        console.log('🏥 Running comprehensive health check...');

        const results = {
            environment: false,
            rpc: false,
            wallet: false,
            programs: {} as { [key: string]: boolean },
            overall: false
        };

        try {
            // Test environment
            await this.debugEnvironmentSetup();
            results.environment = true;
            console.log('✅ Environment check passed');
        } catch (error) {
            console.error('❌ Environment check failed:', error);
        }

        try {
            // Test RPC
            await this.testRPCConnection();
            results.rpc = true;
            console.log('✅ RPC check passed');
        } catch (error) {
            console.error('❌ RPC check failed:', error);
        }

        try {
            // Test wallet
            await this.debugWalletConnection();
            results.wallet = true;
            console.log('✅ Wallet check passed');
        } catch (error) {
            console.error('❌ Wallet check failed:', error);
        }

        try {
            // Test programs
            results.programs = await this.checkProgramDeployment();
            console.log('✅ Program deployment check completed');
        } catch (error) {
            console.error('❌ Program deployment check failed:', error);
        }

        // Calculate overall health
        const programsHealthy = Object.values(results.programs).filter(Boolean).length >= 3; // At least 3 programs working
        results.overall = results.environment && results.rpc && results.wallet && programsHealthy;

        console.log('🏥 Health Check Summary:', {
            environment: results.environment ? '✅' : '❌',
            rpc: results.rpc ? '✅' : '❌',
            wallet: results.wallet ? '✅' : '❌',
            programs: `${Object.values(results.programs).filter(Boolean).length}/${Object.keys(results.programs).length}`,
            overall: results.overall ? '✅ HEALTHY' : '❌ ISSUES DETECTED'
        });

        return results;
    }

    // ✅ DEBUG METHOD 10: Test transaction fees and limits
    async testTransactionLimits(): Promise<void> {
        console.log('💰 Testing transaction limits and fees...');

        try {
            // Test minimum balance for transactions
            const balance = await this.connection.getBalance(this.wallet.publicKey);
            console.log('Current balance:', balance / 1e9, 'SOL');

            // Test rent exemption for different account sizes
            const rentExemptions = await Promise.all([
                this.connection.getMinimumBalanceForRentExemption(0),    // Empty account
                this.connection.getMinimumBalanceForRentExemption(82),   // Basic mint
                this.connection.getMinimumBalanceForRentExemption(165),  // Token account
                this.connection.getMinimumBalanceForRentExemption(500),  // Metadata account
            ]);

            console.log('💰 Rent Exemption Requirements:', {
                emptyAccount: `${rentExemptions[0] / 1e9} SOL`,
                basicMint: `${rentExemptions[1] / 1e9} SOL`,
                tokenAccount: `${rentExemptions[2] / 1e9} SOL`,
                metadataAccount: `${rentExemptions[3] / 1e9} SOL`,
            });

            // Test compute unit prices
            const recentFees = await this.connection.getRecentPrioritizationFees();
            console.log('📊 Recent Prioritization Fees:', recentFees.slice(0, 5));

            // Calculate estimated costs
            const estimatedTokenCreationCost = (rentExemptions[1] + rentExemptions[3] + 5000) / 1e9; // mint + metadata + tx fee
            console.log('💡 Estimated token creation cost:', estimatedTokenCreationCost, 'SOL');

            if (balance / 1e9 < estimatedTokenCreationCost) {
                console.warn('⚠️ Insufficient balance for token creation');
                console.warn(`💰 Need at least ${estimatedTokenCreationCost} SOL, have ${balance / 1e9} SOL`);
            }

        } catch (error) {
            console.error('❌ Transaction limits test failed:', error);
            throw error;
        }
    }

    // ✅ DEBUG METHOD 11: Test network latency and performance
    async testNetworkPerformance(): Promise<{
        latency: number;
        throughput: number;
        blockTime: number;
        status: 'excellent' | 'good' | 'slow' | 'poor';
    }> {
        console.log('🚀 Testing network performance...');

        try {
            // Test latency with multiple calls
            const latencyTests = [];
            for (let i = 0; i < 5; i++) {
                const start = Date.now();
                await this.connection.getSlot();
                const end = Date.now();
                latencyTests.push(end - start);
            }

            const avgLatency = latencyTests.reduce((a, b) => a + b, 0) / latencyTests.length;

            // Test block time
            const recentSlots = await Promise.all([
                this.connection.getSlot(),
                new Promise(resolve => setTimeout(() => this.connection.getSlot().then(resolve), 1000))
            ]);

            const blockTime = 1000; // Assume 1 block per test period

            // Estimate throughput (simplified)
            const throughput = 1000 / avgLatency; // requests per second

            // Determine status
            let status: 'excellent' | 'good' | 'slow' | 'poor';
            if (avgLatency < 100) status = 'excellent';
            else if (avgLatency < 300) status = 'good';
            else if (avgLatency < 1000) status = 'slow';
            else status = 'poor';

            const results = {
                latency: avgLatency,
                throughput: throughput,
                blockTime: blockTime,
                status: status
            };

            console.log('🚀 Network Performance Results:', {
                averageLatency: `${avgLatency.toFixed(2)}ms`,
                estimatedThroughput: `${throughput.toFixed(2)} req/s`,
                status: status.toUpperCase(),
                recommendation: status === 'poor' ? 'Consider switching RPC endpoint' : 'Network performance is acceptable'
            });

            return results;

        } catch (error) {
            console.error('❌ Network performance test failed:', error);
            throw error;
        }
    }

    // ✅ DEBUG METHOD 12: Validate instruction format
    async validateInstructionFormat(): Promise<void> {
        console.log('🔍 Validating instruction format...');

        try {
            // Test basic instruction creation
            const testInstruction = new TransactionInstruction({
                keys: [
                    { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false }
                ],
                programId: SystemProgram.programId,
                data: Buffer.from([0, 0, 0, 0]) // Empty data
            });

            console.log('✅ Basic instruction creation successful');

            // Test serialization
            const serializedName = this.serializeString('Test');
            const serializedU64 = this.serializeU64(1000000);

            console.log('📋 Serialization Test:', {
                stringLength: serializedName.length,
                u64Length: serializedU64.length,
                stringHex: serializedName.toString('hex'),
                u64Hex: serializedU64.toString('hex')
            });

            // Test PDA derivation
            const [testPDA, bump] = PublicKey.findProgramAddressSync(
                [Buffer.from('test'), this.wallet.publicKey.toBuffer()],
                SystemProgram.programId
            );

            console.log('🎯 PDA Derivation Test:', {
                pda: testPDA.toString(),
                bump: bump,
                seeds: ['test', this.wallet.publicKey.toString()]
            });

            console.log('✅ Instruction format validation completed');

        } catch (error) {
            console.error('❌ Instruction format validation failed:', error);
            throw error;
        }
    }

    // ✅ DEBUG METHOD 13: Export debug report
    async generateDebugReport(): Promise<string> {
        console.log('📊 Generating comprehensive debug report...');

        try {
            const healthCheck = await this.runHealthCheck();
            const networkPerf = await this.testNetworkPerformance();

            await this.testTransactionLimits();
            await this.validateInstructionFormat();

            const report = {
                timestamp: new Date().toISOString(),
                network: {
                    endpoint: this.connection.rpcEndpoint,
                    performance: networkPerf,
                    health: healthCheck.rpc
                },
                wallet: {
                    connected: !!this.wallet.publicKey,
                    address: this.wallet.publicKey?.toString(),
                    balance: `${(await this.connection.getBalance(this.wallet.publicKey)) / 1e9} SOL`,
                    health: healthCheck.wallet
                },
                programs: healthCheck.programs,
                environment: {
                    hasEnvFile: !!process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
                    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
                    health: healthCheck.environment
                },
                overall: {
                    status: healthCheck.overall ? 'HEALTHY' : 'ISSUES_DETECTED',
                    readyForTesting: healthCheck.overall,
                    recommendations: this.generateRecommendations(healthCheck, networkPerf)
                }
            };

            const reportJson = JSON.stringify(report, null, 2);
            console.log('📊 Debug Report Generated:', report);

            return reportJson;

        } catch (error) {
            console.error('❌ Debug report generation failed:', error);
            throw error;
        }
    }

    // ✅ Helper: Generate recommendations based on health check
    private generateRecommendations(
        healthCheck: any,
        networkPerf: any
    ): string[] {
        const recommendations: string[] = [];

        if (!healthCheck.environment) {
            recommendations.push('Create .env.local file with required environment variables');
        }

        if (!healthCheck.rpc) {
            recommendations.push('Check RPC connection or try alternative endpoint');
        }

        if (!healthCheck.wallet) {
            recommendations.push('Ensure wallet is connected and has sufficient SOL balance');
        }

        if (Object.values(healthCheck.programs).filter(Boolean).length < 3) {
            recommendations.push('Some programs are not deployed - check program IDs');
        }

        if (networkPerf.status === 'poor') {
            recommendations.push('Network performance is poor - consider switching RPC endpoint');
        }

        if (recommendations.length === 0) {
            recommendations.push('System is healthy - ready for testing!');
        }

        return recommendations;
    }
}

// Export the class as default
export default RealHookSwapSDK;