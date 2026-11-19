import {
  ShieldCheck, Home, ScanSearch, History,
  FileWarning, Star, Settings, LogOut
} from "lucide-react";

const items = [
  ["Home", Home],
  ["New Scan", ScanSearch],
  ["History", History],
  ["Reports", FileWarning],
  ["Watchlist", Star],
  ["Settings", Settings]
];

export default function Sidebar({
  activePage, onNavigate, userName = "Customer", onLogout
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><ShieldCheck size={24}/></div>
        <span>ScamShield</span>
      </div>

      <nav className="nav-list">
        {items.map(([name, Icon]) => (
          <button
            key={name}
            className={`nav-item ${activePage === name ? "active" : ""}`}
            onClick={() => onNavigate(name)}
          >
            <Icon size={18}/>
            <span>{name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">
          {(userName || "U").charAt(0).toUpperCase()}
        </div>
        <div className="sidebar-user-info">
          <b>{userName}</b>
          <small>Customer Account</small>
        </div>
      </div>

      <button className="nav-item logout-button" onClick={onLogout}>
        <LogOut size={18}/>
        <span>Logout</span>
      </button>
    </aside>
  );
}
