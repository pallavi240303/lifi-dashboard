const chainMap = {
  1: "Ethereum",
  56: "BSC",
  8453: "Base",
  42161: "Arbitrum",
  43114: "Avalanche",
  57073: "Ink",
  137: "Polygon",
  10: "Optimism",
  250: "Fantom",
  100: "Gnosis",
  42220: "Celo",
  1284: "Moonbeam",
  1285: "Moonriver",
  25: "Cronos",
  66: "OKC",
  128: "HECO",
  1313161554: "Aurora",
  592: "Astar",
  7700: "Canto",
  5000: "Mantle",
  999: "HyperEVM",
  747474: "Katana",
};

export function getChainName(chainId) {
  return chainMap[chainId] || `Chain ${chainId}`;
}

