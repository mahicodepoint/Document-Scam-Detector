import { useState } from 'react';
import {
  Upload, Link, FileText, Mail, ScanSearch, ShieldCheck,
  MessageSquare, MessageCircle, AlertTriangle, ShieldAlert,
  RotateCcw, Info, Image as ImageIcon
} from 'lucide-react';

const API = 'http://localhost:5000/api/scan';

const modes = [
  { id: 'email', name: 'Email', Icon: Mail },
  { id: 'text', name: 'Paste Text', Icon: FileText },
  { id: 'sms', name: 'SMS', Icon: MessageSquare },
  { id: 'whatsapp', name: 'WhatsApp', Icon: MessageCircle },
  { id: 'url', name: 'Website URL', Icon: Link },
  { id: 'file', name: 'Image / Screenshot', Icon: Upload }
];

export default function NewScan() {
  const [mode, setMode] = useState('email');
  const [text, setText] = useState('');
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const prediction = result?.prediction || 'Unknown';
  const isPhishing = prediction === 'Phishing Email';
  const confidence = result?.confidence != null
    ? Math.max(0, Math.min(100, Number(result.confidence)))
    : null;

  const uncertain = result?.uncertain === true;
  const risk = uncertain ? 'Manual Verification' : isPhishing ? 'High Risk' : 'No Threat Indicators';

  function resetScan() {
    setText('');
    setSender('');
    setSubject('');
    setFile(null);
    setResult(null);
    setError('');
  }

  async function handleScan() {
    setError('');
    setResult(null);

    if (mode === 'file' && !file) {
      setError('Please select an image or screenshot.');
      return;
    }

    if (mode !== 'file' && !text.trim()) {
      setError('Please enter content before starting the scan.');
      return;
    }

    setLoading(true);

    try {
      let response;

      if (mode === 'file') {
        const formData = new FormData();
        formData.append('image', file);
        response = await fetch(`${API}/image`, {
          method: 'POST',
          body: formData
        });
      } else {
        const endpoint = mode === 'url' ? 'url' : 'email';

        response = await fetch(`${API}/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.trim(),
            url: mode === 'url' ? text.trim() : undefined,
            sender,
            subject,
            scanType: mode
          })
        });
      }

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

  const placeholder = {
    text: 'Paste any suspicious message here...',
    sms: 'Paste the SMS message you received...',
    whatsapp: 'Paste the WhatsApp message here...',
    url: 'https://example.com'
  };

  return (
    <div className="new-scan-page">
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

      <section className="card scan-card">
        <div className="scan-heading">
          <div>
            <h2>Choose Your Scan Type</h2>
            <p>Select the content you want to analyze.</p>
          </div>
          <ShieldCheck size={30} color="#079866" />
        </div>

        <div className="scan-mode-grid">
          {modes.map(({ id, name, Icon }) => (
            <button
              key={id}
              type="button"
              className={`scan-mode ${mode === id ? 'selected' : ''}`}
              onClick={() => {
                resetScan();
                setMode(id);
              }}
            >
              <Icon size={21} />
              <span>{name}</span>
            </button>
          ))}
        </div>

        <div className="scan-form">
          {mode === 'email' && (
            <>
              <div className="form-title">
                <h3>Email Security Analysis</h3>
                <p>Analyze suspicious emails, job offers and phishing attempts.</p>
              </div>
              <label>Sender Email (Optional)</label>
              <input className="text-input" placeholder="sender@example.com"
                value={sender} onChange={e => setSender(e.target.value)} />
              <label>Email Subject (Optional)</label>
              <input className="text-input" placeholder="Enter email subject"
                value={subject} onChange={e => setSubject(e.target.value)} />
              <label>Email Content</label>
            </>
          )}

          {mode === 'text' && (
            <>
              <div className="form-title">
                <h3>Message Analysis</h3>
                <p>Paste any message you want to verify.</p>
              </div>
              <label>Message Content</label>
            </>
          )}

          {mode === 'sms' && (
            <>
              <div className="form-title">
                <h3>SMS Scam Detection</h3>
                <p>Check suspicious bank, OTP, KYC, payment and job SMS messages.</p>
              </div>
              <label>SMS Message</label>
            </>
          )}

          {mode === 'whatsapp' && (
            <>
              <div className="form-title">
                <h3>WhatsApp Scam Detection</h3>
                <p>Check suspicious job offers, payment requests and forwarded messages.</p>
              </div>
              <label>WhatsApp Message</label>
            </>
          )}

          {['text', 'sms', 'whatsapp', 'email'].includes(mode) && (
            <textarea
              className="textarea large"
              placeholder={placeholder[mode] || 'Paste email content here...'}
              value={text}
              onChange={e => setText(e.target.value)}
            />
          )}

          {mode === 'url' && (
            <>
              <div className="form-title">
                <h3>Website / URL Security Check</h3>
                <p>Check a suspicious website address before visiting it.</p>
              </div>
              <label>Website URL</label>
              <input
                className="text-input"
                type="url"
                placeholder={placeholder.url}
                value={text}
                onChange={e => setText(e.target.value)}
              />
            </>
          )}

          {mode === 'file' && (
            <>
              <div className="form-title">
                <h3>Image / Screenshot Analysis</h3>
                <p>Upload an SMS, WhatsApp, payment or suspicious offer screenshot.</p>
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
            </>
          )}

          <button className="primary-btn" onClick={handleScan} disabled={loading}>
            <ScanSearch size={18} />
            {loading ? 'Analyzing...' : 'Analyze Content'}
          </button>
        </div>

        {error && (
          <div className="scan-error">
            <AlertTriangle size={19} />
            {error}
          </div>
        )}

        {loading && (
          <div className="analysis-loading">
            <div className="loading-line"></div>
            <h3>Analyzing Your Content</h3>
            <p>Examining suspicious patterns...</p>
          </div>
        )}

        {result && (
          <div className="result-dashboard">
            <div className="result-header">
              <div>
                <span className="result-eyebrow">SECURITY INTELLIGENCE REPORT</span>
                <h2>Scan Analysis Complete</h2>
                <p>Your content has been analyzed.</p>
              </div>
              <div className={`result-icon ${isPhishing ? 'danger' : 'safe'}`}>
                {isPhishing ? <ShieldAlert size={30} /> : <ShieldCheck size={30} />}
              </div>
            </div>

            <div className={`result-main ${isPhishing ? 'danger-bg' : 'safe-bg'}`}>
              <div>
                <span className="result-label">DETECTION RESULT</span>
                <h1>
                  {uncertain ? 'Please Verify Manually' :
                    isPhishing ? 'Potential Scam Detected' : 'No Scam Indicators Detected'}
                </h1>
                <p>
                  {result.verdict || result.message ||
                    'Automated analysis completed. Please verify independently.'}
                </p>
              </div>
              <div className="confidence-circle"
                style={{
                  '--progress': `${confidence ?? 0}%`,
                  '--meter-color': isPhishing ? '#dc5656' : '#079866'
                }}>
                <div className="confidence-inner">
                  <strong>{confidence !== null ? `${confidence.toFixed(1)}%` : 'N/A'}</strong>
                  <span>Confidence</span>
                </div>
              </div>
            </div>

            <div className="result-stats">
              <div className="result-stat">
                <span>Scan Type</span>
                <strong>{mode.toUpperCase()}</strong>
              </div>
              <div className="result-stat">
                <span>Risk Assessment</span>
                <strong className={isPhishing ? 'risk-danger' : 'risk-safe'}>{risk}</strong>
              </div>
              <div className="result-stat">
                <span>Detection Engine</span>
                <strong>{mode === 'url' ? 'URL Analysis' : mode === 'file' ? 'OCR + ML' : 'Python ML'}</strong>
              </div>
            </div>

            {result.extractedText && (
              <div className="insight-card">
                <h3><FileText size={19} /> Extracted Image Text</h3>
                <p>{result.extractedText}</p>
              </div>
            )}

            <div className="insight-card">
              <h3><Info size={19} /> Analysis Explanation</h3>
              <p>{result.message || 'No additional details were provided.'}</p>
            </div>

            <div className="recommendation-card">
              <h3><ShieldCheck size={19} /> Security Recommendations</h3>
              <ul>
                <li>Do not share OTP, passwords or banking details.</li>
                <li>Verify the sender through official channels.</li>
                <li>Do not make payments without independent verification.</li>
                <li>Do not open suspicious links or attachments.</li>
              </ul>
            </div>

            <div className="result-disclaimer">
              <AlertTriangle size={18} />
              AI predictions are estimates, not definitive proof of fraud or proof of safety.
              Always verify independently.
            </div>

            <button className="secondary-btn" onClick={resetScan}>
              <RotateCcw size={17} /> Start New Scan
            </button>
          </div>
        )}
      </section>

      <section className="info-strip">
        <ShieldCheck size={21} />
        <div>
          <b>ScamShield Protection</b>
          <p>Email, SMS and WhatsApp use the text classification model.
            URL checks and image OCR require their respective backend routes.</p>
        </div>
      </section>
    </div>
  );
}
