
import { useState } from 'react';
import {
  Upload, Link, FileText, Mail, ScanSearch, ShieldCheck,
  MessageSquare, MessageCircle, AlertTriangle, CheckCircle2,
  ShieldAlert, RotateCcw, Info, LockKeyhole
} from 'lucide-react';

const modes = [
  { id: 'email', name: 'Email', Icon: Mail, ready: true },
  { id: 'text', name: 'Paste Text', Icon: FileText, ready: true },
  { id: 'sms', name: 'SMS', Icon: MessageSquare, ready: false },
  { id: 'whatsapp', name: 'WhatsApp', Icon: MessageCircle, ready: false },
  { id: 'url', name: 'Website URL', Icon: Link, ready: false },
  { id: 'file', name: 'Document / Image', Icon: Upload, ready: false }
];

export default function NewScan() {
  const [mode, setMode] = useState('email');
  const [text, setText] = useState('');
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const prediction = result?.prediction || result?.verdict || 'Unknown';

  const isPhishing = /phishing|scam|fraud|malicious/i.test(
    String(prediction)
  );

  const confidence = result?.confidence != null
    ? Math.max(0, Math.min(100, Number(result.confidence)))
    : null;

  const risk = isPhishing ? 'High Risk' : 'No Threat Indicated';

  function resetScan() {
    setText('');
    setSender('');
    setSubject('');
    setResult(null);
    setError('');
  }

  async function handleScan() {
    setError('');
    setResult(null);

    if (!text.trim()) {
      setError('Please enter content before starting the scan.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/scan/email',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.trim(),
            sender,
            subject
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Scan failed. Please try again.');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'Unable to connect to backend.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="new-scan-page">

      {/* PAGE HEADER */}
      <div className="page-title">
        <div>
          <h1>New Scan</h1>
          <p>Protect yourself from digital scams with intelligent analysis.</p>
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
            <p>Select the content you want ScamShield to analyze.</p>
          </div>
          <ShieldCheck size={30} color="#079866" />
        </div>

        {/* SCAN OPTIONS */}
        <div className="scan-mode-grid">
          {modes.map(({ id, name, Icon, ready }) => (
            <button
              key={id}
              type="button"
              disabled={!ready}
              className={`scan-mode ${mode === id ? 'selected' : ''} ${!ready ? 'disabled-mode' : ''}`}
              onClick={() => {
                setMode(id);
                resetScan();
              }}
            >
              <Icon size={21} />
              <span>{name}</span>
              {!ready && <small>Coming soon</small>}
            </button>
          ))}
        </div>

        {/* EMAIL FORM */}
        {mode === 'email' && (
          <div className="scan-form">
            <div className="form-title">
              <h3>Email Security Analysis</h3>
              <p>Analyze suspicious emails, job offers and phishing attempts.</p>
            </div>

            <label>Sender Email (Optional)</label>
            <input
              className="text-input"
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
            <textarea
              className="textarea large"
              placeholder="Paste the complete email content here..."
              value={text}
              onChange={e => setText(e.target.value)}
            />

            <button
              className="primary-btn"
              onClick={handleScan}
              disabled={loading}
            >
              <ScanSearch size={18} />
              {loading ? 'Analyzing Email...' : 'Analyze Email'}
            </button>
          </div>
        )}

        {/* TEXT FORM */}
        {mode === 'text' && (
          <div className="scan-form">
            <div className="form-title">
              <h3>Message Analysis</h3>
              <p>Paste suspicious text for experimental phishing analysis.</p>
            </div>

            <textarea
              className="textarea large"
              placeholder="Paste SMS, job offer or suspicious message here..."
              value={text}
              onChange={e => setText(e.target.value)}
            />

            <div className="model-notice">
              <Info size={17} />
              This currently uses an email-trained ML model.
              Text message predictions are experimental.
            </div>

            <button
              className="primary-btn"
              onClick={handleScan}
              disabled={loading}
            >
              <ScanSearch size={18} />
              {loading ? 'Analyzing...' : 'Analyze Content'}
            </button>
          </div>
        )}

        {/* COMING SOON */}
        {!['email', 'text'].includes(mode) && (
          <div className="coming-soon">
            <LockKeyhole size={38} color="#079866" />
            <h3>Detection Module Coming Soon</h3>
            <p>
              A dedicated detection engine will be integrated
              for this content type.
            </p>
          </div>
        )}

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
            <p>Examining patterns with the Python ML engine...</p>
          </div>
        )}

        {/* RESULT DASHBOARD */}
        {result && (
          <div className="result-dashboard">

            <div className="result-header">
              <div>
                <span className="result-eyebrow">SECURITY INTELLIGENCE REPORT</span>
                <h2>Scan Analysis Complete</h2>
                <p>Your content has been analyzed by ScamShield.</p>
              </div>

              <div className={`result-icon ${isPhishing ? 'danger' : 'safe'}`}>
                {isPhishing
                  ? <ShieldAlert size={30} />
                  : <ShieldCheck size={30} />
                }
              </div>
            </div>

            {/* MAIN RESULT */}
            <div className={`result-main ${isPhishing ? 'danger-bg' : 'safe-bg'}`}>
              <div>
                <span className="result-label">DETECTION RESULT</span>

                <h1>{prediction}</h1>

                <p>
                  {isPhishing
                    ? 'Potentially suspicious content detected.'
                    : 'The model did not indicate phishing in this content.'}
                </p>
              </div>

              <div
                className="confidence-circle"
                style={{
                  '--progress': `${confidence ?? 0}%`,
                  '--meter-color': isPhishing ? '#dc5656' : '#079866'
                }}
              >
                <div className="confidence-inner">
                  <strong>
                    {confidence !== null ? `${confidence.toFixed(1)}%` : 'N/A'}
                  </strong>
                  <span>Confidence</span>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="result-stats">
              <div className="result-stat">
                <span>Classification</span>
                <strong>{prediction}</strong>
              </div>

              <div className="result-stat">
                <span>Risk Assessment</span>
                <strong className={isPhishing ? 'risk-danger' : 'risk-safe'}>
                  {risk}
                </strong>
              </div>

              <div className="result-stat">
                <span>Detection Engine</span>
                <strong>Python ML</strong>
              </div>
            </div>

            {/* EXPLANATION */}
            <div className="insight-card">
              <h3>
                <Info size={19} />
                Analysis Explanation
              </h3>

              <p>
                {result.message || result.reason ||
                  'The model completed the analysis without providing additional details.'}
              </p>
            </div>

            {/* RECOMMENDATIONS */}
            <div className="recommendation-card">
              <h3>
                <ShieldCheck size={19} />
                Security Recommendations
              </h3>

              {isPhishing ? (
                <ul>
                  <li>Do not click suspicious links.</li>
                  <li>Never share OTP, passwords or banking details.</li>
                  <li>Verify the sender through official channels.</li>
                  <li>Avoid making payments without verification.</li>
                </ul>
              ) : (
                <ul>
                  <li>Verify the sender before taking important action.</li>
                  <li>Never share confidential information unnecessarily.</li>
                  <li>Continue following safe online practices.</li>
                </ul>
              )}
            </div>

            {/* DISCLAIMER */}
            <div className="result-disclaimer">
              <AlertTriangle size={18} />
              AI predictions are estimates, not definitive proof
              of fraud or proof of safety. Always verify independently.
            </div>

            <button className="secondary-btn" onClick={resetScan}>
              <RotateCcw size={17} />
              Start New Scan
            </button>

          </div>
        )}
      </section>

      {/* INFO FOOTER */}
      <section className="info-strip">
        <ShieldCheck size={21} />
        <div>
          <b>ScamShield Protection</b>
          <p>
            Email analysis is powered by your trained Python
            machine learning model.
          </p>
        </div>
      </section>

    </div>
  );
}
