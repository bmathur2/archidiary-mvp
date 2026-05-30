import { useEffect, useState } from "react";
import type { Project } from "../lib/database";
import { deleteProject } from "../lib/database";
import { UploadProject } from "./UploadProject";

interface PreviewProjectProps {
  projects: Project[];
  project?: Project | null;
}

export function PreviewProject({ projects, project }: PreviewProjectProps) {
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [localProjects, setLocalProjects] = useState<Project[]>(projects || []);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // sync local list when parent projects change
  useEffect(() => {
    setLocalProjects(projects || []);
  }, [projects]);

  // if a single project prop is passed (e.g. right after upload), open modal
  useEffect(() => {
    if (project) {
      setModalProject(project);
    }
  }, [project]);

  return (
    <section className="page-container">
      <div className="page-header">
        <div>
          <h1>My Projects</h1>
          <p>Review all your uploaded projects here.</p>
        </div>

        <button className="primary-btn small" onClick={() => setShowUploadModal(true)}>
          Upload Projects
        </button>
      </div>

      <div className="content-card">
        {/* <h2 className="align-left recent-projects">Recent Projects</h2> */}

        {localProjects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects uploaded yet</h3>
            <p>Upload your first project to see it listed here.</p>

            <button className="primary-btn small" onClick={() => setShowUploadModal(true)}>
              Upload Projects
            </button>
          </div>
        ) : (
            <div className="project-list">
            {localProjects.map((item, index) => (
              <div className="project-row" key={item.id || index}>
                <div className="project-info-with-thumb">
                  <div className="project-thumb">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} />
                    ) : (
                      <span>No Image</span>
                    )}
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.category}</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="secondary-btn btn-preview"
                    onClick={() => setModalProject(item)}
                  >
                    View Project
                  </button>

                  <button
                    className="secondary-btn btn-delete"
                    onClick={() => {
                      if (!item.id) return;
                      setSelectedProjectId(item.id);
                      setShowDeletePopup(true);
                    }}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="modal-overlay upload-project-popup" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUploadModal(false)}>×</button>
            <div className="modal-body">
              <UploadProject
                addProject={(p: Project) => {
                  // add to local list and show its preview
                  setLocalProjects((prev) => [p, ...prev]);
                  setModalProject(p);
                  setShowUploadModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {modalProject && (
        <div className="modal-overlay" onClick={() => setModalProject(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalProject(null)}>×</button>
            <div className="modal-body">
              {/* <div className="modal-header">
                <h1>Upload Project</h1>
                <p>Add project information and preview it instantly.</p>
              </div> */}
              <div className="preview-modal-image">
                {modalProject.image_url ? (
                  <img src={modalProject.image_url} alt={modalProject.title} />
                ) : (
                  <div className="preview-no-image">No Image Available</div>
                )}
              </div>

              <div className="preview-modal-hero">
                <h2>{modalProject.title}</h2>
                <p>{modalProject.description}</p>
                <p><strong>Category: </strong>{modalProject.category || "N/A"}</p>
                <p><strong>Upload Date: </strong>{modalProject.date || "N/A"}</p>
                <p>
                  <strong>Project Link: </strong>
                  {modalProject.link ? (
                    <a href={modalProject.link} target="_blank" rel="noreferrer">{modalProject.link}</a>
                  ) : (
                    <span>N/A</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                onClick={() => setShowDeletePopup(false)}
                disabled={!!deletingId}
              >
                Cancel
              </button>

              <button
                className="secondary-btn danger-btn"
                onClick={async () => {
                  if (!selectedProjectId) return;
                  setDeletingId(selectedProjectId);
                  // proceed

                  const { error: deleteError } = await deleteProject(selectedProjectId);

                  if (deleteError) {
                    console.error(deleteError);
                    setDeletingId(null);
                    setShowDeletePopup(false);
                    return;
                  }

                  // remove from local list
                  setLocalProjects((prev) => prev.filter((p) => p.id !== selectedProjectId));
                  setDeletingId(null);
                  setSelectedProjectId(null);
                  setShowDeletePopup(false);
                }}
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
