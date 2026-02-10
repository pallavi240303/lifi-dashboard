import { getChainName } from "./chainNames";

export function analyzeData(data) {
  const pairVolumes = {};
  const chainVolumes = {};
  const routeVolumes = {};
  let totalVolume = 0;
  const totalTxs = data.length;

  data.forEach((tx) => {
    const fromToken = tx.sending.token.symbol;
    const fromChainId = tx.sending.chainId;
    const fromChainName = getChainName(fromChainId);
    const fromTokenIcon = tx.sending.token.logoURI;

    const toToken = tx.receiving.token.symbol;
    const toChainId = tx.receiving.chainId;
    const toChainName = getChainName(toChainId);
    const toTokenIcon = tx.receiving.token.logoURI;

    const token1 = `${fromToken} (${fromChainName})`;
    const token2 = `${toToken} (${toChainName})`;

    let pair, side1Token, side1Chain, side1Icon, side2Token, side2Chain, side2Icon;
    if (token1 < token2) {
      pair = `${token1} ↔ ${token2}`;
      side1Token = fromToken;
      side1Chain = fromChainName;
      side1Icon = fromTokenIcon;
      side2Token = toToken;
      side2Chain = toChainName;
      side2Icon = toTokenIcon;
    } else {
      pair = `${token2} ↔ ${token1}`;
      side1Token = toToken;
      side1Chain = toChainName;
      side1Icon = toTokenIcon;
      side2Token = fromToken;
      side2Chain = fromChainName;
      side2Icon = fromTokenIcon;
    }

    const volume = parseFloat(tx.sending.amountUSD) || 0;

    // Get the actual swap/bridge tool, skipping internal fee steps
    let tool = tx.tool || "Unknown";
    if (tx.sending.includedSteps && tx.sending.includedSteps.length > 0) {
      const realStep = tx.sending.includedSteps.find(
        (s) => s.tool && s.tool !== "feeCollection"
      );
      tool = realStep ? realStep.tool : tx.tool || "Unknown";
    }

    const integrator = tx.metadata?.integrator || "unknown";

    if (!pairVolumes[pair]) {
      pairVolumes[pair] = {
        volume: 0,
        count: 0,
        side1Token,
        side1Chain,
        side1Icon,
        side2Token,
        side2Chain,
        side2Icon,
        routes: {},
        integrators: {},
      };
    }

    pairVolumes[pair].volume += volume;
    pairVolumes[pair].count += 1;

    if (!pairVolumes[pair].routes[tool]) {
      pairVolumes[pair].routes[tool] = { volume: 0, count: 0 };
    }
    pairVolumes[pair].routes[tool].volume += volume;
    pairVolumes[pair].routes[tool].count += 1;

    if (!pairVolumes[pair].integrators[integrator]) {
      pairVolumes[pair].integrators[integrator] = { volume: 0, count: 0 };
    }
    pairVolumes[pair].integrators[integrator].volume += volume;
    pairVolumes[pair].integrators[integrator].count += 1;

    totalVolume += volume;

    if (!chainVolumes[fromChainName]) {
      chainVolumes[fromChainName] = 0;
    }
    chainVolumes[fromChainName] += volume;

    if (!routeVolumes[tool]) {
      routeVolumes[tool] = { volume: 0, count: 0 };
    }
    routeVolumes[tool].volume += volume;
    routeVolumes[tool].count += 1;
  });

  // Top transactions by volume (top 20)
  const topTransactions = data
    .map((tx) => {
      const vol = parseFloat(tx.sending.amountUSD) || 0;
      const fromSymbol = tx.sending.token?.symbol || "?";
      const toSymbol = tx.receiving.token?.symbol || "?";
      const fromChain = getChainName(tx.sending.chainId);
      const toChain = getChainName(tx.receiving.chainId);
      const fromIcon = tx.sending.token?.logoURI;
      const toIcon = tx.receiving.token?.logoURI;

      let route = tx.tool || "Unknown";
      if (tx.sending.includedSteps && tx.sending.includedSteps.length > 0) {
        const realStep = tx.sending.includedSteps.find(
          (s) => s.tool && s.tool !== "feeCollection"
        );
        route = realStep ? realStep.tool : tx.tool || "Unknown";
      }

      return {
        transactionId: tx.transactionId,
        volume: vol,
        rawVolume: tx.sending.amountUSD || "0", // preserve exact string from API
        fromSymbol,
        toSymbol,
        fromChain,
        toChain,
        fromIcon,
        toIcon,
        route,
        integrator: tx.metadata?.integrator || "unknown",
        explorerLink: tx.lifiExplorerLink || null,
        timestamp: tx.sending.timestamp || tx.receiving.timestamp,
      };
    })
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 20);

  return { pairVolumes, chainVolumes, routeVolumes, totalVolume, totalTxs, topTransactions };
}

