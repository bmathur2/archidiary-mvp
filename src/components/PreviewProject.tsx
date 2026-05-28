import React from "react";

interface Project {
  id?: string;
  title: string;
  category: string;
  description: string;
  link: string;
  image_url?: string;
  date?: string;
}

interface PreviewProjectProps {
  project: Project | null;
  setPage: (page: string) => void;
}

export function PreviewProject({ project, setPage }: PreviewProjectProps) {
  if (!project) {
    return (
      <section>
        <div className="content-card empty-state top-space">
          <h2>No project selected</h2>
          <p>Please upload a project first to preview details.</p>

          <button
            className="primary-btn small"
            onClick={() => setPage("upload")}
          >
            Upload Project
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Project Preview</h1>
          <p>Review your uploaded project information.</p>
        </div>

        <button
          className="primary-btn small"
          onClick={() => setPage("dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="preview-card">
        <div className="preview-hero">
          <span className="align-left">Project Category: {project.category}</span>
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          <p><strong>Category : </strong> {project.category || "N/A"}</p>
          <p><strong>Upload Date : </strong> {project.date || "N/A"}</p>
          <p><strong>Project Link : </strong> {project.link ? (
              <a href={project.link} target="_blank" rel="noreferrer">
                {project.link}
              </a>
            ) : (
              <span>N/A</span>
            )}</p>
        </div>

        <div className="preview-image-box">
          {project.image_url ? (
            <img src={project.image_url} alt={project.title} />
          ) : (
            <div className="preview-no-image">No Image Available</div>
          )}
        </div>
      </div>
    </section>
  );
}