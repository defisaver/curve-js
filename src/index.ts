import { ethers, Networkish } from "ethers";
import { PoolTemplate, getPool } from "./pools/index.js";
import {
    getUserPoolListByLiquidity,
    getUserPoolListByClaimable,
    getUserPoolList,
    getUserLiquidityUSD,
    getUserClaimable,
} from "./pools/utils.js";
import {
    getBestRouteAndOutput,
    getArgs,
    swapExpected,
    swapRequired,
    swapPriceImpact,
    swapIsApproved,
    swapApproveEstimateGas,
    swapApprove,
    swapEstimateGas,
    swap,
    getSwappedAmount,
} from "./router.js";
import { curve as _curve } from "./curve.js";
import {
    getCrv,
    getLockedAmountAndUnlockTime,
    getVeCrv,
    getVeCrvPct,
    calcUnlockTime,
    createLockEstimateGas,
    createLock,
    isApproved,
    approveEstimateGas,
    approve,
    increaseAmountEstimateGas,
    increaseAmount,
    increaseUnlockTimeEstimateGas,
    increaseUnlockTime,
    withdrawLockedCrvEstimateGas,
    withdrawLockedCrv,
    claimableFees,
    claimFeesEstimateGas,
    claimFees,
    lastEthBlock,
    getAnycallBalance,
    topUpAnycall,
    topUpAnycallEstimateGas,
    lastBlockSent,
    blockToSend,
    sendBlockhash,
    sendBlockhashEstimateGas,
    submitProof,
    submitProofEstimateGas,
} from "./boosting.js";
import {
    getBalances,
    getAllowance,
    hasAllowance,
    ensureAllowanceEstimateGas,
    ensureAllowance,
    getUsdRate,
    getGasPriceFromL1,
    getGasPriceFromL2,
    getTVL,
    getCoinsData,
    getVolume,
    hasDepositAndStake,
    hasRouter,
} from "./utils.js";
import {
    deployStablePlainPool,
    deployStablePlainPoolEstimateGas,
    getDeployedStablePlainPoolAddress,
    setOracle,
    setOracleEstimateGas,
    deployStableMetaPool,
    deployStableMetaPoolEstimateGas,
    getDeployedStableMetaPoolAddress,
    deployCryptoPool,
    deployCryptoPoolEstimateGas,
    getDeployedCryptoPoolAddress,
    deployTricryptoPool,
    deployTricryptoPoolEstimateGas,
    getDeployedTricryptoPoolAddress,
    deployGauge,
    deployGaugeEstimateGas,
    getDeployedGaugeAddress,
    deployGaugeSidechain,
    deployGaugeSidechainEstimateGas,
    deployGaugeMirror,
    deployGaugeMirrorEstimateGas,
    getDeployedGaugeMirrorAddress,
    getDeployedGaugeMirrorAddressByTx,
    deployStableNgPlainPool,
    deployStableNgPlainPoolEstimateGas,
    deployStableNgMetaPool,
    deployStableNgMetaPoolEstimateGas,
} from './factory/deploy.js';
import {
    crvSupplyStats,
    userCrv,
    userVeCrv,
    crvLockIsApproved,
    crvLockApproveEstimateGas,
    crvLockApprove,
    calcCrvUnlockTime,
    createCrvLockEstimateGas,
    createCrvLock,
    increaseCrvLockedAmountEstimateGas,
    increaseCrvLockedAmount,
    increaseCrvUnlockTimeEstimateGas,
    increaseCrvUnlockTime,
    withdrawLockedCrvEstimateGas as daoWithdrawLockedCrvEstimateGas,
    withdrawLockedCrv as daoWithdrawLockedCrv,
    claimableFees as daoClaimableFees,
    claimFeesEstimateGas as daoClaimFeesEstimateGas,
    claimFees as daoClaimFees,
    getVotingGaugeList,
    userGaugeVotes,
    voteForGaugeNextTime,
    voteForGaugeEstimateGas,
    voteForGauge,
    getProposalList,
    getProposal,
    userProposalVotes,
    voteForProposalEstimateGas,
    voteForProposal,
} from "./dao.js";

