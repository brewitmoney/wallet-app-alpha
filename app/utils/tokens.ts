interface Token {
  name: string;
  fullname: string;
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

  // {
  //   name: "Sepolia",
  //   address: "0x09545c0Cd0ddfd3B5EfBA5F093B3cA20b6ba4bB9",
  //   chainId: 11155111,
  //   endpointId: "40161",
  //   icon: "/chains/ethereum.webp",
  //   tokens: [
  //     {
  //       name: "ETH",
  //       fullname: "Ether",
  //       address: "0x0000000000000000000000000000000000000000",
  //       icon: "/chains/ethereum.webp",
  //       decimals: 18,
  //     },
  //     {
  //       name: "WETH",
  //       fullname: "Wrapped Ether",
  //       address: "0xe5A19C6fC5481fd031B0317cAaE92FcBA8BA31d2",
  //       icon: "/tokens/weth.png",
  //       decimals: 18,
  //     },
  //     {
  //       name: "USDT",
  //       fullname: "Tether",
  //       address: "0x0000000000000000000000000000000000000002",
  //       icon: "/tokens/usdt.png",
  //       decimals: 6,
  //     },
  //     {
  //       name: "DAI",
  //       fullname: "Dai",
  //       address: "0x0000000000000000000000000000000000000003",
  //       icon: "/tokens/dai.svg",
  //       decimals: 18,
  //     },
  //     {
  //       name: "WBTC",
  //       fullname: "Wrapped Bitcoin",
  //       address: "0x0000000000000000000000000000000000000004",
  //       icon: "/tokens/wbtc.svg",
  //       decimals: 8,
  //     },
  //     {
  //       name: "UNI",
  //       fullname: "Uniswap",
  //       address: "0x0000000000000000000000000000000000000005",
  //       icon: "/tokens/uni.png",
  //       decimals: 6,
  //     },
  //   ],
  // },
  // {
  //   name: "Base Sepolia",
  //   address: "0xBBE5A39eD493150Be69D31Aa8780218247794152",
  //   chainId: 84532,
  //   endpointId: "40245",
  //   icon: "/chains/ethereum.webp",
  //   tokens: [
  //     {
  //       name: "ETH",
  //       fullname: "Ether",
  //       address: "0x0000000000000000000000000000000000000000",
  //       icon: "/chains/ethereum.webp",
  //       decimals: 18,
  //     },
  //     {
  //       name: "OST",
  //       fullname: "Onchain Summer Token",
  //       address: "0xC432004323f06ca58362A5EFd993A368c93d032b",
  //       icon: "/tokens/uni.png",
  //       decimals: 18,
  //     },
  //     {
  //       name: "WETH",
  //       fullname: "Wrapped Ether",
  //       address: "0x0000000000000000000000000000000000000001",
  //       icon: "/tokens/weth.png",
  //       decimals: 6,
  //     },
  //     {
  //       name: "USDT",
  //       fullname: "Tether",
  //       address: "0x0000000000000000000000000000000000000002",
  //       icon: "/tokens/usdt.png",
  //       decimals: 6,
  //     },
  //   ],
  // },
  // {
  //   name: "Polygon",
  //   address: "0xBBE5A39eD493150Be69D31Aa8780218247794152",
  //   chainId: 137,
  //   icon: "/chains/polygon.png",
  //   endpointId: "40137",
  //   tokens: [
  //     {
  //       name: "POL",
  //       fullname: "Polygon",
  //       address: "0x0000000000000000000000000000000000000000",
  //       icon: "/tokens/polygon.png",
  //       decimals: 18,
  //     },
  //     {
  //       name: "WMATIC",
  //       fullname: "Wrapped Matic",
  //       address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  //       vault: "0x28F53bA70E5c8ce8D03b1FaD41E9dF11Bb646c36",
  //       icon: "/tokens/wmatic.png",
  //       decimals: 18,
  //     },
  //     {
  //       name: "wBTC",
  //       fullname: "Wrapped Bitcoin",
  //       address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
  //       vault: "0xCA1e732F5288AE957aD1F0a8Fb20FCe9282b1930",
  //       icon: "/tokens/wbtc.svg",
  //       decimals: 8,
  //     },
  //     {
  //       name: "WETH",
  //       fullname: "Wrapped Ether",
  //       address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  //       icon: "/tokens/weth.png",
  //       vault: "0x305F25377d0a39091e99B975558b1bdfC3975654",
  //       decimals: 18,
  //     },
  //     {
  //       name: "USDC",
  //       fullname: "USDC",
  //       address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  //       icon: "/tokens/usdc.svg",
  //       decimals: 6,
  //     },
  //     {
  //       name: "USDT",
  //       fullname: "Tether",
  //       address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  //       icon: "/tokens/usdt.png",
  //       decimals: 6,
  //     },
  //   ],
  // },
  // {
  //   name: "Polygon (Forked)",
  //   address: "0xBBE5A39eD493150Be69D31Aa8780218247794152",
  //   chainId: 1370,
  //   icon: "/chains/polygon.png",
  //   endpointId: "40137",
  //   tokens: [
  //     {
  //       name: "POL",
  //       fullname: "Polygon",
  //       address: "0x0000000000000000000000000000000000000000",
  //       icon: "/tokens/polygon.png",
  //       decimals: 18,
  //     },
  //     {
  //       name: "WMATIC",
  //       fullname: "Wrapped Matic",
  //       address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  //       vault: "0x28F53bA70E5c8ce8D03b1FaD41E9dF11Bb646c36",
  //       icon: "/tokens/wmatic.png",
  //       decimals: 18,
  //     },
  //     {
  //       name: "wBTC",
  //       fullname: "Wrapped Bitcoin",
  //       address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
  //       vault: "0xCA1e732F5288AE957aD1F0a8Fb20FCe9282b1930",
  //       icon: "/tokens/wbtc.svg",
  //       decimals: 8,
  //     },
  //     {
  //       name: "WETH",
  //       fullname: "Wrapped Ether",
  //       address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  //       icon: "/tokens/weth.png",
  //       vault: "0x305F25377d0a39091e99B975558b1bdfC3975654",
  //       decimals: 18,
  //     },
  //     {
  //       name: "USDC",
  //       fullname: "USDC",
  //       address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  //       icon: "/tokens/usdc.svg",
  //       decimals: 6,
  //     },
  //     {
  //       name: "USDT",
  //       fullname: "Tether",
  //       address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  //       icon: "/tokens/usdt.png",
  //       decimals: 6,
  //     },
  //   ],
  // },
  // {
  //   name: "Polygon (Sandbox)",
  //   address: "0xBBE5A39eD493150Be69D31Aa8780218247794152",
  //   chainId: 11235,
  //   icon: "/chains/polygon.png",
  //   endpointId: "40137",
  //   tokens: [
  //     {
  //       name: "POL",
  //       fullname: "Polygon",
  //       address: "0x0000000000000000000000000000000000000000",
  //       icon: "/tokens/polygon.png",
  //       decimals: 18,
  //     },
  //     {
  //       name: "WMATIC",
  //       fullname: "Wrapped Matic",
  //       address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  //       vault: "0x28F53bA70E5c8ce8D03b1FaD41E9dF11Bb646c36",
  //       icon: "/tokens/wmatic.png",
  //       decimals: 18,
  //     },
  //     {
  //       name: "wBTC",
  //       fullname: "Wrapped Bitcoin",
  //       address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
  //       vault: "0xCA1e732F5288AE957aD1F0a8Fb20FCe9282b1930",
  //       icon: "/tokens/wbtc.svg",
  //       decimals: 8,
  //     },
  //     {
  //       name: "WETH",
  //       fullname: "Wrapped Ether",
  //       address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  //       icon: "/tokens/weth.png",
  //       vault: "0x305F25377d0a39091e99B975558b1bdfC3975654",
  //       decimals: 18,
  //     },
  //     {
  //       name: "USDC",
  //       fullname: "USDC",
  //       address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  //       icon: "/tokens/usdc.svg",
  //       decimals: 6,
  //     },
  //     {
  //       name: "USDT",
  //       fullname: "Tether",
  //       address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  //       icon: "/tokens/usdt.png",
  //       decimals: 6,
  //     },
  //   ],
  // },
  // {
  //   name: "Base",
  //   address: "0xBBE5A39eD493150Be69D31Aa8780218247794152",
  //   chainId: 8453,
  //   icon: "/chains/base.svg",
  //   endpointId: "40161",
  //   tokens: [
  //     {
  //       name: "ETH",
  //       fullname: "Ether",
  //       address: "0x0000000000000000000000000000000000000000",
  //       icon: "/chains/ethereum.webp",
  //       decimals: 18,
  //     },
  //     {
  //       name: "USDC",
  //       fullname: "USDC",
  //       address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  //       icon: "/tokens/usdc.svg",
  //       decimals: 6,
  //     },
  //     {
  //       name: "cbBTC",
  //       fullname: "Coinbase Wrapped BTC",
  //       address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
  //       icon: "/tokens/cbBTC.png",
  //       decimals: 8,
  //     },
  //     {
  //       name: "cbETH",
  //       fullname: "Coinbase Wrapped ETH",
  //       address: "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
  //       icon: "/tokens/cbETH.png",
  //       decimals: 18,
  //     },
  //   ],
  // },
  {
    name: "Base (Forked)",
    address: "0xBBE5A39eD493150Be69D31Aa8780218247794152",
    chainId: 84530,
    icon: "/chains/base.svg",
    endpointId: "40161",
    tokens: [
      {
        name: "ETH",
        fullname: "Ether",
        address: "0x0000000000000000000000000000000000000000",
        icon: "/chains/ethereum.webp",
        decimals: 18,
      },
      {
        name: "USDC",
        fullname: "USDC",
        address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        icon: "/tokens/usdc.svg",
        decimals: 6,
      },
      {
        name: "cbBTC",
        fullname: "Coinbase Wrapped BTC",
        address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
        icon: "/tokens/cbBTC.png",
        decimals: 8,
      },
      {
        name: "cbETH",
        fullname: "Coinbase Wrapped ETH",
        address: "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
        icon: "/tokens/cbETH.png",
        decimals: 18,
      },
    ],
  },
  {
    name: "Base (Sandbox)",
    address: "0xBBE5A39eD493150Be69D31Aa8780218247794152",
    chainId: 11237,
    icon: "/chains/base.svg",
    endpointId: "40161",
    tokens: [
      {
        name: "ETH",
        fullname: "Ether",
        address: "0x0000000000000000000000000000000000000000",
        icon: "/chains/ethereum.webp",
        decimals: 18,
      },
      {
        name: "USDC",
        fullname: "USDC",
        address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        icon: "/tokens/usdc.svg",
        decimals: 6,
      },
      {
        name: "cbBTC",
        fullname: "Coinbase Wrapped BTC",
        address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
        icon: "/tokens/cbBTC.png",
        decimals: 8,
      },
      {
        name: "cbETH",
        fullname: "Coinbase Wrapped ETH",
        address: "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
        icon: "/tokens/cbETH.png",
        decimals: 18,
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
