import { Doughnut } from "react-chartjs-2";

const CHAIN_COLORS = [
  "#1a1a1a",
  "#4a4a4a",
  "#6a6a6a",
  "#9a9a9a",
  "#cacaca",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
];

export default function ChainChart({ chainVolumes }) {
  const data = {
    labels: Object.keys(chainVolumes),
    datasets: [
      {
        data: Object.values(chainVolumes),
        backgroundColor: CHAIN_COLORS,
        borderWidth: 4,
        borderColor: "#fff",
      },
    ],
  };

  const options = {
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
          label: (ctx) => {
            const label = ctx.label || "";
            const value = ctx.parsed || 0;
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-10 mb-12 border border-gray-200">
      <h2 className="text-gray-900 mb-8 text-xl font-semibold tracking-tight">
        Volume by Chain
      </h2>
      <div className="max-w-[500px] mx-auto">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}

