import { getRouteColor } from "../utils/colors";

/** Format a numeric string with commas, preserving exact digits (no float precision loss) */
function formatRawUSD(rawStr) {
  if (!rawStr || rawStr === "0") return "$0";
  // Split integer and decimal parts
  const [intPart, decPart] = rawStr.split(".");
  // Add commas to integer part
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // Show up to 2 decimal places if present
  if (decPart) {
    return `$${withCommas}.${decPart.slice(0, 2)}`;
  }
  return `$${withCommas}`;
}

export default function TopTransactions({ topTransactions, totalVolume }) {
  if (!topTransactions || topTransactions.length === 0) return null;

  return (
    <div className="bg-white p-10 mb-12 border border-gray-200 overflow-x-auto">
      <h2 className="text-gray-900 mb-2 text-xl font-semibold tracking-tight">
        Top Transactions by Volume
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        Individual transactions that contributed the most to total volume.
      </p>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {[
              "Rank",
              "Swap",
              "Volume (USD)",
              "% of Total",
              "Route",
              "Integrator",
              "Explorer",
            ].map((header) => (
              <th
                key={header}
                className="bg-gray-50 text-gray-500 px-4 py-4 text-left font-medium text-xs uppercase tracking-wider border-b-2 border-gray-200 sticky top-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {topTransactions.map((tx, index) => {
            const pctOfTotal =
              totalVolume > 0 ? ((tx.volume / totalVolume) * 100).toFixed(2) : "0.00";

            return (
              <tr
                key={tx.transactionId}
                className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                {/* Rank */}
                <td className="px-4 py-4 text-sm text-gray-400 font-medium">
                  {index + 1}
                </td>

                {/* Swap: from → to with icons */}
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {tx.fromIcon && (
                        <img
                          src={tx.fromIcon}
                          alt={tx.fromSymbol}
                          className="w-5 h-5 rounded-full object-cover"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                      <span>
                        {tx.fromSymbol}{" "}
                        <span className="text-gray-400 text-xs">({tx.fromChain})</span>
                      </span>
                    </div>
                    <span className="text-gray-400">→</span>
                    <div className="flex items-center gap-1.5">
                      {tx.toIcon && (
                        <img
                          src={tx.toIcon}
                          alt={tx.toSymbol}
                          className="w-5 h-5 rounded-full object-cover"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                      <span>
                        {tx.toSymbol}{" "}
                        <span className="text-gray-400 text-xs">({tx.toChain})</span>
                      </span>
                    </div>
                  </div>
                </td>

                {/* Volume */}
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                  {formatRawUSD(tx.rawVolume)}
                </td>

                {/* % of Total */}
                <td className="px-4 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-full"
                        style={{ width: `${Math.min(parseFloat(pctOfTotal), 100)}%` }}
                      />
                    </div>
                    <span className="text-gray-600">{pctOfTotal}%</span>
                  </div>
                </td>

                {/* Route */}
                <td className="px-4 py-4 text-sm">
                  <span
                    className="inline-block px-2 py-1 text-xs font-medium text-white rounded-sm"
                    style={{ backgroundColor: getRouteColor(tx.route) }}
                  >
                    {tx.route}
                  </span>
                </td>

                {/* Integrator */}
                <td className="px-4 py-4 text-sm text-gray-600">
                  {tx.integrator}
                </td>

                {/* Explorer Link */}
                <td className="px-4 py-4 text-sm">
                  {tx.explorerLink ? (
                    <a
                      href={tx.explorerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                    >
                      View ↗
                    </a>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

