import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useTransferData } from "./hooks/useTransferData";
import DateFilter from "./components/DateFilter";
import StatsGrid from "./components/StatsGrid";
import PaginationControls from "./components/PaginationControls";
import PairChart from "./components/PairChart";
import PairRouteChart from "./components/PairRouteChart";
import RouteChart from "./components/RouteChart";
import ChainChart from "./components/ChainChart";
import PairTable from "./components/PairTable";
import TopTransactions from "./components/TopTransactions";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function App() {
  const {
    analysis,
    loading,
    error,
    fetching,
    fetchedCount,
    totalLoaded,
    filteredCount,
    selectedDate,
    setDate,
    refresh,
    btcFilter,
    toggleBtcFilter,
  } = useTransferData();

  const sortedPairs = useMemo(() => {
    if (!analysis) return [];
    return Object.entries(analysis.pairVolumes).sort(
      (a, b) => b[1].volume - a[1].volume
    );
  }, [analysis]);

  const sortedRoutes = useMemo(() => {
    if (!analysis) return [];
    return Object.entries(analysis.routeVolumes).sort(
      (a, b) => b[1].volume - a[1].volume
    );
  }, [analysis]);

  if (loading && !fetchedCount) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <span className="inline-block w-6 h-6 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-gray-500 text-lg">Loading data from API...</p>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-10 text-gray-900 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-center mb-2.5 text-4xl font-semibold tracking-tight text-gray-900">
          Token Pair Volume Analytics
        </h1>
        <p className="text-center text-gray-500 text-sm mb-12 font-normal">
          Real-time cross-chain trading volume analysis from LI.FI Protocol
        </p>

        <DateFilter
          selectedDate={selectedDate}
          onApply={setDate}
          fetching={fetching}
          btcFilter={btcFilter}
          onToggleBtcFilter={toggleBtcFilter}
          totalLoaded={totalLoaded}
          filteredCount={filteredCount}
        />

        <PaginationControls
          totalLoaded={totalLoaded}
          fetching={fetching}
          fetchedCount={fetchedCount}
          onRefresh={refresh}
        />

        {analysis && (
          <>
            <StatsGrid analysis={analysis} />
            <TopTransactions
              topTransactions={analysis.topTransactions}
              totalVolume={analysis.totalVolume}
            />
            <PairRouteChart sortedPairs={sortedPairs} />
            <RouteChart sortedRoutes={sortedRoutes} />
            <ChainChart chainVolumes={analysis.chainVolumes} />
            <PairTable sortedPairs={sortedPairs} />
          </>
        )}
      </div>
    </div>
  );
}