async function init (
    providerType: 'JsonRpc' | 'Web3' | 'Infura' | 'Alchemy',
    providerSettings: { url?: string, privateKey?: string, batchMaxCount? : number } | { externalProvider: ethers.Eip1193Provider } | { network?: Networkish, apiKey?: string },
    options: { gasPrice?: number, maxFeePerGas?: number, maxPriorityFeePerGas?: number, chainId?: number } = {}
): Promise<void> {
    await _curve.init(providerType, providerSettings, options);
    // @ts-ignore
    this.signerAddress = _curve.signerAddress;
    // @ts-ignore
    this.chainId = _curve.chainId;
}

function setCustomFeeData (customFeeData: { gasPrice?: number, maxFeePerGas?: number, maxPriorityFeePerGas?: number }): void {
    _curve.setCustomFeeData(customFeeData);
}

const curve = {
    init,
    chainId: 0,
    signerAddress: '',
    setCustomFeeData,
    getPoolList: _curve.getPoolList,
    getMainPoolList: _curve.getMainPoolList,
    getUserPoolListByLiquidity,
    getUserPoolListByClaimable,
    getUserPoolList,
    getUserLiquidityUSD,
    getUserClaimable,
    PoolTemplate,
    getPool,
    getUsdRate,
    getGasPriceFromL1,
    getGasPriceFromL2,
    getTVL,
    getBalances,
    getAllowance,
    hasAllowance,
    ensureAllowance,
    getCoinsData,
    getVolume,
    hasDepositAndStake,
    hasRouter,
    factory: {
        fetchPools: _curve.fetchFactoryPools,
        fetchNewPools: _curve.fetchNewFactoryPools,
        getPoolList: _curve.getFactoryPoolList,
        deployPlainPool: deployStablePlainPool,
        setOracle,
        deployMetaPool: deployStableMetaPool,
        deployGauge: async (poolAddress: string): Promise<ethers.ContractTransactionResponse> => deployGauge(poolAddress, _curve.constants.ALIASES.factory),
        deployGaugeSidechain: async (poolAddress: string, salt: string): Promise<ethers.ContractTransactionResponse> => deployGaugeSidechain(poolAddress, salt),
        deployGaugeMirror: async (chainId: number, salt: string): Promise<ethers.ContractTransactionResponse> => deployGaugeMirror(chainId, salt),
        getDeployedPlainPoolAddress: getDeployedStablePlainPoolAddress,
        getDeployedMetaPoolAddress: getDeployedStableMetaPoolAddress,
        getDeployedGaugeAddress: getDeployedGaugeAddress,
        getDeployedGaugeMirrorAddress: getDeployedGaugeMirrorAddress,
        getDeployedGaugeMirrorAddressByTx: getDeployedGaugeMirrorAddressByTx,
        fetchRecentlyDeployedPool: _curve.fetchRecentlyDeployedFactoryPool,
        gaugeImplementation: (): string => _curve.getGaugeImplementation("factory"),
        estimateGas: {
            deployPlainPool: deployStablePlainPoolEstimateGas,
            setOracle: setOracleEstimateGas,
            deployMetaPool: deployStableMetaPoolEstimateGas,
            deployGauge: async (poolAddress: string): Promise<number> => deployGaugeEstimateGas(poolAddress, _curve.constants.ALIASES.factory),
            deployGaugeSidechain: async (poolAddress: string, salt: string): Promise<number> => deployGaugeSidechainEstimateGas(poolAddress, salt),
            deployGaugeMirror: async (chainId: number, salt: string): Promise<number> => deployGaugeMirrorEstimateGas(chainId, salt),
        },
    },
    crvUSDFactory: {
        fetchPools: _curve.fetchCrvusdFactoryPools,
        getPoolList: _curve.getCrvusdFactoryPoolList,
    },
    EYWAFactory: {
        fetchPools: _curve.fetchEywaFactoryPools,
        getPoolList: _curve.getEywaFactoryPoolList,
    },
    stableNgFactory: {
        fetchPools: _curve.fetchStableNgFactoryPools,
        fetchNewPools: _curve.fetchNewStableNgFactoryPools,
        getPoolList: _curve.getStableNgFactoryPoolList,
        deployPlainPool: deployStableNgPlainPool,
        deployMetaPool: deployStableNgMetaPool,
        getDeployedPlainPoolAddress: getDeployedStablePlainPoolAddress,
        getDeployedMetaPoolAddress: getDeployedStableMetaPoolAddress,
        fetchRecentlyDeployedPool: _curve.fetchRecentlyDeployedStableNgFactoryPool,
        estimateGas: {
            deployPlainPool: deployStableNgPlainPoolEstimateGas,
            deployMetaPool: deployStableNgMetaPoolEstimateGas,
        },
    },
    cryptoFactory: {
        fetchPools: _curve.fetchCryptoFactoryPools,
        fetchNewPools: _curve.fetchNewCryptoFactoryPools,
        getPoolList: _curve.getCryptoFactoryPoolList,
        deployPool: deployCryptoPool,
        deployGauge: async (poolAddress: string): Promise<ethers.ContractTransactionResponse> => deployGauge(poolAddress, _curve.constants.ALIASES.crypto_factory),
        deployGaugeSidechain: async (poolAddress: string, salt: string): Promise<ethers.ContractTransactionResponse> => deployGaugeSidechain(poolAddress, salt),
        deployGaugeMirror: async (chainId: number, salt: string): Promise<ethers.ContractTransactionResponse> => deployGaugeMirror(chainId, salt),
        getDeployedPoolAddress: getDeployedCryptoPoolAddress,
        getDeployedGaugeAddress: getDeployedGaugeAddress,
        getDeployedGaugeMirrorAddress: getDeployedGaugeMirrorAddress,
        getDeployedGaugeMirrorAddressByTx: getDeployedGaugeMirrorAddressByTx,
        fetchRecentlyDeployedPool: _curve.fetchRecentlyDeployedCryptoFactoryPool,
        gaugeImplementation: (): string => _curve.getGaugeImplementation("factory-crypto"),
        estimateGas: {
            deployPool: deployCryptoPoolEstimateGas,
            deployGauge: async (poolAddress: string): Promise<number> => deployGaugeEstimateGas(poolAddress, _curve.constants.ALIASES.crypto_factory),
            deployGaugeSidechain: async (poolAddress: string, salt: string): Promise<number> => deployGaugeSidechainEstimateGas(poolAddress, salt),
            deployGaugeMirror: async (chainId: number, salt: string): Promise<number> => deployGaugeMirrorEstimateGas(chainId, salt),
        },
    },
    tricryptoFactory: {
        fetchPools: _curve.fetchTricryptoFactoryPools,
        fetchNewPools: _curve.fetchNewTricryptoFactoryPools,
        getPoolList: _curve.getTricryptoFactoryPoolList,
        deployPool: deployTricryptoPool,
        deployGauge: async (poolAddress: string): Promise<ethers.ContractTransactionResponse> => deployGauge(poolAddress, _curve.constants.ALIASES.tricrypto_factory),
        deployGaugeSidechain: async (poolAddress: string, salt: string): Promise<ethers.ContractTransactionResponse> => deployGaugeSidechain(poolAddress, salt),
        deployGaugeMirror: async (chainId: number, salt: string): Promise<ethers.ContractTransactionResponse> => deployGaugeMirror(chainId, salt),
        getDeployedPoolAddress: getDeployedTricryptoPoolAddress,
        getDeployedGaugeAddress: getDeployedGaugeAddress,
        getDeployedGaugeMirrorAddress: getDeployedGaugeMirrorAddress,
        getDeployedGaugeMirrorAddressByTx: getDeployedGaugeMirrorAddressByTx,
        fetchRecentlyDeployedPool: _curve.fetchRecentlyDeployedTricryptoFactoryPool,
        gaugeImplementation: (): string => _curve.getGaugeImplementation("factory-tricrypto"),
        estimateGas: {
            deployPool: deployTricryptoPoolEstimateGas,
            deployGauge: async (poolAddress: string): Promise<number> => deployGaugeEstimateGas(poolAddress, _curve.constants.ALIASES.tricrypto_factory),
            deployGaugeSidechain: async (poolAddress: string, salt: string): Promise<number> => deployGaugeSidechainEstimateGas(poolAddress, salt),
            deployGaugeMirror: async (chainId: number, salt: string): Promise<number> => deployGaugeMirrorEstimateGas(chainId, salt),
        },
    },
    estimateGas: {
        ensureAllowance: ensureAllowanceEstimateGas,
    },
    boosting: {
        getCrv,
        getLockedAmountAndUnlockTime,
        getVeCrv,
        getVeCrvPct,
        calcUnlockTime,
        isApproved,
        approve,
        createLock,
        increaseAmount,
        increaseUnlockTime,
        withdrawLockedCrv,
        claimableFees,
        claimFees,
        estimateGas: {
            approve: approveEstimateGas,
            createLock: createLockEstimateGas,
            increaseAmount: increaseAmountEstimateGas,
            increaseUnlockTime: increaseUnlockTimeEstimateGas,
            withdrawLockedCrv: withdrawLockedCrvEstimateGas,
            claimFees: claimFeesEstimateGas,
        },
        sidechain: {
            lastEthBlock,
            getAnycallBalance,
            topUpAnycall,
            lastBlockSent,
            blockToSend,
            sendBlockhash,
            submitProof,
            estimateGas: {
                topUpAnycall: topUpAnycallEstimateGas,
                sendBlockhash: sendBlockhashEstimateGas,
                submitProof: submitProofEstimateGas,
            },
        },
    },
    router: {
        getBestRouteAndOutput,
        getArgs,
        expected: swapExpected,
        required: swapRequired,
        priceImpact: swapPriceImpact,
        isApproved: swapIsApproved,
        approve: swapApprove,
        swap,
        getSwappedAmount,
        estimateGas: {
            approve: swapApproveEstimateGas,
            swap: swapEstimateGas,
        },
    },
    dao: {
        // --- CRV lock ---

        // View methods
        crvSupplyStats,
        userCrv,
        userVeCrv,
        crvLockIsApproved,
        calcCrvUnlockTime,
        claimableFees: daoClaimableFees,
        // Transaction methods
        crvLockApprove,
        createCrvLock,
        increaseCrvLockedAmount,
        increaseCrvUnlockTime,
        withdrawLockedCrv: daoWithdrawLockedCrv,
        claimFees: daoClaimFees,


        // --- Gauge voting ---

        // View methods
        getVotingGaugeList,
        userGaugeVotes,
        voteForGaugeNextTime,
        // Transaction methods
        voteForGauge,

        // --- Proposal voting ---

        // View methods
        getProposalList,
        getProposal,
        userProposalVotes,
        // Transaction methods
        voteForProposal,

        estimateGas: {
            // --- CRV lock ---
            crvLockApprove: crvLockApproveEstimateGas,
            createCrvLock: createCrvLockEstimateGas,
            increaseCrvLockedAmount: increaseCrvLockedAmountEstimateGas,
            increaseCrvUnlockTime: increaseCrvUnlockTimeEstimateGas,
            withdrawLockedCrv: daoWithdrawLockedCrvEstimateGas,
            claimFees: daoClaimFeesEstimateGas,
            // --- Gauge voting ---
            voteForGauge: voteForGaugeEstimateGas,
            // --- Proposal voting ---
            voteForProposal: voteForProposalEstimateGas,
        },
    },
}

export default curve;
