interface Token {
  name: string;
  address: `0x${string}`;
  icon: string;
  decimals: number;
  vault?: string;
}

export interface GasChainType {
  name: string;
  address: string;
  chainId: number;
  endpointId: string;
  icon: string;
  tokens: Token[];
}

const gasChainsTokens: GasChainType[] = [

  {
    name: "Sepolia",
    address: "0x09545c0Cd0ddfd3B5EfBA5F093B3cA20b6ba4bB9",
    chainId: 11155111,
    endpointId: "40161",
    icon: "/chains/ethereum.webp",
    tokens: [
      {
        name: "ETH",
        address: "0x0000000000000000000000000000000000000000",
        icon: "/chains/ethereum.webp",
        decimals: 18,
      },
      {
        name: "WETH",
        address: "0xe5A19C6fC5481fd031B0317cAaE92FcBA8BA31d2",
        icon: "/tokens/weth.png",
        decimals: 18,
      },
      {
        name: "USDT",
        address: "0x0000000000000000000000000000000000000002",
        icon: "/tokens/usdt.png",
        decimals: 6,
      },
      {
        name: "DAI",
        address: "0x0000000000000000000000000000000000000003",
        icon: "/tokens/dai.svg",
        decimals: 18,
      },
      {
        name: "WBTC",
        address: "0x0000000000000000000000000000000000000004",
        icon: "/tokens/wbtc.svg",
        decimals: 8,
      },
      {
        name: "UNI",
        address: "0x0000000000000000000000000000000000000005",
        icon: "/tokens/uni.png",
        decimals: 6,
      },
    ],
  },
  {
    name: "Base Sepolia",
    address: "0xBBE5A39eD493150Be69D31Aa8780218247794152",
    chainId: 84532,
    endpointId: "40245",
    icon: "/chains/ethereum.webp",
    tokens: [
      {
        name: "ETH",
        address: "0x0000000000000000000000000000000000000000",
        icon: "/chains/ethereum.webp",
        decimals: 18,
      },
      {
        name: "OST",
        address: "0xC432004323f06ca58362A5EFd993A368c93d032b",
        icon: "/tokens/uni.png",
        decimals: 18,
      },
      {
        name: "WETH",
        address: "0x0000000000000000000000000000000000000001",
        icon: "/tokens/weth.png",
        decimals: 6,
      },
      {
        name: "USDT",
        address: "0x0000000000000000000000000000000000000002",
        icon: "/tokens/usdt.png",
        decimals: 6,
      },
    ],
  },
  {
    name: "Polygon",
    address: "0xBBE5A39eD493150Be69D31Aa8780218247794152",
    chainId: 137,
    icon: "/chains/polygon.png",
    endpointId: "40137",
    tokens: [
      {
        name: "Matic",
        address: "0x0000000000000000000000000000000000000000",
        icon: "/tokens/polygon.png",
        decimals: 18,
      },
      {
        name: "WMATIC",
        address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        vault: "0x28F53bA70E5c8ce8D03b1FaD41E9dF11Bb646c36",
        icon: "/tokens/wmatic.png",
        decimals: 18,
      },
      {
        name: "wBTC",
        address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
        vault: "0xCA1e732F5288AE957aD1F0a8Fb20FCe9282b1930",
        icon: "/tokens/wbtc.svg",
        decimals: 8,
      },
      {
        name: "WETH",
        address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        icon: "/tokens/weth.png",
        vault: "0x305F25377d0a39091e99B975558b1bdfC3975654",
        decimals: 18,
      },
      {
        name: "USDC",
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        icon: "/tokens/usdc.svg",
        decimals: 6,
      },
      {
        name: "USDT",
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        icon: "/tokens/usdt.png",
        decimals: 6,
      },
    ],
  },
  {
    name: "Polygon Fork",
    address: "0xBBE5A39eD493150Be69D31Aa8780218247794152",
    chainId: 1370,
    icon: "/chains/polygon.png",
    endpointId: "40137",
    tokens: [
      {
        name: "Matic",
        address: "0x0000000000000000000000000000000000000000",
        icon: "/tokens/polygon.png",
        decimals: 18,
      },
      {
        name: "WMATIC",
        address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        vault: "0x28F53bA70E5c8ce8D03b1FaD41E9dF11Bb646c36",
        icon: "/tokens/wmatic.png",
        decimals: 18,
      },
      {
        name: "wBTC",
        address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
        vault: "0xCA1e732F5288AE957aD1F0a8Fb20FCe9282b1930",
        icon: "/tokens/wbtc.svg",
        decimals: 8,
      },
      {
        name: "WETH",
        address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        icon: "/tokens/weth.png",
        vault: "0x305F25377d0a39091e99B975558b1bdfC3975654",
        decimals: 18,
      },
      {
        name: "USDC",
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
        icon: "/tokens/usdc.svg",
        decimals: 6,
      },
      {
        name: "USDT",
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        icon: "/tokens/usdt.png",
        decimals: 6,
      },
    ],
  },
  {
    name: "Base",
    address: "0xBBE5A39eD493150Be69D31Aa8780218247794152",
    chainId: 8453,
    icon: "/chains/base.svg",
    endpointId: "40161",
    tokens: [
      {
        name: "ETH",
        address: "0x0000000000000000000000000000000000000000",
        icon: "/chains/ethereum.webp",
        decimals: 18,
      },
      {
        name: "USDC",
        address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        icon: "/tokens/usdc.svg",
        decimals: 6,
      },
      {
        name: "cbBTC",
        address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
        icon: "/tokens/cbBTC.png",
        decimals: 8,
      },
    ],
  },
  {
    name: "Arbitrum One",
    address: "0xBBE5A39eD493150Be69D31Aa8780218247794152",
    chainId: 42161,
    icon: "/chains/arbitrum.svg",
    endpointId: "40161",
    tokens: [
      {
        name: "ETH",
        address: "0x0000000000000000000000000000000000000000",
        icon: "/chains/ethereum.webp",
        decimals: 18,
      },
      {
        name: "ARB",
        address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
        icon: "/chains/arbitrum.svg",
        decimals: 18,
      },
      {
        name: "USDe",
        address: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
        icon: "/tokens/usde.png",
        vault: "0x34a2b066AF16409648eF15d239E656edB8790ca0",
        decimals: 6,
      },
      {
        name: "USDT",
        address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        icon: "/tokens/usdt.png",
        decimals: 6,
      },
    ],
  },
];

function getChainById(chainId: number) {
  return gasChainsTokens.find((chain) => chain.chainId === chainId);
}

const getTokenInfo = (chainId: number, token: string) => {
  const chain = getChainById(chainId);
  try {
    return chain?.tokens.find(
      (item: any) => item.address.toLowerCase() == token?.toLowerCase()
    );
  } catch (e) {
    console.log("Error getting token info");
    //  return {};
  }
};

const findChainIndexByChainId = (chainId: number) => {
  return gasChainsTokens.findIndex((chain) => chain.chainId === chainId);
};
export { gasChainsTokens, getChainById, findChainIndexByChainId, getTokenInfo };
