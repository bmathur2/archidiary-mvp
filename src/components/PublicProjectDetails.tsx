import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface PublicProjectDetailsProps {
  projectId: string | null;
  setPage: (page: string) => void;
}

interface Project {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  link: string | null;
  image_url: string | null;
  created_at?: string;
}

export function PublicProjectDetails({
  projectId,
  setPage,
}: PublicProjectDetailsProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) {
      setError("Project not found.");
      setLoading(false);
      return;
    }

    fetchProjectDetails(projectId);
  }, [projectId]);

  async function fetchProjectDetails(id: string) {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("projects")
      .select("id, title, category, description, link, image_url, created_at")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching project details:", error.message);
      setError("Unable to load project details.");
      setProject(null);
    } else {
      setProject(data);
    }

    setLoading(false);
  }

  return (
    <main className="public-project-details-page">
      
  <header className="public-header">
        <div className="container">
          <div className="public-header-inner">
            <div className="public-logo">
              <span><img src="/logo.png" alt="Archidiary Logo" /></span>
            </div>
            <button
              type="button"
              className="upload-project-btn"
              onClick={() => setPage("register")}
            >
              Register for Submit Work
            </button>
            </div>
        </div>
      </header>

      <section className="project-details-container">

       <div className="project-heading"> 
        <h1>Project Details</h1>
        <button
          type="button"
          className="back-projects-btn"
          onClick={() => setPage("public-projects")}
        >
          ← Back to Projects
        </button>
        </div>

        {loading && <p className="status-message">Loading project details...</p>}

        {!loading && error && <p className="status-message error">{error}</p>}

        {!loading && !error && project && (
          <article className="project-details-card">
            <div className="project-details-image-wrap">
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="project-details-image"
                />
              ) : (
                <div className="project-placeholder">No Image Available</div>
              )}
            </div>

            <div className="project-details-content">
              <span className="project-category">
                {project.category || "Other"}
              </span>

              <h2>{project.title}</h2>

              {project.created_at && (
                <p className="project-date">
                  Uploaded on{" "}
                  {new Date(project.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}

              <div className="project-description">
                <h2>Project Description</h2>
                <p>{project.description || "No description available."}</p>
              </div>

              <div className="project-details-actions">
                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-project-btn"
                  >
                    Visit Project
                  </a>
                ) : (
                  <button
                    type="button"
                    className="view-project-btn disabled"
                    disabled
                  >
                    No Link Available
                  </button>
                )}

                <button
                  type="button"
                  className="secondary-project-btn"
                  onClick={() => setPage("public-projects")}
                >
                  View All Projects
                </button>
              </div>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}