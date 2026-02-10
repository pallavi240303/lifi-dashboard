// Global state
let allData = [];
let nextCursor = null;
let previousCursor = null;
let charts = {};

// Color palette for routes
const routeColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B739",
  "#52B788",
  "#E76F51",
  "#2A9D8F",
  "#E9C46A",
  "#F4A261",
  "#264653",
  "#E63946",
  "#A8DADC",
  "#457B9D",
  "#1D3557",
  "#F1FAEE",
];

const routeColorMap = {};
let colorIndex = 0;

function getRouteColor(route) {
  if (!routeColorMap[route]) {
    routeColorMap[route] = routeColors[colorIndex % routeColors.length];
    colorIndex++;
  }
  return routeColorMap[route];
}

async function fetchData(cursor = null, isLoadMore = false) {
  try {
    let url = "https://li.quest/v2/analytics/transfers?status=DONE&limit=1000";
    if (cursor) {
      url += `&next=${cursor}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    console.log("API Response:", result);

    nextCursor = result.next || null;
    previousCursor = result.previous || null;

    const transfers = result.data || [];

    if (isLoadMore && transfers.length > 0) {
      allData = [...allData, ...transfers];
    } else if (transfers.length > 0) {
      allData = transfers;
    }

    updateCursorInfo();
    return allData;
  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById("loading").textContent =
      "Error loading data. Please check the API.";
    return [];
  }
}

function updateCursorInfo() {
  const info = document.getElementById("cursorInfo");
  if (nextCursor) {
    info.textContent = "(More data available)";
    document.getElementById("loadMoreBtn").disabled = false;
  } else {
    info.textContent = "(All data loaded)";
    document.getElementById("loadMoreBtn").disabled = true;
  }
}

async function loadMoreData() {
  if (!nextCursor) return;

  document.getElementById("loadMoreBtn").textContent = "Loading...";
  document.getElementById("loadMoreBtn").disabled = true;

  await fetchData(nextCursor, true);
  const analysis = analyzeData(allData);
  updateDashboard(analysis);

  document.getElementById("loadMoreBtn").textContent = "Load More Data";
}

async function refreshData() {
  document.getElementById("refreshBtn").textContent = "Refreshing...";
  document.getElementById("refreshBtn").disabled = true;

  await fetchData(null, false);
  const analysis = analyzeData(allData);
  updateDashboard(analysis);

  document.getElementById("refreshBtn").textContent = "Refresh Data";
  document.getElementById("refreshBtn").disabled = false;
}

function getChainName(chainId) {
  const chains = {
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
  return chains[chainId] || `Chain ${chainId}`;
}

function analyzeData(data) {
  const pairVolumes = {};
  const chainVolumes = {};
  const routeVolumes = {};
  let totalVolume = 0;
  let totalTxs = data.length;

  data.forEach((tx) => {
    // Get token and chain info for FROM side
    const fromToken = tx.sending.token.symbol;
    const fromChainId = tx.sending.chainId;
    const fromChainName = getChainName(fromChainId);
    const fromTokenIcon = tx.sending.token.logoURI;

    // Get token and chain info for TO side
    const toToken = tx.receiving.token.symbol;
    const toChainId = tx.receiving.chainId;
    const toChainName = getChainName(toChainId);
    const toTokenIcon = tx.receiving.token.logoURI;

    // Create normalized pair key - always alphabetically sorted to club reverse transactions
    const token1 = `${fromToken} (${fromChainName})`;
    const token2 = `${toToken} (${toChainName})`;

    // Sort alphabetically to normalize the pair
    let pair,
      side1Token,
      side1Chain,
      side1Icon,
      side2Token,
      side2Chain,
      side2Icon;
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

    // Get tool/route info
    let tool = tx.tool || "Unknown";
    if (tx.sending.includedSteps && tx.sending.includedSteps.length > 0) {
      tool = tx.sending.includedSteps[0].tool || tool;
    }

    if (!pairVolumes[pair]) {
      pairVolumes[pair] = {
        volume: 0,
        count: 0,
        side1Token: side1Token,
        side1Chain: side1Chain,
        side1Icon: side1Icon,
        side2Token: side2Token,
        side2Chain: side2Chain,
        side2Icon: side2Icon,
        routes: {},
      };
    }

    pairVolumes[pair].volume += volume;
    pairVolumes[pair].count += 1;

    // Track routes per pair
    if (!pairVolumes[pair].routes[tool]) {
      pairVolumes[pair].routes[tool] = {
        volume: 0,
        count: 0,
      };
    }
    pairVolumes[pair].routes[tool].volume += volume;
    pairVolumes[pair].routes[tool].count += 1;

    totalVolume += volume;

    // Track volume by individual chains
    if (!chainVolumes[fromChainName]) {
      chainVolumes[fromChainName] = 0;
    }
    chainVolumes[fromChainName] += volume;

    if (!routeVolumes[tool]) {
      routeVolumes[tool] = {
        volume: 0,
        count: 0,
      };
    }
    routeVolumes[tool].volume += volume;
    routeVolumes[tool].count += 1;
  });

  return { pairVolumes, chainVolumes, routeVolumes, totalVolume, totalTxs };
}

function createRouteLegend() {
  const legend = document.getElementById("routeLegend");
  legend.innerHTML = "";

  Object.keys(routeColorMap).forEach((route) => {
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `
                    <div class="legend-color" style="background-color: ${routeColorMap[route]}"></div>
                    <div class="legend-label">${route.charAt(0).toUpperCase() + route.slice(1)}</div>
                `;
    legend.appendChild(item);
  });
}

function updateDashboard(analysis) {
  const { pairVolumes, chainVolumes, routeVolumes, totalVolume, totalTxs } =
    analysis;

  // Update stats
  document.getElementById("totalVolume").textContent =
    `$${totalVolume.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  document.getElementById("totalTxs").textContent = totalTxs.toLocaleString();
  document.getElementById("currentCount").textContent =
    totalTxs.toLocaleString();
  document.getElementById("uniquePairs").textContent =
    Object.keys(pairVolumes).length;
  document.getElementById("uniqueRoutes").textContent =
    Object.keys(routeVolumes).length;
  document.getElementById("avgTx").textContent =
    `$${(totalVolume / totalTxs).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  // Sort pairs by volume
  const sortedPairs = Object.entries(pairVolumes).sort(
    (a, b) => b[1].volume - a[1].volume,
  );

  // Sort routes by volume
  const sortedRoutes = Object.entries(routeVolumes).sort(
    (a, b) => b[1].volume - a[1].volume,
  );

  // Destroy existing charts
  Object.values(charts).forEach((chart) => chart.destroy());
  charts = {};

  // Create pair chart (top 10)
  const top10Pairs = sortedPairs.slice(0, 10);
  const pairCtx = document.getElementById("pairChart").getContext("2d");
  charts.pairChart = new Chart(pairCtx, {
    type: "bar",
    data: {
      labels: top10Pairs.map(([pair]) => pair),
      datasets: [
        {
          label: "Volume (USD)",
          data: top10Pairs.map(([, data]) => data.volume),
          backgroundColor: "#1a1a1a",
          borderColor: "#1a1a1a",
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "#f0f0f0",
            drawBorder: false,
          },
          ticks: {
            color: "#666",
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: "#666",
            maxRotation: 45,
            minRotation: 45,
          },
        },
      },
    },
  });

  // Create stacked bar chart for pairs and routes
  const allRoutes = new Set();
  top10Pairs.forEach(([, data]) => {
    Object.keys(data.routes).forEach((route) => allRoutes.add(route));
  });

  const routeArray = Array.from(allRoutes);
  const datasets = routeArray.map((route) => {
    return {
      label: route.charAt(0).toUpperCase() + route.slice(1),
      data: top10Pairs.map(([pair, data]) => data.routes[route]?.volume || 0),
      backgroundColor: getRouteColor(route),
      borderWidth: 0,
    };
  });

  const pairRouteCtx = document
    .getElementById("pairRouteChart")
    .getContext("2d");
  charts.pairRouteChart = new Chart(pairRouteCtx, {
    type: "bar",
    data: {
      labels: top10Pairs.map(([pair]) => pair),
      datasets: datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.parsed.y;
              const route = context.dataset.label;
              return route + ": $" + value.toLocaleString();
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: "#666",
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: {
            color: "#f0f0f0",
            drawBorder: false,
          },
          ticks: {
            color: "#666",
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
    },
  });

  // Create legend
  createRouteLegend();

  // Create route chart
  const routeCtx = document.getElementById("routeChart").getContext("2d");
  charts.routeChart = new Chart(routeCtx, {
    type: "bar",
    data: {
      labels: sortedRoutes.map(
        ([route]) => route.charAt(0).toUpperCase() + route.slice(1),
      ),
      datasets: [
        {
          label: "Volume (USD)",
          data: sortedRoutes.map(([, data]) => data.volume),
          backgroundColor: sortedRoutes.map(([route]) => getRouteColor(route)),
          borderWidth: 0,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: function (context) {
              const route = sortedRoutes[context.dataIndex];
              return `Transactions: ${route[1].count}`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: "#f0f0f0",
            drawBorder: false,
          },
          ticks: {
            color: "#666",
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
        y: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: "#666",
          },
        },
      },
    },
  });

  // Create chain chart
  const chainCtx = document.getElementById("chainChart").getContext("2d");
  charts.chainChart = new Chart(chainCtx, {
    type: "doughnut",
    data: {
      labels: Object.keys(chainVolumes),
      datasets: [
        {
          data: Object.values(chainVolumes),
          backgroundColor: [
            "#1a1a1a",
            "#4a4a4a",
            "#6a6a6a",
            "#9a9a9a",
            "#cacaca",
            "#FF6B6B",
            "#4ECDC4",
            "#45B7D1",
          ],
          borderWidth: 4,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            color: "#666",
            font: {
              size: 14,
              family:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            },
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 8,
            boxHeight: 8,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return (
                label +
                ": $" +
                value.toLocaleString() +
                " (" +
                percentage +
                "%)"
              );
            },
          },
        },
      },
    },
  });

  // Populate table with token icons
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";
  sortedPairs.forEach(([pair, data], index) => {
    const routeBadges = Object.entries(data.routes)
      .sort((a, b) => b[1].volume - a[1].volume)
      .slice(0, 3)
      .map(
        ([route]) =>
          `<span class="route-badge" style="background-color: ${getRouteColor(route)}">${route}</span>`,
      )
      .join("");

    const row = document.createElement("tr");
    row.innerHTML = `
                    <td class="rank-cell">${index + 1}</td>
                    <td class="pair-cell">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div class="token-with-icon">
                                <img src="${data.side1Icon}" alt="${data.side1Token}" class="token-icon" onerror="this.style.display='none'">
                                <span>${data.side1Token} (${data.side1Chain})</span>
                            </div>
                            <span style="color: #999;">↔</span>
                            <div class="token-with-icon">
                                <img src="${data.side2Icon}" alt="${data.side2Token}" class="token-icon" onerror="this.style.display='none'">
                                <span>${data.side2Token} (${data.side2Chain})</span>
                            </div>
                        </div>
                    </td>
                    <td>${routeBadges}</td>
                    <td>$${data.volume.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                    <td>${data.count}</td>
                    <td>$${(data.volume / data.count).toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                `;
    tableBody.appendChild(row);
  });

  // Show dashboard
  document.getElementById("loading").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
}

// Initialize
fetchData().then((data) => {
  if (data && data.length > 0) {
    const analysis = analyzeData(data);
    updateDashboard(analysis);
  }
});
