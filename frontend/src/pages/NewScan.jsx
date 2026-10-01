import { useState } from 'react';
import { Upload, Link, FileText, Mail, ScanSearch, ShieldCheck } from 'lucide-react';

export default function NewScan() {
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('');
  const modes = [['text','Paste Text',FileText],['email','Email',Mail],['url','URL',Link],['file','Upload File',Upload]];
  return <>
    <div className="page-title"><div><h1>New Scan</h1><p>Submit anything suspicious. The system will identify its type automatically.</p></div></div>
    <section className="card scan-card">
      <div className="scan-tabs">{modes.map(([id,name,Icon]) => <button key={id} className={mode===id?'scan-tab active':'scan-tab'} onClick={()=>setMode(id)}><Icon size={17}/>{name}</button>)}</div>
      {mode==='file' ? <div className="dropzone"><Upload size={42}/><h3>Drop your file here</h3><p>PDF, DOCX, JPG, PNG or TXT</p><button className="primary-btn">Choose File</button></div> : mode==='url' ? <div className="form-area"><label>Website or suspicious URL</label><input className="text-input" placeholder="https://example.com"/><button className="primary-btn"><ScanSearch size={18}/> Analyze URL</button></div> : mode==='email' ? <div className="form-area"><label>Sender</label><input className="text-input" placeholder="sender@example.com"/><label>Subject</label><input className="text-input" placeholder="Email subject"/><label>Email Content</label><textarea className="textarea" placeholder="Paste email content here..." value={text} onChange={e=>setText(e.target.value)}/><button className="primary-btn"><ScanSearch size={18}/> Analyze Email</button></div> : <div className="form-area"><label>Paste suspicious content</label><textarea className="textarea large" placeholder="Paste SMS, WhatsApp message, job offer, payment request or any suspicious text..." value={text} onChange={e=>setText(e.target.value)}/><div className="helper">💡 You don't have to tell us whether it is SMS, Email, Job Offer or anything else.</div><button className="primary-btn"><ScanSearch size={18}/> Analyze Content</button></div>}
    </section>
    <section className="info-strip"><ShieldCheck size={20}/><div><b>What happens next?</b><p>ScamShield extracts evidence, detects content type, checks rules, performs AI analysis and generates a risk score with recommendations.</p></div></section>
  </>;
}
