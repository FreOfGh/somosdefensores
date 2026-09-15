export function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = window.localStorage.getItem("revisor_token");
  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers,
  });
}