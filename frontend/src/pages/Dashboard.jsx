import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
  getAppointments,
  acceptAppointment,
  cancelAppointment,
} from "@/services/appointments.service";

export default function Dashboard() {
  const { user } = useAuth();

  const isDoctor = user?.role === "doctor";

  const today = new Date();

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);

        const res = await getAppointments(selectedDate);
        const data = res.data;

        if (!isMounted) return;

        const normalized = data.map((a) => ({
          id: a.id,
          title: a.title ?? a.type ?? "Pregled",
          patient: a.user
            ? `${a.user.firstName} ${a.user.lastName}`
            : `Pacijent ${a.id}`,
          date: new Date(a.date),
          status: a.status ?? "Waiting",
        }));

        setAppointments(normalized);
      } catch (err) {
        if (isMounted)
          setError(err.message || "Greška pri učitavanju termina.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const isMobile = window.innerWidth < 768;

  const activeAppointments = appointments.length;

  const todayAppointments = appointments.filter(
    (appointment) =>
      new Date(appointment.date).toDateString() === today.toDateString(),
  );

  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.date > today,
  );

  const freeSlots = Math.max(0, 16 - activeAppointments);

  const acceptPatient = async (id) => {
    try {
      await acceptAppointment(id);

      // ukloni termin iz liste nakon prijema pacijenta
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      setError("Greška pri prihvatanju termina.");
    }
  };

  const removeAppointment = async (id) => {
    try {
      await cancelAppointment(id);

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Cancelled" } : a)),
      );
    } catch (err) {
      console.error(err);
      setError("Greška pri otkazivanju termina.");
    }
  };

  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
  };

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
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "flex-start" : "center",
      gap: "20px",
      marginBottom: "30px",
    },

    hospitalInfo: {
      display: "flex",
      alignItems: "center",
      gap: "18px",
    },

    logo: {
      width: isMobile ? "60px" : "80px",
      height: isMobile ? "60px" : "80px",
      borderRadius: "16px",
      objectFit: "cover",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    },

    title: {
      margin: 0,
      fontSize: isMobile ? "22px" : "30px",
      fontWeight: 700,
      color: "#0f172a",
    },

    subtitle: {
      marginTop: "6px",
      color: "#64748b",
    },

    userCard: {
      background: "#fff",
      padding: "16px 22px",
      borderRadius: "16px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit,minmax(220px,1fr))",
      gap: "20px",
      marginBottom: "30px",
    },

    statCard: {
      background: "#fff",
      padding: "24px",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    },

    statNumber: {
      fontSize: "38px",
      fontWeight: 700,
      color: "#2563eb",
      margin: 0,
    },

    statText: {
      marginTop: "8px",
      color: "#334155",
      fontWeight: 500,
    },

    tableCard: {
      background: "#fff",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 15px 40px rgba(0,0,0,0.06)",
    },

    tableHeader: {
      padding: "24px",
      borderBottom: "1px solid #e2e8f0",
    },

    tableTitle: {
      margin: 0,
      color: "#0f172a",
      fontWeight: 700,
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
    },

    th: {
      background: "#2563eb",
      color: "#fff",
      padding: "16px",
      textAlign: "left",
      fontWeight: 600,
    },

    td: {
      padding: "16px",
      color: "#0f172a",
      borderBottom: "1px solid #e2e8f0",
    },

    badge: {
      background: "#fef3c7",
      color: "#92400e",
      padding: "6px 12px",
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: 600,
      display: "inline-block",
    },

    btn: {
      padding: "6px 10px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 600,
      marginRight: "6px",
    },

    acceptBtn: {
      background: "#22c55e",
      color: "white",
    },

    deleteBtn: {
      background: "#ef4444",
      color: "white",
    },

    mobileCard: {
      background: "#fff",
      borderRadius: "18px",
      padding: "16px",
      marginBottom: "12px",
      boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
    },

    centerState: {
      padding: "40px",
      textAlign: "center",
      color: "#64748b",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.hospitalInfo}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6f/%D0%A3%D0%9A%D0%A6_%D0%A0%D0%A1.jpg"
            alt="UKC RS"
            style={styles.logo}
          />

          <div>
            <h1 style={styles.title}>UKC Republike Srpske</h1>

            <div style={styles.subtitle}>
              Sistem za upravljanje rezervacijama
            </div>
          </div>
        </div>

        <div style={styles.userCard}>
          <div style={{ color: "#64748b", marginBottom: 4 }}>
            {isDoctor ? "Prijavljen: doktor" : "Prijavljen: korisnik"}
          </div>

          <strong>
            {user?.firstName || "Doktor"} {user?.lastName}
          </strong>
        </div>
      </div>

      {/* STATS */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h2 style={styles.statNumber}>{activeAppointments}</h2>
          <div style={styles.statText}>Aktivnih rezervacija</div>
        </div>

        <div style={styles.statCard}>
          <h2 style={styles.statNumber}>{todayAppointments.length}</h2>
          <div style={styles.statText}>Današnjih pregleda</div>
        </div>

        <div style={styles.statCard}>
          <h2 style={styles.statNumber}>{upcomingAppointments.length}</h2>
          <div style={styles.statText}>Predstojećih pregleda</div>
        </div>

        {/* <div style={styles.statCard}>
          <h2 style={styles.statNumber}>{freeSlots}</h2>
          <div style={styles.statText}>Slobodnih termina</div>
        </div> */}
      </div>
      {/*select date*/}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          Filtriraj po datumu
        </label>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            outline: "none",
          }}
        />

        {selectedDate && (
          <button
            onClick={() => setSelectedDate("")}
            style={{
              marginLeft: 10,
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              background: "#ef4444",
              color: "white",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* TABLE */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Rezervacije na čekanju</h2>
        </div>

        {isLoading ? (
          <div style={styles.centerState}>Učitavanje termina...</div>
        ) : error ? (
          <div style={styles.centerState}>{error}</div>
        ) : appointments.length === 0 ? (
          <div style={styles.centerState}>Nema termina.</div>
        ) : isMobile ? (
          <div style={{ padding: 16 }}>
            {appointments.map((a) => (
              <div key={a.id} style={styles.mobileCard}>
                <strong>{a.patient}</strong>

                <div style={{ marginTop: 6 }}>{a.title}</div>

                <div style={{ marginTop: 6, color: "#64748b" }}>
                  {a.date.toLocaleString("bs-BA")}
                </div>

                <div style={{ marginTop: 10 }}>
                  <span style={styles.badge}>Na čekanju</span>
                </div>

                {isDoctor && (
                  <div style={{ marginTop: 10 }}>
                    <button
                      style={{ ...styles.btn, ...styles.acceptBtn }}
                      onClick={() => acceptPatient(a.id)}
                    >
                      Primi
                    </button>

                    <button
                      style={{ ...styles.btn, ...styles.deleteBtn }}
                      onClick={() => removeAppointment(a.id)}
                    >
                      Ukloni
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID-pacijenta</th>
                <th style={styles.th}>Pacijent</th>
                <th style={styles.th}>Pregled</th>
                <th style={styles.th}>Datum</th>
                <th style={styles.th}>Status</th>
                {isDoctor && <th style={styles.th}>Akcije</th>}
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
                  <td style={styles.td}>{a.patient}</td>
                  <td style={styles.td}>{a.title}</td>
                  <td style={styles.td}>{formatDate(a.date)}</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>Na čekanju</span>
                  </td>

                  {isDoctor && (
                    <td style={styles.td}>
                      <button
                        style={{ ...styles.btn, ...styles.acceptBtn }}
                        onClick={() => acceptPatient(a.id)}
                      >
                        Primi
                      </button>

                      <button
                        style={{ ...styles.btn, ...styles.deleteBtn }}
                        onClick={() => removeAppointment(a.id)}
                      >
                        Ukloni
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
