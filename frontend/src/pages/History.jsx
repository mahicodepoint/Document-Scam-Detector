import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000/api/scan";

export default function History() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Time");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/history`);

      if (!response.ok) {
        throw new Error("Unable to load scan history.");
      }

      const data = await response.json();
      setRows(Array.isArray(data) ? data : data.scans || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredRows = useMemo(() => {
    const now = new Date();

    return rows.filter((item) => {
      const type = item.scanType || "Text";
      const preview = item.inputText || item.extractedText || "";
      const risk = item.riskLevel || "Unknown";
      const prediction = item.prediction || item.verdict || "";
      const date = new Date(item.createdAt);

      const matchesSearch = [
        type,
        preview,
        risk,
        prediction
      ].join(" ").toLowerCase().includes(search.toLowerCase());

      let matchesDate = true;

      if (filter === "Today") {
        matchesDate = date.toDateString() === now.toDateString();
      } else if (filter === "This Week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        matchesDate = date >= weekAgo && date <= now;
      }

      return matchesSearch && matchesDate;
    });
  }, [rows, search, filter]);

  const getRiskClass = (risk) => {
    const value = (risk || "").toLowerCase();

    if (value === "high") return "high";
    if (value === "medium") return "medium";
    if (value === "low") return "low";

    return "medium";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
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
          <p>Review your previous Document Scam Detector assessments.</p>
        </div>

        <button className="scan-button" onClick={loadHistory}>
          Refresh History
        </button>
      </div>

      <section className="card table-card">
        <div className="table-toolbar">
          <input
            className="search-input"
            placeholder="Search your scans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All Time</option>
            <option>Today</option>
            <option>This Week</option>
          </select>
        </div>

        {loading && <p>Loading scan history...</p>}

        {error && (
          <div className="error-message">
            {error}
            <button onClick={loadHistory}>Try Again</button>
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
                      item.inputText || item.extractedText || "No preview available";
                    const risk = item.riskLevel || "Unknown";
                    const score =
                      item.confidence !== undefined &&
                      item.confidence !== null
                        ? `${Number(item.confidence).toFixed(2)}%`
                        : "N/A";

                    return (
                      <tr key={item._id || index}>
                        <td><b>{type}</b></td>
                        <td title={preview}>
                          {preview.length > 65
                            ? `${preview.substring(0, 65)}...`
                            : preview}
                        </td>
                        <td>
                          <span className={`risk ${getRiskClass(risk)}`}>
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
