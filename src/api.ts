const API_BASE = process.env.REACT_APP_API_BASE ?? "";

// api.ts (what I recommended)
export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...(init?.headers || {}) },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `HTTP ${res.status} ${res.statusText} — ${text.slice(0, 120)}`
    );
  }
  return res;
}
