const rows = [
  ['Job Recruitment Message','Congratulations! You have been selected...','HIGH','85/100','21 Sep 2026'],
  ['Email','Your account requires verification...','MEDIUM','52/100','20 Sep 2026'],
  ['Offer Letter PDF','Offer Letter - Company...','LOW','28/100','19 Sep 2026'],
  ['SMS','Your KYC is pending. Click here...','HIGH','72/100','18 Sep 2026'],
  ['Website','https://example-investment.com','HIGH','91/100','17 Sep 2026']
];
export default function History(){return <><div className="page-title"><div><h1>Analysis History</h1><p>Review your previous ScamShield risk assessments.</p></div></div><section className="card table-card"><div className="table-toolbar"><input className="search-input" placeholder="Search your scans..."/><select><option>All Time</option><option>Today</option><option>This Week</option></select></div><div className="table-wrap"><table><thead><tr><th>Type</th><th>Preview</th><th>Risk</th><th>Score</th><th>Date</th></tr></thead><tbody>{rows.map(r=><tr key={r[4]}><td><b>{r[0]}</b></td><td>{r[1]}</td><td><span className={`risk ${r[2].toLowerCase()}`}>{r[2]}</span></td><td>{r[3]}</td><td>{r[4]}</td></tr>)}</tbody></table></div></section></>}
