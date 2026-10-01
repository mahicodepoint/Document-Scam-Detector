import { ShieldCheck, Home, ScanSearch, History, FileWarning, Star, Settings } from 'lucide-react';

const items = [
  ['Home', Home], ['New Scan', ScanSearch], ['History', History],
  ['Reports', FileWarning], ['Watchlist', Star], ['Settings', Settings]
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><ShieldCheck size={24}/></div><span>ScamShield</span></div>
      <nav className="nav-list">
        {items.map(([name, Icon]) => (
          <button key={name} className={`nav-item ${activePage === name ? 'active' : ''}`} onClick={() => onNavigate(name)}>
            <Icon size={18}/><span>{name}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-user"><div className="user-avatar">U</div><div><b>User</b><small>Free Account</small></div></div>
    </aside>
  );
}
