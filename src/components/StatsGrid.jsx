export default function StatsGrid({ analysis }) {
  const { totalVolume, totalTxs, pairVolumes, routeVolumes } = analysis;

  const stats = [
    {
      label: "Total Volume",
      value: `$${totalVolume.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    },
    {
      label: "Total Transactions",
      value: totalTxs.toLocaleString(),
    },
    {
      label: "Unique Pairs",
      value: Object.keys(pairVolumes).length,
    },
    {
      label: "Routes Used",
      value: Object.keys(routeVolumes).length,
    },
    {
      label: "Avg Transaction",
      value: `$${(totalVolume / totalTxs).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-gray-200 mb-12  gap-px">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white p-8 text-center hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-gray-500 text-xs uppercase tracking-widest mb-3 font-medium">
            {stat.label}
          </h3>
          <div className="text-3xl font-semibold text-gray-900 tracking-tight">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}

