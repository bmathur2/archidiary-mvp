import { useEffect, useRef, useState } from "react";
import "./styles.css";
import { supabase } from "./lib/supabaseClient";
import { Sidebar } from "./components/Sidebar";
import MyProfile from "./components/MyProfile";
import ChangePassword from "./components/ChangePassword";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { ForgotPassword } from "./components/ForgotPassword";
import { Dashboard } from "./components/Dashboard";
import { UploadProject } from "./components/UploadProject";
import { PreviewProject } from "./components/PreviewProject";
import ResetPassword from "./components/ResetPassword";

interface User {
  name: string;
  email: string;
  id?: string;
}

interface Project {
  title: string;
  category: string;
  description: string;
  link: string;
  date?: string;
}

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState<User | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const path = window.location.pathname;

    if (path === "/reset-password") {
      setPage("reset");
    }

    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name:
            data.user.user_metadata?.name ||
            data.user.email?.split("@")[0] ||
            "User",
        });

        if (path !== "/reset-password") {
          setPage("dashboard");
        }
      }
    };

    getCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name:
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "User",
        });
      } else {
        setUser(null);
        setPage("login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!showProfileMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleSetPage = (
    nextPage: string,
    options?: { clearSelectedProject?: boolean }
  ) => {
    if (nextPage === "preview" && options?.clearSelectedProject) {
      setSelectedProject(null);
    }

    setPage(nextPage);

    if (nextPage === "login") {
      window.history.pushState({}, "", "/");
    }

    if (nextPage === "register") {
      window.history.pushState({}, "", "/register");
    }

    if (nextPage === "forgot") {
      window.history.pushState({}, "", "/forgot-password");
    }

    if (nextPage === "reset") {
      window.history.pushState({}, "", "/reset-password");
    }

    if (nextPage === "dashboard") {
      window.history.pushState({}, "", "/dashboard");
    }

    if (nextPage === "upload") {
      window.history.pushState({}, "", "/upload-project");
    }

    if (nextPage === "preview") {
      window.history.pushState({}, "", "/preview-project");
    }

    if (nextPage === "profile") {
      window.history.pushState({}, "", "/profile");
    }

    if (nextPage === "change-password") {
      window.history.pushState({}, "", "/change-password");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    handleSetPage("login");
  };

  const goToPreview = (project: Project) => {
    setSelectedProject(project);
    handleSetPage("preview");
  };

  const addProject = (project: Project) => {
    setProjects([project, ...projects]);
    setSelectedProject(project);
    handleSetPage("preview");
  };

  const isAuthPage =
    page === "login" ||
    page === "register" ||
    page === "forgot" ||
    page === "reset";

  return (
    <div className="app">
      {!isAuthPage && (
        <Sidebar page={page} setPage={handleSetPage} onLogout={handleLogout} />
      )}

      <main className={isAuthPage ? "auth-main" : "main"}>
        {!isAuthPage && (
          <div className="top-bar">
            <div />
            <div className="profile-menu" ref={profileMenuRef}>
              <button
                className="profile-menu-toggle"
                type="button"
                onClick={() => setShowProfileMenu((prev) => !prev)}
              >
                {user?.name || "Profile"}
                <span className="profile-arrow">▾</span>
              </button>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <button
                    type="button"
                    onClick={() => {
                      handleSetPage("profile");
                      setShowProfileMenu(false);
                    }}
                  >
                    <span className="nav-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    My Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSetPage("change-password");
                      setShowProfileMenu(false);
                    }}
                  >
                    <span className="nav-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 11a4 4 0 0 1 4 4v1" />
                        <path d="M6 16v-1a4 4 0 0 1 4-4" />
                        <path d="M8 19h8" />
                        <path d="M16 19v-2" />
                      </svg>
                    </span>
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setShowProfileMenu(false);
                    }}
                  >
                    <span className="nav-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 17l5-5-5-5" />
                        <path d="M21 12H9" />
                        <path d="M5 19h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5" />
                      </svg>
                    </span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {page === "login" && (
          <Login setPage={handleSetPage} setUser={setUser} />
        )}

        {page === "register" && (
          <Register setPage={handleSetPage} setUser={setUser} />
        )}

        {page === "forgot" && <ForgotPassword setPage={handleSetPage} />}

        {page === "reset" && <ResetPassword setPage={handleSetPage} />}

        {page === "dashboard" && user && (
          <Dashboard
            user={user}
            projects={projects}
            setPage={handleSetPage}
            goToPreview={goToPreview}
            onProjectsLoad={setProjects}
          />
        )}

        {page === "profile" && user && (
          <MyProfile user={user} setUser={(u) => setUser({ ...user, name: u.name })} />
        )}

        {page === "change-password" && <ChangePassword />}

        {page === "upload" && <UploadProject addProject={addProject} />}

        {page === "preview" && (
          <PreviewProject
            project={selectedProject}
            projects={projects}
          />
        )}
      </main>
    </div>
  );
}