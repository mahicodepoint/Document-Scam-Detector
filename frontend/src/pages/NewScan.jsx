
import { useState } from "react";
import {
  Upload,
  Link,
  FileText,
  Mail,
  ScanSearch,
  ShieldCheck,
  MessageSquare,
  MessageCircle,
  AlertTriangle,
  ShieldAlert,
  RotateCcw,
  Info
} from "lucide-react";


const API = "http://localhost:5000/api/scan";

const modes = [
  { id: "email", name: "Email", Icon: Mail },
  { id: "text", name: "Paste Text", Icon: FileText },
  { id: "sms", name: "SMS", Icon: MessageSquare },
  { id: "whatsapp", name: "WhatsApp", Icon: MessageCircle },
  { id: "url", name: "Website URL", Icon: Link },
  { id: "file", name: "Image / Screenshot", Icon: Upload }
];

const scanTypeNames = {
  email: "Email",
  text: "Text",
  sms: "SMS",
  whatsapp: "WhatsApp"
};

export default function NewScan() {
  const [mode, setMode] = useState("email");
  const [text, setText] = useState("");
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const prediction = result?.prediction || "Unknown";

  const isThreat =
    prediction === "Phishing Email" ||
    prediction === "Suspicious URL" ||
    result?.riskLevel === "High" ||
    result?.riskLevel === "Medium";

  const confidence =
    result?.confidence !== null && result?.confidence !== undefined
      ? Math.max(0, Math.min(100, Number(result.confidence)))
      : null;

  const uncertain = result?.uncertain === true;

  const risk = uncertain
    ? "Manual Verification"
    : result?.riskLevel === "High"
      ? "High Risk"
      : result?.riskLevel === "Medium"
        ? "Medium Risk"
        : "Low Risk";

  const displayScanType =
    mode === "file" ? "IMAGE" : mode.toUpperCase();

  function resetScan() {
    setText("");
    setSender("");
    setSubject("");
    setFile(null);
    setResult(null);
    setError("");
  }

  function changeMode(newMode) {
    resetScan();
    setMode(newMode);
  }

  async function handleScan() {
    setError("");
    setResult(null);

    if (mode === "file" && !file) {
      setError("Please select an image or screenshot.");
      return;
    }

    if (mode !== "file" && !text.trim()) {
      setError("Please enter content before starting the scan.");
      return;
    }

    if (mode === "url") {
      try {
        const parsed = new URL(text.trim());

        if (!["http:", "https:"].includes(parsed.protocol)) {
          setError("Please enter a valid HTTP or HTTPS URL.");
          return;
        }
      } catch {
        setError("Please enter a valid website URL.");
        return;
      }
    }

    setLoading(true);

    try {
      let response;

      if (mode === "file") {
        const formData = new FormData();
        formData.append("image", file);

        response = await fetch(`${API}/image`, {
          method: "POST",
          body: formData
        });

      } else if (mode === "url") {
        response = await fetch(`${API}/url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            url: text.trim()
          })
        });

      } else {
        const endpoint = mode;

        response = await fetch(`${API}/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text: text.trim(),
            sender: mode === "email" ? sender : "",
            subject: mode === "email" ? subject : "",
            scanType: scanTypeNames[mode]
          })
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Scan failed. Please try again."
        );
      }

      setResult(data);

    } catch (err) {
      setError(
        err.message || "Unable to connect to backend."
      );
    } finally {
      setLoading(false);
    }
  }

  const placeholders = {
    email: "Paste the complete email content here...",
    text: "Paste any suspicious message here...",
    sms: "Paste the SMS message you received...",
    whatsapp: "Paste the WhatsApp message here...",
    url: "https://example.com"
  };

  return (
    <div className="new-scan-page">

      {/* PAGE HEADER */}

      <div className="page-title">
        <div>
          <h1>New Scan</h1>
          <p>
            Protect yourself from digital scams with intelligent analysis.
          </p>
        </div>

        <div className="scan-status">
          <span className="status-dot"></span>
          Security Center
        </div>
      </div>

      {/* SCAN CARD */}

      <section className="card scan-card">

        <div className="scan-heading">
          <div>
            <h2>Choose Your Scan Type</h2>
            <p>Select the content you want to analyze.</p>
          </div>

          <ShieldCheck size={30} color="#079866" />
        </div>

        {/* SCAN MODES */}

        <div className="scan-mode-grid">
          {modes.map(({ id, name, Icon }) => (
            <button
              key={id}
              type="button"
              className={`scan-mode ${
                mode === id ? "selected" : ""
              }`}
              onClick={() => changeMode(id)}
            >
              <Icon size={21} />
              <span>{name}</span>
            </button>
          ))}
        </div>

        {/* INPUT FORM */}

        <div className="scan-form">

          {mode === "email" && (
            <>
              <div className="form-title">
                <h3>Email Security Analysis</h3>
                <p>
                  Analyze suspicious emails, job offers and phishing attempts.
                </p>
              </div>

              <label>Sender Email (Optional)</label>

              <input
                className="text-input"
                type="email"
                placeholder="sender@example.com"
                value={sender}
                onChange={e => setSender(e.target.value)}
              />

              <label>Email Subject (Optional)</label>

              <input
                className="text-input"
                placeholder="Enter email subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />

              <label>Email Content</label>
            </>
          )}

          {mode === "text" && (
            <>
              <div className="form-title">
                <h3>Message Analysis</h3>
                <p>Paste any message you want to verify.</p>
              </div>

              <label>Message Content</label>
            </>
          )}

          {mode === "sms" && (
            <>
              <div className="form-title">
                <h3>SMS Scam Detection</h3>
                <p>
                  Check suspicious bank, OTP, KYC, payment and job SMS messages.
                </p>
              </div>

              <label>SMS Message</label>
            </>
          )}

          {mode === "whatsapp" && (
            <>
              <div className="form-title">
                <h3>WhatsApp Scam Detection</h3>
                <p>
                  Check suspicious job offers, payment requests and forwarded messages.
                </p>
              </div>

              <label>WhatsApp Message</label>
            </>
          )}

          {["text", "sms", "whatsapp", "email"].includes(mode) && (
            <textarea
              className="textarea large"
              placeholder={placeholders[mode]}
              value={text}
              onChange={e => setText(e.target.value)}
            />
          )}

          {/* URL INPUT */}

          {mode === "url" && (
            <>
              <div className="form-title">
                <h3>Website / URL Security Check</h3>
                <p>
                  Check a suspicious website address before visiting it.
                </p>
              </div>

              <label>Website URL</label>

              <input
                className="text-input"
                type="url"
                placeholder={placeholders.url}
                value={text}
                onChange={e => setText(e.target.value)}
              />
            </>
          )}

          {/* IMAGE INPUT */}

          {mode === "file" && (
            <>
              <div className="form-title">
                <h3>Image / Screenshot Analysis</h3>
                <p>
                  Upload an SMS, WhatsApp, payment or suspicious offer screenshot.
                </p>
              </div>

              <label>Select Image</label>

              <input
                className="text-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />

              {file && (
                <p className="file-selected">
                  Selected: {file.name}
                </p>
              )}

              <p className="file-selected">
                Supported formats: JPG, PNG, WEBP. Maximum size: 5 MB.
              </p>
            </>
          )}

          <button
            className="primary-btn"
            type="button"
            onClick={handleScan}
            disabled={loading}
          >
            <ScanSearch size={18} />

            {loading ? "Analyzing..." : "Analyze Content"}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="scan-error">
            <AlertTriangle size={19} />
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="analysis-loading">
            <div className="loading-line"></div>
            <h3>Analyzing Your Content</h3>
            <p>Examining suspicious patterns...</p>
          </div>
        )}

        {/* RESULT */}

        {result && (
          <div className="result-dashboard">

            <div className="result-header">
              <div>
                <span className="result-eyebrow">
                  SECURITY INTELLIGENCE REPORT
                </span>

                <h2>Scan Analysis Complete</h2>

                <p>Your content has been analyzed.</p>
              </div>

              <div
                className={`result-icon ${
                  isThreat ? "danger" : "safe"
                }`}
              >
                {isThreat
                  ? <ShieldAlert size={30} />
                  : <ShieldCheck size={30} />
                }
              </div>
            </div>

            {/* MAIN RESULT */}

            <div
              className={`result-main ${
                isThreat ? "danger-bg" : "safe-bg"
              }`}
            >
              <div>
                <span className="result-label">
                  DETECTION RESULT
                </span>

                <h1>
                  {uncertain
                    ? "Please Verify Manually"
                    : isThreat
                      ? "Potential Scam Detected"
                      : "No Scam Indicators Detected"
                  }
                </h1>

                <p>
                  {result.verdict ||
                    result.message ||
                    "Automated analysis completed. Please verify independently."
                  }
                </p>
              </div>

              <div
                className="confidence-circle"
                style={{
                  "--progress": `${confidence ?? 0}%`,
                  "--meter-color": isThreat
                    ? "#dc5656"
                    : "#079866"
                }}
              >
                <div className="confidence-inner">
                  <strong>
                    {confidence !== null
                      ? `${confidence.toFixed(1)}%`
                      : "N/A"
                    }
                  </strong>

                  <span>Confidence</span>
                </div>
              </div>
            </div>

            {/* RESULT STATS */}

            <div className="result-stats">

              <div className="result-stat">
                <span>Scan Type</span>
                <strong>{displayScanType}</strong>
              </div>

              <div className="result-stat">
                <span>Risk Assessment</span>

                <strong
                  className={
                    isThreat ? "risk-danger" : "risk-safe"
                  }
                >
                  {risk}
                </strong>
              </div>

              <div className="result-stat">
                <span>Detection Engine</span>

                <strong>
                  {mode === "url"
                    ? "URL Pattern Check"
                    : mode === "file"
                      ? "OCR + ML"
                      : "Python ML"
                  }
                </strong>
              </div>
            </div>

            {/* IMAGE OCR TEXT */}

            {result.extractedText && (
              <div className="insight-card">
                <h3>
                  <FileText size={19} />
                  Extracted Image Text
                </h3>

                <p>{result.extractedText}</p>
              </div>
            )}

            {/* URL REASONS */}

            {result.reasons?.length > 0 && (
              <div className="insight-card">
                <h3>
                  <AlertTriangle size={19} />
                  URL Warning Signs
                </h3>

                <ul>
                  {result.reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* EXPLANATION */}

            <div className="insight-card">
              <h3>
                <Info size={19} />
                Analysis Explanation
              </h3>

              <p>
                {result.message ||
                  "No additional details were provided."
                }
              </p>
            </div>

            {/* MODEL NOTE */}

            {result.modelNote && (
              <div className="insight-card">
                <h3>
                  <Info size={19} />
                  Detection Model Information
                </h3>

                <p>{result.modelNote}</p>
              </div>
            )}

            {/* RECOMMENDATIONS */}

            <div className="recommendation-card">
              <h3>
                <ShieldCheck size={19} />
                Security Recommendations
              </h3>

              <ul>
                <li>Do not share OTP, passwords or banking details.</li>
                <li>Verify the sender through official channels.</li>
                <li>Do not make payments without independent verification.</li>
                <li>Do not open suspicious links or attachments.</li>
              </ul>
            </div>

            {/* DISCLAIMER */}

            <div className="result-disclaimer">
              <AlertTriangle size={18} />

              AI predictions are estimates, not definitive proof of fraud
              or proof of safety. Always verify independently.
            </div>

            <button
              className="secondary-btn"
              type="button"
              onClick={resetScan}
            >
              <RotateCcw size={17} />
              Start New Scan
            </button>

          </div>
        )}
      </section>

      {/* INFO STRIP */}

      <section className="info-strip">
        <ShieldCheck size={21} />

        <div>
          <b>Document Scam Detector Protection</b>

          <p>
            Email, text, SMS and WhatsApp use the text classification model.
            URL checks use basic URL patterns. Images are processed through
            OCR and then analyzed using the text model.
          </p>
        </div>
      </section>

    </div>
  );
}
