import { ethers } from 'ethers';
import { Token, CurrencyAmount } from '@uniswap/sdk-core';
import { Pool, computePoolAddress, FeeAmount } from '@uniswap/v3-sdk';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import QuoterV2 from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json';



import { getJsonRpcProvider } from '../logic/web3';
import { getTokenDecimals } from '../logic/utils';

type UniswapContracts = {
  POOL_FACTORY_CONTRACT_ADDRESS: string;
  QUOTER_CONTRACT_ADDRESS: string;
};

// Define the type for the entire UNISWAP_CONTRACTS object
type UniswapContractsByChainId = {
  [chainId: number]: UniswapContracts;
}

const UNISWAP_CONTRACTS: UniswapContractsByChainId = {
  137: { // Mainnet
    POOL_FACTORY_CONTRACT_ADDRESS: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Uniswap V3 Factory
    QUOTER_CONTRACT_ADDRESS: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', // Uniswap V3 Quoter
  },
  11235: { // Mainnet
    POOL_FACTORY_CONTRACT_ADDRESS: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Uniswap V3 Factory
    QUOTER_CONTRACT_ADDRESS: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', // Uniswap V3 Quoter
  },
  8453 : { // Ropsten (example chain ID)
    POOL_FACTORY_CONTRACT_ADDRESS: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD', // Uniswap V3 Factory
    QUOTER_CONTRACT_ADDRESS: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a', // Uniswap V3 Quoter
  },
  1370: { // Mainnet
    POOL_FACTORY_CONTRACT_ADDRESS: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Uniswap V3 Factory
    QUOTER_CONTRACT_ADDRESS: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', // Uniswap V3 Quoter
  },
  84530 : { // Ropsten (example chain ID)
    POOL_FACTORY_CONTRACT_ADDRESS: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD', // Uniswap V3 Factory
    QUOTER_CONTRACT_ADDRESS: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a', // Uniswap V3 Quoter
  },
  11237 : { // Ropsten (example chain ID)
    POOL_FACTORY_CONTRACT_ADDRESS: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD', // Uniswap V3 Factory
    QUOTER_CONTRACT_ADDRESS: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a', // Uniswap V3 Quoter
  }
};

// Helper to get the amount of tokenB for a swap from tokenA
export async function getQuoteForSwap(
  chainId: number,
  tokenAAddress: string,
  tokenBAddress: string,
  amountIn: string,
  fee: FeeAmount = FeeAmount.MEDIUM
): Promise<string> {
  // Compute pool address

  console.log(tokenAAddress, tokenBAddress)
  const { POOL_FACTORY_CONTRACT_ADDRESS, QUOTER_CONTRACT_ADDRESS } = UNISWAP_CONTRACTS[chainId];

  const provider = await getJsonRpcProvider(
    chainId.toString()
  );
const tokenADecimals = Number(await getTokenDecimals(tokenAAddress, provider))
const tokenBDecimals = Number(await getTokenDecimals(tokenBAddress, provider))

console.log(tokenADecimals, tokenBDecimals)





const tokenA = new Token(chainId, tokenAAddress, tokenADecimals);  // Adjust decimals as needed (example: USDC has 6)
const tokenB = new Token(chainId, tokenBAddress, tokenBDecimals); // Adjust decimals as needed (example: WETH has 18)

  const poolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA,
    tokenB,
    fee,
  });

  // Reference the Pool contract
  const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI.abi, provider);

  // Fetch token and pool details
  const [token0, token1, liquidity, slot0] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  // Create a contract reference to the Quoter
  const quoterContract = new ethers.Contract(QUOTER_CONTRACT_ADDRESS, QuoterV2.abi, provider);

  // Get the quote (amount out) using quoteExactInputSingle
  const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall({
    tokenIn: tokenA.address,
    tokenOut:  tokenB.address,
    amountIn: ethers.parseUnits(amountIn, tokenA.decimals).toString(),
    fee: fee,
    sqrtPriceLimitX96: 0 
  }
);

  // Return the quoted amount out in human-readable format
  return ethers.formatUnits(quotedAmountOut[0], tokenB.decimals);
}
