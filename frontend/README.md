# google-oauth-mvp

Vite + React MVP skeleton sa Google OAuth login flow-om.

## Arhitektura

```
src/
  assets/            staticne slike/ikonice
  components/
    Navbar.jsx        prikazuje ulogovanog usera + logout
    ProtectedRoute.jsx cuva rute koje traze prijavu
  context/
    AuthContext.jsx    globalno stanje: user, isAuthenticated, login/logout
  config/
    env.js             cita .env varijable na jednom mjestu
  pages/
    Login.jsx          Google login dugme
    Dashboard.jsx       prva zasticena stranica (ovdje ide pravi sadrzaj)
    NotFound.jsx        404
  routes/
    AppRoutes.jsx       sve rute definisane na jednom mjestu
  services/
    api.js              fetch wrapper - base URL + Authorization header
    auth.service.js      logika login/logout, cuvanje tokena i usera
  App.jsx               sastavlja providere (Google, Auth, Router)
  main.jsx               entry point
  index.css              globalni stilovi
```

**Princip:** `pages` su "glupe" (samo prikaz + pozivi na context/servise), `services` sadrze logiku komunikacije sa backend-om, `context` drzi globalno stanje, `routes` i `components/ProtectedRoute` rjesavaju ko sta vidi.

## Kako radi login flow (verzija bez posebnog backend tokena)

1. Korisnik klikne na Google dugme (`Login.jsx`, biblioteka `@react-oauth/google`).
2. Google vrati **ID token** (JWT) na frontend - to je `credentialResponse.credential`.
3. Frontend salje taj token na backend: `POST /auth/google { credential }` (`auth.service.js`).
4. **Backend** (taj dio tek treba napraviti) verifikuje token kod Googla (servisom `google-auth-library` ili slicnim), po potrebi upise/pronade usera u bazi, i vrati **samo** `{ user }` - bez svog tokena.
5. Frontend **sam idToken** cuva u `localStorage` i kaci ga kao `Authorization: Bearer <idToken>` na svaki sledeci zahtjev (`api.js`). idToken je ovdje jedini token, nema posebnog backend JWT-a.
6. `AuthContext` drzi usera u memoriji; `ProtectedRoute` redirektuje na `/login` ako nema sesije.

Bitno - tradeoff ove verzije:
- **Jednostavnije** - backend ne mora da izdaje/cuva svoj JWT secret ni session logiku.
- **Backend mora verifikovati idToken na SVAKOM zahtjevu** (ne samo pri loginu), sto je malo sporije po requestu nego provjera sopstvenog JWT-a.
- **idToken vazi ~1h** (Google ga tako izdaje) - poslije toga backend vraca 401 i korisnik se mora ponovo ulogovati. Nema refresh mehanizma u ovoj verziji - ako kasnije zatreba duza sesija, to je mjesto gdje bi se prvo dodao backend-ov sopstveni token.

## Podesavanje

```bash
npm install
cp .env.example .env
```

U `.env` upisi:

```
VITE_GOOGLE_CLIENT_ID=...
VITE_API_BASE_URL=http://localhost:4000/api
```

### Google Cloud Console (5 min)

1. https://console.cloud.google.com/ -> napravi (ili izaberi) projekat.
2. **APIs & Services -> OAuth consent screen** -> podesi tip (External za javnu app), naziv app-a, mail.
3. **APIs & Services -> Credentials -> Create Credentials -> OAuth client ID** -> tip **Web application**.
4. Pod **Authorized JavaScript origins** dodaj: `http://localhost:5173` (i kasnije tvoj produkcioni domen).
5. Kopiraj **Client ID** u `.env` kao `VITE_GOOGLE_CLIENT_ID`.

### Pokretanje

```bash
npm run dev
```

App radi na `http://localhost:5173`. Login ce raditi (Google dio), ali poziv `/auth/google` ce pucati dok ne napravis backend - to je sljedeci korak.

## Sta dalje (sljedeci koraci)

1. **Backend endpoint `/auth/google`** - najmanji moguci backend (npr. Node + Express):
   - primi `credential` (idToken)
   - verifikuje ga preko `google-auth-library` (`OAuth2Client.verifyIdToken`) - **ovo mora da se radi na SVAKOM zahtjevu**, ne samo pri loginu
   - pronade ili kreira usera u bazi (email, ime, slika iz tokena)
   - vrati **samo** `{ user }` - nema sopstvenog tokena
2. **Middleware na backendu** koji cita `Authorization: Bearer <idToken>` header, verifikuje ga kod Googla (isto kao u koraku 1) i ubacuje `req.user` - ovaj middleware se poziva na svakoj zasticenoj ruti, ne samo na `/auth/google`.
3. **Baza** - i najmanji MVP treba minimalno tabelu/kolekciju `users` (id, email, name, picture, googleId, createdAt).
4. **Istek sesije** - idToken vazi ~1h, poslije toga 401 i ponovni login. Ako kasnije zatreba duza sesija, prvo razmisli o tome da backend ipak izda svoj JWT (ovo trenutno NIJE implementirano, namjerna odluka za jednostavnost MVP-a).
5. **Deploy** - frontend na Vercel/Netlify, backend na Render/Railway/VPS; azuriraj Authorized origins u Google Console i `VITE_API_BASE_URL`.
6. **Dodavanje novih zasticenih stranica** - dodajes novu `<Route>` unutar `ProtectedLayout` bloka u `AppRoutes.jsx`, ProtectedRoute se brine za ostalo.

Ako zelis, mogu u sljedecem koraku napraviti i taj minimalni backend (npr. Express + verifikacija idToken-a na svakom zahtjevu, bez sopstvenog JWT-a) da imas kompletan login flow od dugmeta do baze.
