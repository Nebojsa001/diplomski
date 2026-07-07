import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  getMyAppointments,
  getAppointments,
  createAppointment,
  cancelAppointment,
} from "@/services/appointments.service";

const TODAY = new Date().toISOString().split("T")[0];

const TITLES = [
  "Kontrolni pregled",
  "Specijalistički pregled",
  "Laboratorija",
  "Ultrazvuk",
  "Rendgen",
];

const TIME_SLOTS = [
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

const getStatusStyle = (status) => {
  if (status === "Completed") {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (status === "Cancelled") {
    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  return {
    background: "#fef3c7",
    color: "#92400e",
  };
};

function isTimeInPast(date, time) {
  const now = new Date();

  const [hours, minutes] = time.split(":").map(Number);

  const slotDate = new Date(date);
  slotDate.setHours(hours);
  slotDate.setMinutes(minutes);
  slotDate.setSeconds(0);
  slotDate.setMilliseconds(0);

  return slotDate <= now;
}

function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date)) return "";

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

export default function UserProfile() {
  const { user } = useAuth();

  const isMobile = window.innerWidth < 768;

  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState(TODAY);

  const [showForm, setShowForm] = useState(false);

  const [formTitle, setFormTitle] = useState(TITLES[0]);
  const [formDate, setFormDate] = useState(TODAY);
  const [formTime, setFormTime] = useState(TIME_SLOTS[0]);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [cancellingId, setCancellingId] = useState(null);

  async function loadAllAppointments(date) {
    setIsLoading(true);
    setError("");

    try {
      const res = await getAppointments(date);
      const data = res.data ?? res;

      setAllAppointments(
        data
          .filter((a) => a.status == "Waiting")
          .map((a) => ({
            id: a.id,
            title: a.title ?? "Pregled",
            status: a.status ?? "Waiting",
            date: new Date(a.date),
            user: a.user,
          })),
      );
    } catch (err) {
      setError(err.message || "Greška pri učitavanju svih termina.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAppointments(date) {
    setIsLoading(true);
    setError("");

    try {
      const res = await getMyAppointments(date);
      const data = res.data ?? res;

      setAppointments(
        data.map((a) => ({
          id: a.id,
          title: a.title ?? "Pregled",
          status: a.status ?? "Waiting",
          date: new Date(a.date),
        })),
      );
    } catch (err) {
      setError(err.message || "Greška pri učitavanju.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments(selectedDate);
    loadAllAppointments(selectedDate);
  }, [selectedDate]);

  const takenTimes = allAppointments.map((a) => {
    const hh = String(a.date.getHours()).padStart(2, "0");
    const min = String(a.date.getMinutes()).padStart(2, "0");

    return `${hh}:${min}`;
  });

  const availableSlots = TIME_SLOTS.filter(
    (time) => !takenTimes.includes(time) && !isTimeInPast(formDate, time),
  );

  useEffect(() => {
    if (!availableSlots.includes(formTime)) {
      setFormTime(availableSlots[0] || "");
    }
  }, [formDate, allAppointments]);

  async function handleCreate() {
    if (!formTime) {
      setFormError("Nema slobodnih termina za izabrani datum.");
      return;
    }

    setFormError("");
    setFormSuccess("");
    setFormLoading(true);

    try {
      const isoDate = `${formDate}T${formTime}:00.000`;

      await createAppointment({
        title: formTitle,
        date: isoDate,
      });

      setFormSuccess("Termin je uspješno zakazan!");

      setShowForm(false);

      await loadAllAppointments(selectedDate);
      await loadAppointments(selectedDate);
    } catch (err) {
      setFormError(err.message || "Greška pri zakazivanju.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleCancel(id) {
    setCancellingId(id);

    try {
      await cancelAppointment(id);

      setAppointments((prev) => prev.filter((a) => a.id !== id));

      await loadAllAppointments(selectedDate);
    } catch (err) {
      setError(err.message || "Greška pri otkazivanju.");
    } finally {
      setCancellingId(null);
    }
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f1f5f9",
      padding: isMobile ? "16px" : "32px",
      color: "#0f172a",
      fontFamily: "Inter, system-ui, sans-serif",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
      flexWrap: "wrap",
      gap: "16px",
    },

    title: {
      margin: 0,
      fontSize: isMobile ? "22px" : "28px",
      fontWeight: 700,
    },

    userCard: {
      background: "#fff",
      padding: "16px 22px",
      borderRadius: "16px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
    },

    card: {
      background: "#fff",
      borderRadius: "20px",
      padding: "24px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      marginBottom: "24px",
    },

    cardTitle: {
      margin: "0 0 20px",
      fontWeight: 700,
      fontSize: "18px",
      color: "#0f172a",
    },

    row: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexWrap: "wrap",
      marginBottom: "16px",
    },

    input: {
      padding: "10px 14px",
      borderRadius: "10px",
      border: "1px solid #cbd5e1",
      outline: "none",
      fontSize: "14px",
    },

    select: {
      padding: "10px 14px",
      borderRadius: "10px",
      border: "1px solid #cbd5e1",
      outline: "none",
      fontSize: "14px",
      background: "#fff",
    },

    btn: {
      padding: "10px 18px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "14px",
    },

    primaryBtn: {
      background: "#2563eb",
      color: "#fff",
    },

    dangerBtn: {
      background: "#ef4444",
      color: "#fff",
    },

    successBtn: {
      background: "#22c55e",
      color: "#fff",
    },

    ghostBtn: {
      background: "#e2e8f0",
      color: "#334155",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
    },

    th: {
      background: "#2563eb",
      color: "#fff",
      padding: "14px 16px",
      textAlign: "left",
      fontWeight: 600,
    },

    td: {
      padding: "14px 16px",
      borderBottom: "1px solid #e2e8f0",
      color: "#0f172a",
    },

    badge: {
      padding: "5px 12px",
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: 600,
      display: "inline-block",
      background: "#fef3c7",
      color: "#92400e",
    },

    slotGrid: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
    },

    slotFree: {
      padding: "8px 14px",
      borderRadius: "10px",
      background: "#dcfce7",
      color: "#166534",
      fontWeight: 600,
      fontSize: "14px",
    },

    slotTaken: {
      padding: "8px 14px",
      borderRadius: "10px",
      background: "#fee2e2",
      color: "#991b1b",
      fontWeight: 600,
      fontSize: "14px",
    },

    centerState: {
      padding: "30px",
      textAlign: "center",
      color: "#64748b",
    },

    errorText: {
      color: "#ef4444",
      fontSize: "14px",
      marginTop: "8px",
    },

    successText: {
      color: "#22c55e",
      fontSize: "14px",
      marginTop: "8px",
    },

    mobileCard: {
      background: "#f8fafc",
      borderRadius: "14px",
      padding: "16px",
      marginBottom: "12px",
      border: "1px solid #e2e8f0",
    },
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Moj profil</h1>

          <div
            style={{
              color: "#64748b",
              marginTop: "4px",
            }}
          >
            Upravljanje terminima
          </div>
        </div>

        <div style={styles.userCard}>
          <div
            style={{
              color: "#64748b",
              marginBottom: 4,
              fontSize: "13px",
            }}
          >
            Prijavljen korisnik
          </div>

          <strong>
            {user?.firstName} {user?.lastName}
          </strong>

          <div
            style={{
              color: "#64748b",
              fontSize: "13px",
              marginTop: "2px",
            }}
          >
            {user?.email}
          </div>
        </div>
      </div>

      {/* TERMINI */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Termini</h2>

        <div style={styles.row}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Filtriraj po datumu
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.input}
            />
          </div>

          {selectedDate !== TODAY && (
            <button
              onClick={() => setSelectedDate(TODAY)}
              style={{
                ...styles.btn,
                ...styles.ghostBtn,
                alignSelf: "flex-end",
              }}
            >
              Reset na danas
            </button>
          )}

          <button
            onClick={() => {
              setShowForm(!showForm);
              setFormError("");
              setFormSuccess("");
            }}
            style={{
              ...styles.btn,
              ...styles.primaryBtn,
              alignSelf: "flex-end",
            }}
          >
            {showForm ? "Zatvori" : "+ Zakaži termin"}
          </button>
        </div>

        {/* FORMA ZA ZAKAZIVANJE */}
        {showForm && (
          <div
            style={{
              background: "#f8fafc",
              borderRadius: "14px",
              padding: "20px",
              marginBottom: "20px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px",
                fontWeight: 700,
              }}
            >
              Novi termin
            </h3>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Vrsta pregleda
                </label>

                <select
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={styles.select}
                >
                  {TITLES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Datum
                </label>

                <input
                  type="date"
                  value={formDate}
                  min={TODAY}
                  onChange={(e) => setFormDate(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Vrijeme
                </label>

                <select
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  style={styles.select}
                >
                  {availableSlots.length === 0 ? (
                    <option value="">Nema slobodnih termina</option>
                  ) : (
                    availableSlots.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button
                onClick={handleCreate}
                disabled={formLoading}
                style={{
                  ...styles.btn,
                  ...styles.successBtn,
                  alignSelf: "flex-end",
                  opacity: formLoading ? 0.7 : 1,
                }}
              >
                {formLoading ? "Zakazujem..." : "Potvrdi"}
              </button>
            </div>

            {formError && <div style={styles.errorText}>{formError}</div>}

            {formSuccess && <div style={styles.successText}>{formSuccess}</div>}
          </div>
        )}

        {/* LISTA MOJIH TERMINA */}

        {isLoading ? (
          <div style={styles.centerState}>Učitavanje...</div>
        ) : error ? (
          <div style={styles.centerState}>{error}</div>
        ) : appointments.length === 0 ? (
          <div style={styles.centerState}>Nema termina za odabrani datum.</div>
        ) : isMobile ? (
          <div>
            {appointments.map((a) => (
              <div key={a.id} style={styles.mobileCard}>
                <strong>{a.title}</strong>

                <div
                  style={{
                    marginTop: 6,
                    color: "#64748b",
                  }}
                >
                  {formatDate(a.date)}
                </div>

                <div
                  style={{
                    marginTop: 8,
                  }}
                >
                  <span
                    style={{
                      ...styles.badge,
                      ...getStatusStyle(a.status),
                    }}
                  >
                    {a.status}
                  </span>
                </div>

                {a.status == "Waiting" && (
                  <button
                    onClick={() => handleCancel(a.id)}
                    disabled={cancellingId === a.id}
                    style={{
                      ...styles.btn,
                      ...styles.dangerBtn,
                      marginTop: "12px",
                      fontSize: "12px",
                      padding: "6px 12px",
                      opacity: cancellingId === a.id ? 0.6 : 1,
                    }}
                  >
                    {cancellingId === a.id ? "Otkazujem..." : "Otkaži"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>

                <th style={styles.th}>Vrsta pregleda</th>

                <th style={styles.th}>Datum i vrijeme</th>

                <th style={styles.th}>Status</th>

                <th style={styles.th}>Akcija</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((a, i) => (
                <tr
                  key={a.id}
                  style={{
                    background: i % 2 === 0 ? "#fff" : "#f8fafc",
                  }}
                >
                  <td style={styles.td}>#{a.id}</td>

                  <td style={styles.td}>{a.title}</td>

                  <td style={styles.td}>{formatDate(a.date)}</td>

                  <td style={styles.td}>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          ...getStatusStyle(a.status),
                        }}
                      >
                        {a.status}
                      </span>
                    </td>
                  </td>

                  <td style={styles.td}>
                    {a.status == "Waiting" && (
                      <button
                        onClick={() => handleCancel(a.id)}
                        disabled={cancellingId === a.id}
                        style={{
                          ...styles.btn,
                          ...styles.dangerBtn,
                          padding: "6px 12px",
                          fontSize: "12px",
                          opacity: cancellingId === a.id ? 0.6 : 1,
                        }}
                      >
                        {cancellingId === a.id ? "Otkazujem..." : "Otkaži"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* SLOBODNI TERMINI */}

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>
          Slobodni termini —{" "}
          {selectedDate
            ? new Date(selectedDate).toLocaleDateString("bs-BA")
            : "danas"}
        </h2>

        {isLoading ? (
          <div style={styles.centerState}>Učitavanje...</div>
        ) : (
          <div style={styles.slotGrid}>
            {TIME_SLOTS.map((t) => {
              const taken = takenTimes.includes(t);
              const past = isTimeInPast(selectedDate, t);

              return (
                <span
                  key={t}
                  style={taken || past ? styles.slotTaken : styles.slotFree}
                >
                  {t} {taken || past ? "✗" : "✓"}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
