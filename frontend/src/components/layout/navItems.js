// Konfiguracija stavki navigacije po roli korisnika.
// Ruta ostaje ista kao i do sada (npr. "/" i "/doctor-dashboard"),
// mijenja se samo naziv koji se prikazuje u navigaciji.

export const patientNavItems = [
  {
    to: "/",
    label: "Rezerviši",
    end: true,
    icon: "calendar",
  },
  {
    to: "/reports",
    label: "Izvještaji",
    icon: "report",
  },
];

export const doctorNavItems = [
  {
    to: "/doctor-dashboard",
    label: "Čekaonica",
    icon: "waiting-room",
  },
  {
    to: "/doctor-reports",
    label: "Izvještaji",
    icon: "report",
  },
];

export function getNavItemsForRole(role) {
  if (role === "doctor") return doctorNavItems;
  return patientNavItems;
}
