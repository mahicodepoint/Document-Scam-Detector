
import { useState } from 'react';
import { Upload, Link, FileText, Mail, ScanSearch, ShieldCheck } from 'lucide-react';

export default function NewScan() {
  const [mode, setMode] = useState('email');
  const [text, setText] = useState('');
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const modes = [
    ['text', 'Paste Text', FileText],
    ['email', 'Email', Mail],
    ['url', 'URL', Link],
    ['file', 'Upload File', Upload]
  ];

  async function handleScan() {
    setError('');
    setResult(null);

    if (!text.trim()) {
      setError('Please enter the content to scan.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/scan/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), sender, subject })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Scan failed. Please try again.');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'Cannot connect to the backend.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>New Scan</h1>
          <p>Check suspicious emails and messages with the ScamShield ML model.</p>
        </div>
      </div>

      <section className="card scan-card">
        <div className="scan-tabs">
          {modes.map(([id, name, Icon]) => (
            <button
              key={id}
              type="button"
              className={mode === id ? 'scan-tab active' : 'scan-tab'}
              onClick={() => {
                setMode(id);
                setError('');
                setResult(null);
              }}
            >
              <Icon size={17} /> {name}
            </button>
          ))}
        </div>

        {mode === 'file' ? (
          <div className="form-area">
            <h3>File scanning</h3>
            <p>PDF, DOCX and image scanning are not connected yet. Use Email or Paste Text for now.</p>
          </div>
        ) : mode === 'url' ? (
          <div className="form-area">
            <label>Website or suspicious URL</label>
            <input
              className="text-input"
              placeholder="https://example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
            <p>URL-specific analysis is not connected yet. Paste the suspicious message in the Paste Text tab.</p>
          </div>
        ) : mode === 'email' ? (
          <div className="form-area">
            <label>Sender (optional)</label>
            <input
              className="text-input"
              placeholder="sender@example.com"
              value={sender}
              onChange={e => setSender(e.target.value)}
            />

            <label>Subject (optional)</label>
            <input
              className="text-input"
              placeholder="Email subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />

            <label>Email Content</label>
            <textarea
              className="textarea"
              placeholder="Paste the complete email content here..."
              value={text}
              onChange={e => setText(e.target.value)}
            />

            <button className="primary-btn" onClick={handleScan} disabled={loading}>
              <ScanSearch size={18} />
              {loading ? 'Analyzing...' : 'Analyze Email'}
            </button>
          </div>
        ) : (
          <div className="form-area">
            <label>Paste suspicious content</label>
            <textarea
              className="textarea large"
              placeholder="Paste SMS, WhatsApp message, job offer or suspicious text..."
              value={text}
              onChange={e => setText(e.target.value)}
            />

            <button className="primary-btn" onClick={handleScan} disabled={loading}>
              <ScanSearch size={18} />
              {loading ? 'Analyzing...' : 'Analyze Content'}
            </button>
          </div>
        )}

        {error && <p style={{ color: '#dc2626', marginTop: 16 }}>{error}</p>}

        {result && (
          <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: '#f0f7ff' }}>
            <h2>Scan Result</h2>
            <p><strong>Prediction:</strong> {result.prediction || result.verdict || 'Unknown'}</p>
            <p><strong>Confidence:</strong> {
              result.confidence != null
                ? `${Number(result.confidence).toFixed(2)}%`
                : 'Not provided'
            }</p>
            <p><strong>Details:</strong> {result.message || result.reason || 'Analysis completed.'}</p>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              ML predictions are estimates. Verify suspicious messages independently.
            </p>
          </div>
        )}
      </section>

      <section className="info-strip">
        <ShieldCheck size={20} />
        <div>
          <b>What happens next?</b>
          <p>The email text is sent to your backend and analyzed by your trained Python ML model.</p>
        </div>
      </section>
    </>
  );
}
