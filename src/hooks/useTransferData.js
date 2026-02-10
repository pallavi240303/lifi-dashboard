import { useState, useEffect, useCallback, useRef } from "react";
import { analyzeData } from "../utils/analyzeData";

const API_BASE = "https://li.quest/v2/analytics/transfers";

/** Returns today's date as YYYY-MM-DD in UTC */
function todayUTC() {
  return new Date().toISOString().split("T")[0];
}

/** Convert a YYYY-MM-DD string to UTC 00:00:00 and 23:59:59 timestamps (seconds) */
function dateToUTCRange(dateStr) {
  // Parse as UTC by appending T00:00:00Z
  const from = Math.floor(new Date(`${dateStr}T00:00:00Z`).getTime() / 1000);
  const to = Math.floor(new Date(`${dateStr}T23:59:59Z`).getTime() / 1000);
  return { from, to };
}

export function useTransferData() {
  const today = todayUTC();
  const { from: initFrom, to: initTo } = dateToUTCRange(today);

  const [selectedDate, setSelectedDate] = useState(today);
  const [fromTimestamp, setFromTimestamp] = useState(initFrom);
  const [toTimestamp, setToTimestamp] = useState(initTo);
  const [allData, setAllData] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedCount, setFetchedCount] = useState(0);
  const [fetching, setFetching] = useState(false);
  const abortRef = useRef(null);

  const fetchAllPages = useCallback(async (fromTs, toTs) => {
    // Abort any in-flight fetch cycle
    if (abortRef.current) {
      abortRef.current.aborted = true;
    }
    const thisRun = { aborted: false };
    abortRef.current = thisRun;

    setLoading(true);
    setFetching(true);
    setError(null);
    setAllData([]);
    setAnalysis(null);
    setFetchedCount(0);

    const accumulated = [];
    let nextCursor = null;
    let pageNum = 0;
    const MAX_PAGES = 100; // safety limit

    try {
      let hasMore = true;

      while (hasMore && pageNum < MAX_PAGES) {
        if (thisRun.aborted) return;

        pageNum++;

        // Always include timestamps on every request
        const params = new URLSearchParams({
          status: "DONE",
          limit: "1000",
          fromTimestamp: String(fromTs),
          toTimestamp: String(toTs),
        });

        // Append cursor for subsequent pages
        if (nextCursor) {
          params.set("next", nextCursor);
        }

        console.log(`[LI.FI Fetch] Page ${pageNum}: ${API_BASE}?${params.toString()}`);

        const response = await fetch(`${API_BASE}?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        const transfers = result.data || [];

        // Empty page means no more data
        if (transfers.length === 0) {
          console.log(`[LI.FI Fetch] Page ${pageNum}: empty page, stopping.`);
          break;
        }

        accumulated.push(...transfers);

        if (thisRun.aborted) return;
        setFetchedCount(accumulated.length);

        const prevCursor = nextCursor;
        nextCursor = result.next || null;
        hasMore = result.hasNext === true;

        console.log(
          `[LI.FI Fetch] Page ${pageNum}: ${transfers.length} transfers, ` +
          `${accumulated.length} total, hasNext=${result.hasNext}, ` +
          `next=${nextCursor ? nextCursor.slice(0, 30) + "…" : "null"}`
        );

        // Detect infinite loop: same cursor returned twice
        if (hasMore && nextCursor && nextCursor === prevCursor) {
          console.warn(`[LI.FI Fetch] Cursor unchanged, breaking to prevent infinite loop.`);
          break;
        }
      }

      if (pageNum >= MAX_PAGES) {
        console.warn(`[LI.FI Fetch] Reached max page limit (${MAX_PAGES}), stopping.`);
      }

      if (thisRun.aborted) return;

      console.log(
        `[LI.FI Fetch] Done! ${pageNum} pages, ${accumulated.length} transactions`
      );

      setAllData(accumulated);
      setAnalysis(analyzeData(accumulated));
    } catch (err) {
      if (!thisRun.aborted) {
        setError(err.message || "Error loading data. Please check the API.");
      }
    } finally {
      if (!thisRun.aborted) {
        setLoading(false);
        setFetching(false);
      }
    }
  }, []);

  /** Called from DateFilter — single date string YYYY-MM-DD */
  const setDate = useCallback(
    (dateStr) => {
      const { from, to } = dateToUTCRange(dateStr);
      setSelectedDate(dateStr);
      setFromTimestamp(from);
      setToTimestamp(to);
      fetchAllPages(from, to);
    },
    [fetchAllPages]
  );

  const refresh = useCallback(() => {
    fetchAllPages(fromTimestamp, toTimestamp);
  }, [fromTimestamp, toTimestamp, fetchAllPages]);

  useEffect(() => {
    fetchAllPages(fromTimestamp, toTimestamp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    analysis,
    loading,
    error,
    fetching,
    fetchedCount,
    totalLoaded: allData.length,
    selectedDate,
    fromTimestamp,
    toTimestamp,
    setDate,
    refresh,
  };
}
