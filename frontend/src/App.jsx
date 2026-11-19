import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import NewScan from "./pages/NewScan";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Watchlist from "./pages/Watchlist";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("Home");
  const [authPage, setAuthPage] = useState("Login");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("Home");
    setAuthPage("Login");
  };

  if (!token || !user) {
    return authPage === "Register"
      ? <Register onLogin={() => setAuthPage("Login")} />
      : <Login onRegister={() => setAuthPage("Register")} />;
  }

  const renderPage = () => {
    switch (page) {
      case "New Scan": return <NewScan />;
      case "History": return <History />;
      case "Reports": return <Reports />;
      case "Watchlist": return <Watchlist />;
      case "Settings": return <Settings />;
      default: return <Home onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={page}
        onNavigate={setPage}
        userName={user.name}
        onLogout={logout}
      />
      <main className="main-area">
        <header className="topbar">
          <div>
            <div className="topbar-title">Scam Detection & Risk Analysis</div>
            <div className="topbar-subtitle">
              Protect yourself from suspicious messages, files and links.
            </div>
          </div>
          <div className="topbar-actions">
            <span className="secure-pill">Secure Analysis</span>
            <div className="profile-avatar">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="page-container">{renderPage()}</div>
      </main>
    </div>
  );
}
