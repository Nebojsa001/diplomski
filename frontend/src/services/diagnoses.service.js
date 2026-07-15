import { api } from "./api";

// Kompletan MKB-10 šifarnik (npr. učitavanje pri otvaranju forme)
export function getDiagnoses() {
  return api.get("/diagnoses");
}

// Pretraga po šifri/nazivu za autocomplete
export function searchDiagnoses(q) {
  return api.get("/diagnoses/search", { params: { q } });
}
