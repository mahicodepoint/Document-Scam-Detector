import { ShieldCheck, ScanSearch, Brain, Zap, ShieldAlert, Lightbulb, Upload, ArrowRight } from 'lucide-react';

export default function Home({ onNavigate }) {
  return <>
    <section className="hero-panel">
      <div className="hero-copy">
        <span className="eyebrow"><ShieldCheck size={15}/> AI-POWERED SCAM PROTECTION</span>
        <h1>Stay Safe.<br/><span>Stay Aware.</span></h1>
        <p>Upload or paste anything suspicious and let ScamShield automatically detect, analyze and explain potential scam risks.</p>
        <button className="primary-btn" onClick={() => onNavigate('New Scan')}><ScanSearch size={18}/> Start New Scan</button>
      </div>
      <div className="hero-art"><div className="hero-shield"><ShieldCheck size={88}/></div></div>
    </section>

    <section className="card analysis-preview">
      <div className="section-head"><div><h2>Upload or Paste Anything Suspicious</h2><p>You don't need to select the content type. ScamShield will detect it automatically.</p></div><span className="auto-pill">⚡ Auto Detection</span></div>
      <div className="quick-grid">
        {[
          ['📄','Upload File','PDF, DOCX, JPG, PNG'],['📋','Paste Text','Message, SMS, chat'],['✉️','Paste Email','Email content & sender'],['🔗','Enter URL','Website or suspicious link']
        ].map(([icon,title,desc]) => <button className="quick-card" key={title} onClick={() => onNavigate('New Scan')}><div className="quick-icon">{icon}</div><b>{title}</b><span>{desc}</span><small>Open →</small></button>)}
      </div>
      <div className="privacy">🔒 Supported: PDF, DOCX, JPG, PNG, TXT, Email & URL &nbsp; • &nbsp; Your content is securely processed.</div>
    </section>

    <section className="feature-grid">
      {[[Brain,'AI-Powered Analysis','AI understands context and suspicious patterns.'],[Zap,'Automatic Detection','No need to select SMS, Email or Job Offer.'],[ShieldAlert,'Risk Assessment','Transparent risk score from 0–100.'],[Lightbulb,'Smart Recommendations','Know what action you should take.']].map(([Icon,title,text]) => <div className="feature-card" key={title}><div className="feature-icon"><Icon size={21}/></div><div><b>{title}</b><p>{text}</p></div></div>)}
    </section>

    <section className="card how-card"><div className="section-head"><div><h2>How ScamShield Works</h2><p>One flow for messages, documents, screenshots, emails and links.</p></div><button className="ghost-btn" onClick={() => onNavigate('New Scan')}>Try it <ArrowRight size={15}/></button></div><div className="steps">{[['01','Upload or Paste'],['02','Auto Detection'],['03','Deep Analysis'],['04','Risk Assessment'],['05','Recommendations']].map(([n,t]) => <div className="step" key={n}><span>{n}</span><b>{t}</b></div>)}</div></section>
  </>;
}
