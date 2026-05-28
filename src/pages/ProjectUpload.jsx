import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

function ProjectUpload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleUpload(e) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter project title");
      return;
    }

    if (!description.trim()) {
      alert("Please enter project description");
      return;
    }

    if (!category.trim()) {
      alert("Please select project category");
      return;
    }

    setLoading(true);

    try {
      // Get logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      let fileUrl = "";

      // Upload file if selected
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("project-files")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload Error:", uploadError);
          alert(uploadError.message);
          return;
        }

        // Get public URL after upload
        const { data: publicUrlData } = supabase.storage
          .from("project-files")
          .getPublicUrl(filePath);

        fileUrl = publicUrlData.publicUrl;
      }

      // Insert project data into projects table
      const { data: project, error: insertError } = await supabase
        .from("projects")
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            description: description.trim(),
            category: category,
            file_url: fileUrl,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Insert Error:", insertError);
        alert(insertError.message);
        return;
      }

      alert("Project uploaded successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setFile(null);

      navigate(`/project-preview/${project.id}`);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleUpload}>
      <h1>Upload Project</h1>

      <input
        type="text"
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Project Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Select Category</option>
        <option value="web-design">Web Design</option>
        <option value="wordpress">WordPress</option>
        <option value="react">React</option>
        <option value="ui-ux">UI/UX</option>
        <option value="other">Other</option>
      </select>

      <input
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}

export default ProjectUpload;