import { api } from "./api";

// Lista svih korisnika (opcionalno filtrirano po roli) - koristi doktor za "Korisnici" sekciju
export function getUsers(role) {
  const params = role ? { role } : undefined;
  return api.get("/users", { params });
}

// Lista doktora - koristi se za prikaz imena doktora u izvještajima
export function getDoctors() {
  return api.get("/users/doctors");
}
