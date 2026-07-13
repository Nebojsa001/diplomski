import { api } from "./api";

export function getAppointments(date, extraParams) {
  const params = date ? { date, ...extraParams } : extraParams;

  console.log("API PARAMS:", params);

  return api.get("/appointments", { params });
}

export function getMyAppointments(date, extraParams) {
  const params = date ? { date, ...extraParams } : extraParams;
  return api.get("/appointments/my", { params });
}

// Istorija/izvještaji - filtriranje po opsegu datuma i statusu (npr. Completed)
export function getMyAppointmentsInRange({ from, to, status } = {}) {
  return api.get("/appointments/my", { params: { from, to, status } });
}

export function getAppointmentsInRange({ from, to, status, userId } = {}) {
  return api.get("/appointments", { params: { from, to, status, userId } });
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
