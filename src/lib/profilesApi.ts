import { supabase } from "./supabase";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  locale: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, locale")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error loading profile:", error.message);
    return null;
  }

  return data;
}

export async function updateProfileLocale(userId: string, locale: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ locale, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}
