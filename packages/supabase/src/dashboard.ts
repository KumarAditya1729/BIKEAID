import { getServiceSupabase } from "./server";

export type DashboardResult<T> = {
  data: T;
  error: string | null;
};

export async function readDashboardData<T>(fallback: T, loader: () => Promise<T>): Promise<DashboardResult<T>> {
  try {
    return { data: await loader(), error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load dashboard data";
    return { data: fallback, error: message };
  }
}

export function serviceClient() {
  return getServiceSupabase();
}
