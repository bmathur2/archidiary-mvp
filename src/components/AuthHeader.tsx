interface AuthHeaderProps {
  setPage: (page: string) => void;
}

export function AuthHeader({ setPage }: AuthHeaderProps) {
  return (
    <header className="site-header auth-header">
      <div className="site-header-inner">
        <button
          type="button"
          className="site-logo-btn"
          onClick={() => setPage("public-projects")}
          aria-label="Go to home page"
        >
         <div className=""><img alt="Archidiary Logo" src="/logo.png" /></div>
        </button>

        <button
          type="button"
          className="back-home-btn"
          onClick={() => setPage("public-projects")}
        >
          Back to Home Page
        </button>
      </div>
    </header>
  );
}