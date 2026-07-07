import { jwtDecode } from "jwt-decode";
import { api } from "./api";

const USER_KEY = "app_user";

/**
 * Flow (verzija bez posebnog backend tokena):
 * 1. Frontend dobije Google ID token (credential) od @react-oauth/google
 * 2. Saljemo ga backend-u SAMO da ga verifikuje i upise/pronade usera u bazi
 *    (backend provjerava potpis kod Googla preko google-auth-library)
 * 3. Backend vraca SAMO { user }, NE vraca svoj token
 * 4. Frontend cuva sam credential (idToken) kao jedini token i njega salje
 *    kao Authorization header na svaki sledeci zahtjev
 *
 * VAZNO: idToken obicno vazi ~1h (Google ga tako izdaje). Nakon isteka,
 * backend ce odbijati zahtjeve (401) i korisnik se mora ponovo ulogovati -
 * nema "refresh" mehanizma u ovoj verziji, to je svjesni tradeoff za MVP.
 */
export async function loginWithGoogle(credential) {
  // Backend endpoint koji treba da postoji: POST /auth/google { credential }
  // On SAMO verifikuje token i vraca { user: { id, name, email, picture } }
  const data = await api.post("/users/login", { credential }, { auth: false });

  // idToken je ovdje nas jedini "session token"
  api.setToken(credential);
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

  // idToken nosi "exp" (unix timestamp) - mozemo lokalno provjeriti da li je
  // istekao da ne pokazujemo "ulogovan" state uzivo dok backend ne odbije zahtjev.
  // Ovo je samo UX provjera, ne zamjenjuje verifikaciju na backendu.
  const decoded = decodeGoogleCredential(token);
  if (!decoded?.exp) return false;

  const isExpired = decoded.exp * 1000 < Date.now();
  if (isExpired) {
    logout();
    return false;
  }

  return true;
}

export function decodeGoogleCredential(credential) {
  try {
    return jwtDecode(credential);
  } catch {
    return null;
  }
}
