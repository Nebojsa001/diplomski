// Centralno mjesto za sve env varijable.
// Ako neka nedostaje, pucamo odmah u konzoli da se ne lovi greska kasnije po app-u.

const required = (key, value) => {
  if (!value) {
    console.warn(`[config] Nedostaje env varijabla: ${key}. Provjeri .env fajl.`)
  }
  return value
}

export const env = {
  googleClientId: required('VITE_GOOGLE_CLIENT_ID', import.meta.env.VITE_GOOGLE_CLIENT_ID),
  apiBaseUrl: required('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),
}
