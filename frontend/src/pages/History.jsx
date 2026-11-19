
import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api/scan";

export default function History() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Time");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load scan history
  const loadHistory = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const response = await fetch(`${API}/history`);

      if (!response.ok) {
        throw new Error(`Unable to load history (${response.status}).`);
      }

      const data = await response.json();

      const records = Array.isArray(data)
        ? data
        : Array.isArray(data.scans)
        ? data.scans
        : [];

      setRows(records);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Initial history loading
  useEffect(() => {
    let ignore = false;

    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API}/history`);

        if (!response.ok) {
          throw new Error(`Unable to load history (${response.status}).`);
        }

        const data = await response.json();

        if (!ignore) {
          const records = Array.isArray(data)
            ? data
            : Array.isArray(data.scans)
            ? data.scans
            : [];

          setRows(records);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      ignore = true;
    };
  }, []);

  // Search and date filter
  const filteredRows = useMemo(() => {
    const now = new Date();

    return [...rows]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )
      .filter((item) => {
        const type = item.scanType || "Text";
        const preview = item.inputText || item.extractedText || "";
        const risk = item.riskLevel || "Unknown";
        const prediction = item.prediction || item.verdict || "";
        const date = new Date(item.createdAt);

        const searchText = [
          type,
          preview,
          risk,
          prediction
        ].join(" ").toLowerCase();

        const matchesSearch = searchText.includes(
          search.trim().toLowerCase()
        );

        let matchesDate = true;

        if (filter === "Today") {
          matchesDate =
            !isNaN(date.getTime()) &&
            date.toDateString() === now.toDateString();
        }

        if (filter === "This Week") {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);

          matchesDate =
            !isNaN(date.getTime()) &&
            date >= weekAgo &&
            date <= now;
        }

        return matchesSearch && matchesDate;
      });
  }, [rows, search, filter]);

  // Risk badge styling
  const getRiskClass = (risk) => {
    const value = (risk || "").toLowerCase();

    if (value === "high") return "high";
    if (value === "medium") return "medium";
    if (value === "low") return "low";

    return "medium";
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Analysis History</h1>
          <p>
            Review your previous Document Scam Detector assessments.
          </p>
        </div>

        <button
          className="scan-button"
          onClick={() => loadHistory(true)}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh History"}
        </button>
      </div>

      <section className="card table-card">
        <div className="table-toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="Search your scans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All Time">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
          </select>
        </div>

        {loading && (
          <p>Loading scan history...</p>
        )}

        {!loading && error && (
          <div className="error-message">
            <p>{error}</p>

            <button onClick={() => loadHistory(true)}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Preview</th>
                  <th>Risk</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((item, index) => {
                    const type = item.scanType || "Text";

                    const preview =
                      item.inputText ||
                      item.extractedText ||
                      item.url ||
                      "No preview available";

                    const risk = item.riskLevel || "Unknown";

                    const score =
                      item.confidence !== undefined &&
                      item.confidence !== null &&
                      !isNaN(Number(item.confidence))
                        ? `${Number(item.confidence).toFixed(2)}%`
                        : "N/A";

                    return (
                      <tr key={item._id || index}>
                        <td>
                          <b>{type}</b>
                        </td>

                        <td title={preview}>
                          {preview.length > 65
                            ? `${preview.substring(0, 65)}...`
                            : preview}
                        </td>

                        <td>
                          <span
                            className={`risk ${getRiskClass(risk)}`}
                          >
                            {risk}
                          </span>
                        </td>

                        <td>{score}</td>

                        <td>{formatDate(item.createdAt)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5">
                      No scan records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="history-count">
          Total records: {filteredRows.length}
        </p>
      </section>
    </>
  );
}
