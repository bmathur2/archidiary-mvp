import { supabase } from "./supabase";

// ==================== Authentication ====================

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  error: string | null;
}

export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (authData.user) {
      // Create user profile in users table
      await createUserProfile(authData.user.id, email, name);
    }

    return {
      user: authData.user
        ? {
            id: authData.user.id,
            email: authData.user.email || "",
            name,
          }
        : null,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : "Sign up failed",
    };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      const userProfile = await getUserProfile(data.user.id);
      return {
        user: {
          id: data.user.id,
          email: data.user.email || "",
          name: userProfile?.full_name || "",
        },
        error: null,
      };
    }

    return { user: null, error: "Sign in failed" };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : "Sign in failed",
    };
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Sign out failed",
    };
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    const userProfile = await getUserProfile(authUser.id);

    return {
      id: authUser.id,
      email: authUser.email || "",
      name: userProfile?.full_name || "",
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function resetPassword(email: string): Promise<{
  error: string | null;
}> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error: error?.message || null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Password reset failed",
    };
  }
}

// ==================== User Profile ====================

async function createUserProfile(
  userId: string,
  email: string,
  fullName: string
): Promise<void> {
  try {
    await supabase.from("users").insert([
      {
        id: userId,
        email,
        full_name: fullName,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
}

async function getUserProfile(
  userId: string
): Promise<{ full_name?: string } | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (error) return null;
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

// ==================== Projects ====================

export interface Project {
  date: string | undefined;
  id?: string;
  title: string;
  category: string;
  description: string;
  link: string;
  image_url?: string;
  created_at?: string;
  user_id?: string;
}

export async function uploadImage(file: File, userId: string): Promise<{
  url: string | null;
  error: string | null;
}> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("project-files")
      .upload(filePath, file);

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from("project-files")
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error.message : "Image upload failed",
    };
  }
}

export async function addProject(project: Project): Promise<{
  project: Project | null;
  error: string | null;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { project: null, error: "User not authenticated. Please login first." };
    }

    // Only send the fields that exist in the database
    const projectData: any = {
      title: project.title,
      category: project.category,
      description: project.description,
      link: project.link,
      user_id: user.id,
    };

    if (project.image_url) {
      projectData.image_url = project.image_url;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([projectData])
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return { 
        project: null, 
        error: `Failed to add project: ${error.message}` 
      };
    }

    return { project: data, error: null };
  } catch (error) {
    console.error("Catch error:", error);
    return {
      project: null,
      error: error instanceof Error ? error.message : "Failed to add project",
    };
  }
}

export async function getProjects(): Promise<{
  projects: Project[];
  error: string | null;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { projects: [], error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return { projects: [], error: error.message };
    }

    return { projects: data || [], error: null };
  } catch (error) {
    return {
      projects: [],
      error: error instanceof Error ? error.message : "Failed to fetch projects",
    };
  }
}

export async function deleteProject(projectId: string): Promise<{
  error: string | null;
}> {
  try {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete project",
    };
  }
}
