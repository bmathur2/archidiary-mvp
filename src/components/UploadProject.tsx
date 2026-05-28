import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  addProject as dbAddProject,
  uploadImage,
  type Project,
} from "../lib/database";
import { supabase } from "../lib/supabaseClient";

interface UploadProjectProps {
  addProject: (project: Project) => void;
}

export function UploadProject({ addProject: onAddProject }: UploadProjectProps) {
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    link: "",
    image: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setForm({
      ...form,
      image: file,
    });

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.category) {
      setError("Please select project category.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter project title.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";

      if (form.image) {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData.user) {
          setError("User not found. Please login again.");
          setLoading(false);
          return;
        }

        const { url, error: uploadErr } = await uploadImage(
          form.image,
          userData.user.id
        );

        if (uploadErr) {
          setError(uploadErr);
          setLoading(false);
          return;
        }

        imageUrl = url || "";
      }

      const projectData: Project = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim() || "No description added.",
        link: form.link.trim() || "https://example.com",
        image_url: imageUrl,
      };

      const { project, error: dbError } = await dbAddProject(projectData);

      if (dbError) {
        setError(dbError);
        setLoading(false);
        return;
      }

      if (project) {
        setSuccess("Project uploaded successfully!");

        onAddProject({
          ...project,
          title: project.title || projectData.title,
          category: project.category || projectData.category,
          description: project.description || projectData.description,
          link: project.link || projectData.link,
          image_url: project.image_url || imageUrl,
          date: project.date,
        });

        setForm({
          title: "",
          category: "",
          description: "",
          link: "",
          image: null,
        });

        setImagePreview(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }

    setLoading(false);
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Upload Project</h1>
          <p>Add project information and preview it instantly.</p>
        </div>
      </div>

      <div className="content-card form-card">
        <form onSubmit={handleSubmit}>
          <label>Category</label>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select Project Category</option>
            <option value="Project">Project</option>
            <option value="Product">Product</option>
            <option value="Article">Article</option>
            <option value="Competition / Award / Scholarship / Fellowship">
              Competition / Award / Scholarship / Fellowship
            </option>
            <option value="News / Announcement">News / Announcement</option>
            <option value="Publication">Publication</option>
            <option value="Offer a Workshop">Offer a Workshop</option>
            <option value="ArchiDiaries Jobs">ArchiDiaries Jobs</option>
            <option value="Academic Studio">Academic Studio</option>
            <option value="Academic Project">Academic Project</option>
            <option value="Event">Event</option>
          </select>

          <label>Project Title</label>

          <input
            name="title"
            type="text"
            placeholder="Website redesign"
            value={form.title}
            onChange={handleChange}
            disabled={loading}
          />

          <label>Project Link</label>

          <input
            name="link"
            type="url"
            placeholder="https://example.com"
            value={form.link}
            onChange={handleChange}
            disabled={loading}
          />

          <label>Description</label>

          <textarea
            name="description"
            rows={5}
            placeholder="Write short project description"
            value={form.description}
            onChange={handleChange}
            disabled={loading}
          />

          <label>Project Image Optional</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
          />

          {imagePreview && (
            <div className="upload-image-preview">
              <img src={imagePreview} alt="Project preview" />
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          {success && <div className="form-success">{success}</div>}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save and Preview"}
          </button>
        </form>
      </div>
    </section>
  );
}