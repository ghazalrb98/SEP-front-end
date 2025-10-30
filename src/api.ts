const API_BASE = process.env.REACT_APP_API_BASE ?? "";

export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...(init?.headers || {}) },
    ...init,
  });

  return res;
}
