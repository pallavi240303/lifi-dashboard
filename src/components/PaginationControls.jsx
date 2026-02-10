export default function PaginationControls({
  totalLoaded,
  fetching,
  fetchedCount,
  onRefresh,
}) {
  return (
    <div className="bg-white px-10 py-6 mb-12 border border-gray-200 flex justify-between items-center flex-wrap gap-4">
      <div className="text-gray-500 text-sm">
        {fetching ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin mr-2 align-middle" />
            Fetching transactions… <strong className="text-gray-900">{fetchedCount.toLocaleString()}</strong> so far
          </>
        ) : (
          <>
            Loaded <strong className="text-gray-900">{totalLoaded.toLocaleString()}</strong> transactions (All pages fetched)
          </>
        )}
      </div>
      <div className="flex gap-2.5">
        <button
          onClick={onRefresh}
          disabled={fetching}
          className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium tracking-wide cursor-pointer hover:bg-gray-700 hover:-translate-y-px transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {fetching ? "Fetching…" : "Refresh Data"}
        </button>
      </div>
    </div>
  );
}
