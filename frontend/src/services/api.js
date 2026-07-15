import { env } from "@/config/env";

const TOKEN_KEY = "app_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function buildUrl(path, params) {
  if (!params) return `${env.apiBaseUrl}${path}`;

  // Preskacemo undefined/null/prazne vrijednosti da ne saljemo npr. ?date= bez vrijednosti
  const query = Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");

  return query
    ? `${env.apiBaseUrl}${path}?${query}`
    : `${env.apiBaseUrl}${path}`;
}

async function request(
  path,
  { method = "GET", body, headers = {}, auth = true, params } = {},
) {
  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(buildUrl(path, params), {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    // Token (idToken) istekao ili nevazeci - cistimo cijelu sesiju.
    // 'app_user' je ovdje hardkodiran namjerno (mora odgovarati USER_KEY iz auth.service.js)
    // da bismo izbjegli kruzni import; ako mijenjas to ime, izmijeni i ovdje.
    setToken(null);
    localStorage.removeItem("app_user");
    // Obavjestavamo AuthContext da odmah azurira React state (ne samo localStorage)
    window.dispatchEvent(new Event("auth:expired"));
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // odgovor moze biti i bez body-ja (npr. 204)
  }

  if (!res.ok) {
    const message =
      data?.message || `Greska na zahtjevu (status ${res.status})`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  getToken,
  setToken,
};
