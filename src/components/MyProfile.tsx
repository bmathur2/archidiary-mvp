import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface MyProfileProps {
  user: { id?: string; name?: string; email?: string } | null;
  setUser: (user: { id: string; name: string; email: string }) => void;
}

export default function MyProfile({ user, setUser }: MyProfileProps) {
  const [userId, setUserId] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
  setLoading(true);
  setMessage("");

  try {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      setMessage("User not found. Please login again.");
      setLoading(false);
      return;
    }

    setUserId(authUser.id);

    const authEmail = authUser.email || user?.email || "";

    const authFullName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      user?.name ||
      "";

    const authPhone = authUser.user_metadata?.phone || "";
    const authJobTitle = authUser.user_metadata?.job_title || "";

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, job_title, phone, location, website, avatar_url"
      )
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    if (profile) {
      setFullName(profile.full_name || authFullName);
      setEmail(profile.email || authEmail);
      setJobTitle(profile.job_title || authJobTitle);
      setPhone(profile.phone || authPhone);
      setLocation(profile.location || "");
      setWebsite(profile.website || "");
      setAvatarUrl(profile.avatar_url || null);

      // If profiles table has blank phone, update it from auth metadata
      if (!profile.phone && authPhone) {
        await supabase
          .from("profiles")
          .update({
            phone: authPhone,
            job_title: profile.job_title || authJobTitle,
            full_name: profile.full_name || authFullName,
            updated_at: new Date().toISOString(),
          })
          .eq("id", authUser.id);
      }

      setUser({
        id: authUser.id,
        name: profile.full_name || authFullName,
        email: profile.email || authEmail,
      });
    } else {
      setFullName(authFullName);
      setEmail(authEmail);
      setJobTitle(authJobTitle);
      setPhone(authPhone);
      setLocation("");
      setWebsite("");
      setAvatarUrl(null);

      await supabase.from("profiles").upsert(
        {
          id: authUser.id,
          email: authEmail,
          full_name: authFullName,
          job_title: authJobTitle,
          phone: authPhone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      setUser({
        id: authUser.id,
        name: authFullName,
        email: authEmail,
      });
    }
  } catch (err) {
    setMessage(err instanceof Error ? err.message : "Profile load failed");
  }

  setLoading(false);
};

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setMessage("User not found. Please login again.");
      return;
    }

    setLoading(true);
    setMessage("");

    const profileData = {
      id: userId,
      email: email.trim(),
      full_name: fullName.trim(),
      job_title: jobTitle.trim(),
      phone: phone.trim(),
      location: location.trim(),
      website: website.trim(),
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    };

    console.log("Saving profile:", profileData);

    const { data: savedProfile, error: profileError } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "id" })
      .select()
      .single();

    console.log("Saved profile:", savedProfile);
    console.log("Profile save error:", profileError);

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        name: fullName.trim(),
      },
    });

    if (authError) {
      setMessage(authError.message);
      setLoading(false);
      return;
    }

    setUser({
      id: userId,
      name: fullName.trim(),
      email: email.trim(),
    });

    setMessage("Profile updated successfully.");
    setLoading(false);
  };

  const handleAvatarUpload = async (file: File | null) => {
    if (!file || !userId) return;

    setLoading(true);
    setMessage("");

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setMessage(uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      setAvatarUrl(publicUrl);

      const { error: avatarSaveError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email: email.trim(),
          full_name: fullName.trim(),
          phone: phone.trim(),
          job_title: jobTitle.trim(),
          location: location.trim(),
          website: website.trim(),
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (avatarSaveError) {
        setMessage(avatarSaveError.message);
        setLoading(false);
        return;
      }

      setMessage("Photo uploaded successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    }

    setLoading(false);
  };

  const handleDeleteAvatar = async () => {
    if (!userId) return;

    setLoading(true);
    setMessage("");

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        setMessage(updateError.message);
        setLoading(false);
        return;
      }

      setAvatarUrl(null);
      setMessage("Photo deleted successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Delete failed");
    }

    setLoading(false);
  };

  return (
    <section className="page-container">
      <div className="card profile-card">
        <div className="profile-header">
          <h3>Personal Details</h3>

          <div className="avatar-container">
            <img
              src={avatarUrl || "/avatar-placeholder.png"}
              alt="User avatar"
              className="avatar-image"
            />
            <label className="avatar-edit-btn" htmlFor="avatar-input">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </label>
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleAvatarUpload(e.target.files ? e.target.files[0] : null)
              }
              disabled={loading}
              style={{ display: "none" }}
            />
          </div>

          <div className="avatar-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={handleDeleteAvatar}
              disabled={loading || !avatarUrl}
            >
              Delete Photo
            </button>
          </div>

          {message && (
            <div className="photoupdate-msg"
              style={{
                marginTop: "10px",
                color:
                  message.toLowerCase().includes("success") ||
                  message.toLowerCase().includes("uploaded")
                    ? "#065f46"
                    : "#dc2626",
              }}
            >
              {message}
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="form-grid">
          <div className="form-row">
            <div className="form-col">
              <label>Email</label>
              <input type="email" value={email} disabled />
            </div>

            <div className="form-col">
              <label>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label>Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-col">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-col">
              <label>Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </section>
  );
}