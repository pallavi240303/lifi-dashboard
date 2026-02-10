import { Bar } from "react-chartjs-2";

export default function PairChart({ sortedPairs }) {
  const top10 = sortedPairs.slice(0, 10);

  const data = {
    labels: top10.map(([pair]) => pair),
    datasets: [
      {
        label: "Volume (USD)",
        data: top10.map(([, d]) => d.volume),
        backgroundColor: "#1a1a1a",
        borderColor: "#1a1a1a",
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: "index",
      axis: "x",
      intersect: false,
    },
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#f0f0f0", drawBorder: false },
        ticks: {
          color: "#666",
          callback: (v) => "$" + v.toLocaleString(),
        },
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: "#666", maxRotation: 45, minRotation: 45 },
      },
    },
  };

  return (
    <div className="bg-white p-10 mb-12 border border-gray-200">
      <h2 className="text-gray-900 mb-8 text-xl font-semibold tracking-tight">
        Top 10 Trading Pairs by Volume
      </h2>
      <p className="bg-gray-100 px-5 py-4 mb-8 text-gray-500 text-sm leading-relaxed border-l-3 border-gray-900">
        Cross-chain trading pairs showing token and chain combinations. Each pair represents a unique FROM token/chain to TO token/chain route.
      </p>
      <Bar data={data} options={options} />
    </div>
  );
}

