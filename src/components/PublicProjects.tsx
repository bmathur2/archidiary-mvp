import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface PublicProjectsProps {
  setPage: (page: string) => void;
  onViewProject: (projectId: string) => void;
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

const categories = [
  "All",
  "Architecture",
  "Interior Design",
  "Residential",
  "Commercial",
  "Landscape",
  "Other",
];

export function PublicProjects({ setPage, onViewProject }: PublicProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("projects")
      .select("id, title, category, description, link, image_url, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error.message);
      setError("Unable to load projects. Please try again later.");
      setProjects([]);
    } else {
      setProjects(data || []);
    }

    setLoading(false);
  }

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.category?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [projects, activeCategory]);

  return (
    <main className="public-projects-page">
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
      
      <section className="projects-hero">
        <div className="container">
          <h1 className="align-left">Explore Architecture Projects</h1>
        </div>
      </section>

      <section className="projects-filter-section">
        <div className="container">
          <div className="category-filters align-left">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? "active" : ""}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="projects-list-section">
         <div className="container">
            {loading && <p className="status-message">Loading projects...</p>}

            {!loading && error && <p className="status-message error">{error}</p>}

            {!loading && !error && filteredProjects.length === 0 && (
              <p className="status-message">
                No projects found in this category.
              </p>
            )}

            {!loading && !error && filteredProjects.length > 0 && (
              <div className="projects-grid">
                {filteredProjects.map((project) => (
                  <article className="project-card" key={project.id}>
                    <div className="project-image-wrap">
                      {project.image_url ? (
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="project-image"
                        />
                      ) : (
                        <div className="project-placeholder">
                          No Image Available
                        </div>
                      )}
                    </div>

                    <div className="project-content">
                      <span className="project-category">
                        {project.category || "Other"}
                      </span>

                      <h2>{project.title}</h2>

                      <p>
                        {project.description
                          ? project.description.length > 120
                            ? `${project.description.slice(0, 120)}...`
                            : project.description
                          : "No description available."}
                      </p>

                      {project.link ? (
                       <button
                          type="button"
                          className="view-project-btn"
                          onClick={() => onViewProject(project.id)}
                        >
                          View Details
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="view-project-btn disabled"
                          disabled
                        >
                          No Link Available
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
        </div>
      </section>
    </main>
  );
}