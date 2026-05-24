import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv, getServiceRoleKey } from "./env";

let serviceClient: ReturnType<typeof createClient> | null = null;

export function getServiceSupabase() {
  if (!serviceClient) {
    const { url } = getPublicSupabaseEnv();
    serviceClient = createClient(url, getServiceRoleKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return serviceClient;
}
