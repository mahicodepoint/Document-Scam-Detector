import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import NewScan from './pages/NewScan';
import History from './pages/History';
import Reports from './pages/Reports';
import Watchlist from './pages/Watchlist';
import Settings from './pages/Settings';
import './App.css';

export default function App() {
  const [page, setPage] = useState('Home');

  const renderPage = () => {
    switch (page) {
      case 'New Scan': return <NewScan />;
      case 'History': return <History />;
      case 'Reports': return <Reports />;
      case 'Watchlist': return <Watchlist />;
      case 'Settings': return <Settings />;
      default: return <Home onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={page} onNavigate={setPage} />
      <main className="main-area">
        <header className="topbar">
          <div>
            <div className="topbar-title">Scam Detection & Risk Analysis</div>
            <div className="topbar-subtitle">Protect yourself from suspicious messages, files and links.</div>
          </div>
          <div className="topbar-actions">
            <span className="secure-pill">🔒 Secure Analysis</span>
            <div className="profile-avatar">U</div>
          </div>
        </header>
        <div className="page-container">{renderPage()}</div>
      </main>
    </div>
  );
}
