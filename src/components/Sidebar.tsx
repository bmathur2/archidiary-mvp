interface SidebarProps {
  page: string;
  setPage: (page: string) => void;
  onLogout: () => void;
}

export function Sidebar({ page, setPage, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/logo.png" alt="Archidiary Logo" />
      </div>

      <nav className="nav">
        <button
          className={page === "dashboard" ? "active" : ""}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={page === "upload" ? "active" : ""}
          onClick={() => setPage("upload")}
        >
          Upload Project
        </button>

        <button
          className={page === "preview" ? "active" : ""}
          onClick={() => setPage("preview")}
        >
          Preview Project
        </button>
      </nav>

      <button className="logout" onClick={onLogout}>
        Logout
      </button>
    </aside>
  );
}