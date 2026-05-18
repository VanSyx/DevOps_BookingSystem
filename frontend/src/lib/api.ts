const PRODUCTION_API_BASE = "https://booking-backend-1g8f.onrender.com/api";

function getApiBase() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  if (
    typeof window !== "undefined" &&
    window.location.hostname === "booking-frontend-igsg.onrender.com"
  ) {
    return PRODUCTION_API_BASE;
  }

  return "/api";
}

export const API_BASE = getApiBase();

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    let message = "";
    if (contentType.includes("application/json")) {
      const payload = (await res.json()) as { message?: string; error?: string };
      message = payload.message || payload.error || "";
    } else {
      message = await res.text();
    }
    throw new Error(message || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}
