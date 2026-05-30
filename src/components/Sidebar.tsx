interface SidebarProps {
  page: string;
  setPage: (page: string, options?: { clearSelectedProject?: boolean }) => void;
  onLogout: () => void;
}

export function Sidebar({ page, setPage, onLogout }: SidebarProps) {

  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/logo.png" alt="Archidiary Logo" />
      </div>

     <div className="sidebar-content">
        <nav className="nav">
          <a
            href="#dashboard"
            className={page === "dashboard" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setPage("dashboard");
            }}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11.5L12 4l9 7.5v8.5a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" />
              </svg>
            </span>
            Dashboard
          </a>

          <a
            href="#preview"
            className={page === "preview" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setPage("preview", { clearSelectedProject: true });
            }}
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            My Projects
          </a>
        </nav>
        <button className="logout" onClick={onLogout}>
          <span className="nav-icon">🔒</span>
          Logout
        </button>
     </div>
    </aside>
  );
}