import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Role } from "@mechconnect/core";
import type { LooseDatabase } from "./database";
import { getPublicSupabaseEnv } from "./env";
import { getServiceSupabase } from "./server";

export type AuthProfile = {
  id: string;
  role: Role;
  full_name: string;
  phone: string;
  email: string | null;
  is_active: boolean;
};

export type AuthContext = {
  userId: string;
  email: string | undefined;
  profile: AuthProfile;
};

let authClient: SupabaseClient<LooseDatabase> | null = null;

function getAuthSupabase() {
  if (!authClient) {
    const { url, anonKey } = getPublicSupabaseEnv();
    authClient = createClient<LooseDatabase>(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return authClient;
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function requireAuth(request: Request, allowedRoles?: Role[]): Promise<AuthContext> {
  const token = getBearerToken(request);
  if (!token) {
    throw new Response(JSON.stringify({ error: "Missing bearer token" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }

  const { data: userData, error: userError } = await getAuthSupabase().auth.getUser(token);
  if (userError || !userData.user) {
    throw new Response(JSON.stringify({ error: "Invalid or expired session" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }

  const { data: profile, error: profileError } = await getServiceSupabase()
    .from("profiles")
    .select("id, role, full_name, phone, email, is_active")
    .eq("id", userData.user.id)
    .single<AuthProfile>();

  if (profileError || !profile || !profile.is_active) {
    throw new Response(JSON.stringify({ error: "Profile is missing or inactive" }), {
      status: 403,
      headers: { "content-type": "application/json" }
    });
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    throw new Response(JSON.stringify({ error: "Insufficient role permission" }), {
      status: 403,
      headers: { "content-type": "application/json" }
    });
  }

  return {
    userId: userData.user.id,
    email: userData.user.email,
    profile
  };
}

export function isResponseError(error: unknown): error is Response {
  return error instanceof Response;
}
