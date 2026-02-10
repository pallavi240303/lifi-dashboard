import { Bar } from "react-chartjs-2";
import { getRouteColor, getRouteColorMap } from "../utils/colors";

export default function PairRouteChart({ sortedPairs }) {
  const top10 = sortedPairs.slice(0, 10);

  const allRoutes = new Set();
  top10.forEach(([, data]) => {
    Object.keys(data.routes).forEach((route) => allRoutes.add(route));
  });

  const routeArray = Array.from(allRoutes);
  const datasets = routeArray.map((route) => ({
    label: route.charAt(0).toUpperCase() + route.slice(1),
    data: top10.map(([, data]) => data.routes[route]?.volume || 0),
    backgroundColor: getRouteColor(route),
    borderWidth: 0,
  }));

  const chartData = {
    labels: top10.map(([pair]) => pair),
    datasets,
  };

  const options = {
    responsive: true,
    interaction: {
      mode: "index",
      axis: "x",
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false, drawBorder: false },
        ticks: { color: "#666", maxRotation: 45, minRotation: 45 },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: "#f0f0f0", drawBorder: false },
        ticks: {
          color: "#666",
          callback: (v) => "$" + v.toLocaleString(),
        },
      },
    },
  };

  const colorMap = getRouteColorMap();

  return (
    <div className="bg-white p-10 mb-12 border border-gray-200">
      <h2 className="text-gray-900 mb-8 text-xl font-semibold tracking-tight">
        Routes by Trading Pair
      </h2>
      <p className="bg-gray-100 px-5 py-4 mb-8 text-gray-500 text-sm leading-relaxed border-l-3 border-gray-900">
        See which routes LI.FI uses for each trading pair. Each color represents a different exchange or protocol (Uniswap, SushiSwap, etc.). The bar size shows the volume routed through each protocol.
      </p>

      {/* Route Legend */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mt-6 p-5 bg-gray-50 border border-gray-200">
        {Object.entries(colorMap).map(([route, color]) => (
          <div key={route} className="flex items-center gap-2.5">
            <div
              className="w-5 h-5 rounded-sm shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-gray-700 font-medium">
              {route.charAt(0).toUpperCase() + route.slice(1)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

