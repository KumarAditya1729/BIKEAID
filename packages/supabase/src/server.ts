import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { LooseDatabase } from "./database";
import { getPublicSupabaseEnv, getServiceRoleKey } from "./env";

let serviceClient: SupabaseClient<LooseDatabase> | null = null;

export function getServiceSupabase() {
  if (!serviceClient) {
    const { url } = getPublicSupabaseEnv();
    serviceClient = createClient<LooseDatabase>(url, getServiceRoleKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return serviceClient;
}
