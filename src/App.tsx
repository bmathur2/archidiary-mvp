import React, { useEffect, useState } from "react";
import "./styles.css";
import { supabase } from "./lib/supabaseClient";
import { Sidebar } from "./components/Sidebar";
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

  const handleSetPage = (nextPage: string) => {
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

        {page === "upload" && <UploadProject addProject={addProject} />}

        {page === "preview" && (
          <PreviewProject project={selectedProject} setPage={handleSetPage} />
        )}
      </main>
    </div>
  );
}