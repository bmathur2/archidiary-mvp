import { useEffect, useState } from "react";
import { getProjects, deleteProject } from "../lib/database";

interface Project {
  id?: string;
  title: string;
  category: string;
  description: string;
  link: string;
  date?: string;
  image_url?: string;
}

interface DashboardProps {
  user: { name: string; email: string };
  projects: Project[];
  setPage: (page: string) => void;
  goToPreview: (project: Project) => void;
  onProjectsLoad: (projects: Project[]) => void;
}

export function Dashboard({
  user,
  projects,
  setPage,
  goToPreview,
  onProjectsLoad,
}: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Popup states
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError("");

    const { projects: dbProjects, error: fetchError } = await getProjects();

    if (fetchError) {
      setError(fetchError);
    } else {
      onProjectsLoad(dbProjects);
    }

    setLoading(false);
  };

  const openDeletePopup = (projectId: string | undefined) => {
    if (!projectId) return;

    setSelectedProjectId(projectId);
    setShowDeletePopup(true);
  };

  const closeDeletePopup = () => {
    setSelectedProjectId(null);
    setShowDeletePopup(false);
  };

  const confirmDeleteProject = async () => {
    if (!selectedProjectId) return;

    setDeletingId(selectedProjectId);
    setError("");

    const { error: deleteError } = await deleteProject(selectedProjectId);

    if (deleteError) {
      setError(deleteError);
      setDeletingId(null);
      closeDeletePopup();
      return;
    }

    await loadProjects();

    setDeletingId(null);
    closeDeletePopup();
  };

  return (
    <section className="page-container">
      <div className="page-header">
        <div>
          <h1>Hello, {user.name}</h1>
          <p>Welcome to your project management area.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Projects</span>
          <strong>{projects.length}</strong>
        </div>

        <div className="stat-card">
          <span>Uploaded</span>
          <strong>{projects.length}</strong>
        </div>

        <div className="stat-card">
          <span>Status</span>
          <strong>Active</strong>
        </div>
      </div>

      <div className="content-card">
        <h2 className="align-left recent-projects">Recent Projects</h2>

        {error && (
          <div
            style={{
              color: "#dc2626",
              padding: "12px",
              marginBottom: "12px",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#667085",
            }}
          >
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects uploaded yet</h3>
            <p>Upload your first project to see preview details here.</p>

            <button
              className="primary-btn small"
              onClick={() => setPage("upload")}
            >
              Upload Project
            </button>
          </div>
        ) : (
          <div className="project-list">
            {projects.map((project, index) => (
              <div className="project-row" key={project.id || index}>
               <div className="project-info-with-thumb">
                    <div className="project-thumb">
                        {project.image_url ? (
                        <img src={project.image_url} alt={project.title} />
                        ) : (
                        <span>No Image</span>
                        )}
                    </div>

                    <div>
                        <h3>{project.title}</h3>
                        <p>{project.category}</p>
                    </div>
                    </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="secondary-btn btn-preview"
                    onClick={() => goToPreview(project)}
                  >
                    Preview
                  </button>

                  <button
                    className="secondary-btn btn-delete"
                    onClick={() => openDeletePopup(project.id)}
                    disabled={deletingId === project.id}
                  >
                    {deletingId === project.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDeletePopup && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-icon">!</div>

            <h2>Delete Project?</h2>

            <p>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </p>

            <div className="delete-modal-actions">
              <button
                className="secondary-btn"
                onClick={closeDeletePopup}
                disabled={!!deletingId}
              >
                Cancel
              </button>

              <button
                className="danger-btn"
                onClick={confirmDeleteProject}
                disabled={!!deletingId}
              >
                {deletingId ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}