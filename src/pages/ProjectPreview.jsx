import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function ProjectPreview() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    async function fetchProject() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setProject(data);
    }

    fetchProject();
  }, [id]);

  if (!project) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Project Preview</h1>

      <h2>{project.title}</h2>
      <p>{project.description}</p>

      {project.file_url && (
        <a href={project.file_url} target="_blank">
          View Uploaded File
        </a>
      )}
    </div>
  );
}

export default ProjectPreview;