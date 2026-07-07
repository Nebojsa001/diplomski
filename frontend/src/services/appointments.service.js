import { api } from "./api";

export function getAppointments(date) {
  const params = date ? { date } : undefined;

  console.log("API PARAMS:", params);

  return api.get("/appointments", { params });
}

export function getMyAppointments(date) {
  const params = date ? { date } : undefined;
  return api.get("/appointments/my", { params });
}

export function getAppointment(id) {
  return api.get(`/appointments/${id}`);
}

export function createAppointment(payload) {
  return api.post("/appointments", payload);
}

export function updateAppointment(id, payload) {
  return api.put(`/appointments/${id}`, payload);
}

export function deleteAppointment(id) {
  return api.delete(`/appointments/${id}`);
}

export function cancelAppointment(id) {
  return api.patch(`/appointments/${id}/cancel`);
}

export function acceptAppointment(id) {
  return api.patch(`/appointments/${id}/accept`);
}
