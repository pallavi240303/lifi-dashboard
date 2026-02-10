import { useState } from "react";

function todayUTC() {
  const now = new Date();
  return now.toISOString().split("T")[0]; // YYYY-MM-DD in UTC
}

export default function DateFilter({ selectedDate, onApply, fetching }) {
  const [date, setDate] = useState(selectedDate || todayUTC());

  const handleApply = () => {
    onApply(date);
  };

  return (
    <div className="bg-white px-10 py-6 mb-6 border border-gray-200 flex items-center flex-wrap gap-6">
      <div className="flex items-center gap-3">
        <label className="text-gray-500 text-sm font-medium uppercase tracking-wider">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>
      <button
        onClick={handleApply}
        disabled={fetching}
        className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium tracking-wide cursor-pointer hover:bg-gray-700 hover:-translate-y-px transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {fetching ? "Fetching…" : "Apply Filter"}
      </button>
    </div>
  );
}
