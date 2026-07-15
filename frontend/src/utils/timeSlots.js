// Radno vrijeme ambulante: 08:00 - 15:30, slotovi na svakih 30 minuta.
// Ista lista koja se koristi za redovno zakazivanje (UserProfile.jsx),
// sada podijeljena i sa formom za kontrolni pregled (ExamForm.jsx).
export const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
];

export function isTimeInPast(dateStr, time) {
  if (!dateStr || !time) return false;

  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);

  const slotDate = new Date(dateStr);
  slotDate.setHours(hours, minutes, 0, 0);

  return slotDate <= now;
}

// Pretvara ("2026-08-01", "09:30") u ISO datum-vrijeme string.
export function slotToIsoString(dateStr, time) {
  return new Date(`${dateStr}T${time}:00`).toISOString();
}
