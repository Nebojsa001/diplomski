import { jwtDecode } from "jwt-decode";
import { api } from "./api";

const USER_KEY = "app_user";

export async function register({
  firstName,
  lastName,
  email,
  password,
  passwordConfirm,
}) {
  const data = await api.post(
    "/users/register",
    { firstName, lastName, email, password, passwordConfirm },
    { auth: false },
  );

  api.setToken(data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data.user;
}

export async function login({ email, password }) {
  const data = await api.post(
    "/users/login",
    { email, password },
    { auth: false },
  );

  api.setToken(data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data.user;
}

export async function loginWithGoogle(credential) {
  // Backend endpoint: POST /users/google-login { credential }
  // Verifikuje Google ID token, pronalazi/kreira korisnika preko emaila
  // i vraca NAS app token: { token, user }
  const data = await api.post(
    "/users/google-login",
    { credential },
    { auth: false },
  );

  api.setToken(data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data.user;
}

export function logout() {
  api.setToken(null);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  const token = api.getToken();
  if (!token) return false;

  // Nas JWT nosi "exp" (unix timestamp) - lokalno provjeravamo da li je istekao
  // da ne pokazujemo "ulogovan" state uzivo dok backend ne odbije zahtjev.
  // Ovo je samo UX provjera, ne zamjenjuje verifikaciju na backendu.
  const decoded = decodeToken(token);
  if (!decoded?.exp) return false;

  const isExpired = decoded.exp * 1000 < Date.now();
  if (isExpired) {
    logout();
    return false;
  }

  return true;
}

export function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}
