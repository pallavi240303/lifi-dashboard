import { useRef, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import { getRouteColor } from "../utils/colors";

// Custom plugin: show tooltip when hovering over y-axis labels
const labelHoverPlugin = {
  id: "labelHover",
  afterEvent(chart, args) {
    const event = args.event;
    if (event.type !== "mousemove") return;

    // Guard against re-entry (update("none") re-triggers afterEvent)
    if (chart._labelHoverUpdating) return;

    const yScale = chart.scales.y;
    if (!yScale) return;

    const x = event.x;
    const y = event.y;

    // Check if mouse is in the label area (left of the chart area)
    if (x >= chart.chartArea.left) return;

    // Need at least 2 ticks to calculate bar height
    if (yScale.ticks.length < 2) return;

    // Find which label row the mouse is over
    let matchIndex = -1;
    const barHeight = Math.abs(
      yScale.getPixelForTick(1) - yScale.getPixelForTick(0)
    );
    const halfBar = barHeight / 2;

    for (let i = 0; i < yScale.ticks.length; i++) {
      const yPos = yScale.getPixelForTick(i);
      if (y >= yPos - halfBar && y <= yPos + halfBar) {
        matchIndex = i;
        break;
      }
    }

    if (matchIndex >= 0) {
      const meta = chart.getDatasetMeta(0);
      if (meta.data[matchIndex]) {
        chart.tooltip.setActiveElements(
          [{ datasetIndex: 0, index: matchIndex }],
          { x: meta.data[matchIndex].x, y: meta.data[matchIndex].y }
        );
        chart.setActiveElements([{ datasetIndex: 0, index: matchIndex }]);
        chart._labelHoverUpdating = true;
        chart.update("none");
        chart._labelHoverUpdating = false;
      }
    }
  },
};

export default function RouteChart({ sortedRoutes }) {
  const chartRef = useRef(null);

  // Change cursor to pointer when hovering labels
  const handleMouseMove = useCallback((e) => {
    const chart = chartRef.current;
    if (!chart) return;

    const rect = chart.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x < chart.chartArea.left) {
      chart.canvas.style.cursor = "pointer";
    } else {
      chart.canvas.style.cursor = "default";
    }
  }, []);

  const data = {
    labels: sortedRoutes.map(
      ([route]) => route.charAt(0).toUpperCase() + route.slice(1)
    ),
    datasets: [
      {
        label: "Volume (USD)",
        data: sortedRoutes.map(([, d]) => d.volume),
        backgroundColor: sortedRoutes.map(([route]) => getRouteColor(route)),
        borderWidth: 0,
        barThickness: 18,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      axis: "y",
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Volume: $${ctx.parsed.x.toLocaleString()}`,
          afterLabel: (ctx) =>
            `Transactions: ${sortedRoutes[ctx.dataIndex][1].count.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "#f0f0f0", drawBorder: false },
        ticks: {
          color: "#666",
          callback: (v) => {
            if (v >= 1e9) return "$" + (v / 1e9).toFixed(1) + "B";
            if (v >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
            if (v >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
            return "$" + v.toLocaleString();
          },
        },
      },
      y: {
        grid: { display: false, drawBorder: false },
        ticks: { color: "#666" },
      },
    },
    onHover: (event, elements, chart) => {
      if (event.x < chart.chartArea.left) {
        chart.canvas.style.cursor = "pointer";
      } else if (elements.length > 0) {
        chart.canvas.style.cursor = "pointer";
      } else {
        chart.canvas.style.cursor = "default";
      }
    },
  };

  // Dynamic height so each bar gets enough space
  const chartHeight = Math.max(400, sortedRoutes.length * 32);

  return (
    <div className="bg-white p-10 mb-12 border border-gray-200">
      <h2 className="text-gray-900 mb-8 text-xl font-semibold tracking-tight">
        Routes Used by LI.FI
      </h2>
      <p className="bg-gray-100 px-5 py-4 mb-8 text-gray-500 text-sm leading-relaxed border-l-3 border-gray-900">
        LI.FI is a bridge/DEX aggregator that finds the best route for your
        swap. Each "tool" represents a different exchange or protocol (like
        Uniswap, SushiSwap, etc.) that LI.FI routes through to get you the best
        price.
      </p>
      <div style={{ height: chartHeight }}>
        <Bar
          ref={chartRef}
          data={data}
          options={options}
          plugins={[labelHoverPlugin]}
        />
      </div>
    </div>
  );
}
