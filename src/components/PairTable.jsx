import { getRouteColor } from "../utils/colors";

export default function PairTable({ sortedPairs: allPairs }) {
  const sortedPairs = allPairs.slice(0, 200);
  return (
    <div className="bg-white p-10 border border-gray-200 overflow-x-auto">
      <h2 className="text-gray-900 mb-8 text-xl font-semibold tracking-tight">
        Top Trading Pairs
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["Rank", "Trading Pair", "Routes", "Volume (USD)", "Transactions", "Avg Size"].map(
              (header) => (
                <th
                  key={header}
                  className="bg-gray-50 text-gray-500 px-4 py-4 text-left font-medium text-xs uppercase tracking-wider border-b-2 border-gray-200 sticky top-0"
                >
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {sortedPairs.map(([pair, data], index) => {
            const topRoutes = Object.entries(data.routes)
              .sort((a, b) => b[1].volume - a[1].volume)
              .slice(0, 3);

            return (
              <tr
                key={pair}
                className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <td className="px-4 py-4 text-sm text-gray-400 font-medium">
                  {index + 1}
                </td>
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={data.side1Icon}
                        alt={data.side1Token}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <span>
                        {data.side1Token} ({data.side1Chain})
                      </span>
                    </div>
                    <span className="text-gray-400">↔</span>
                    <div className="flex items-center gap-2">
                      <img
                        src={data.side2Icon}
                        alt={data.side2Token}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <span>
                        {data.side2Token} ({data.side2Chain})
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm">
                  {topRoutes.map(([route]) => (
                    <span
                      key={route}
                      className="inline-block px-2 py-1 text-xs font-medium text-white m-0.5 rounded-sm"
                      style={{ backgroundColor: getRouteColor(route) }}
                    >
                      {route}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-4 text-sm">
                  ${data.volume.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-4 text-sm">{data.count}</td>
                <td className="px-4 py-4 text-sm">
                  ${(data.volume / data.count).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

