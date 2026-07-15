import { useEffect, useMemo, useState } from "react";
import { getMyAppointmentsInRange } from "@/services/appointments.service";
import { getDoctors } from "@/services/users.service";
import ReportDetailModal from "@/components/patient/ReportDetailModal";

function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date)) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function formatTime(date) {
  if (!(date instanceof Date) || isNaN(date)) return "";
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${min}`;
}

const getStatusStyle = () => ({
  background: "#dcfce7",
  color: "#166534",
});

export default function PatientReports() {
  const isMobile = window.innerWidth < 768;

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = najnoviji prvo

  const [doctorLabel, setDoctorLabel] = useState("Doktor");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    getDoctors()
      .then((res) => {
        const doctors = res?.data ?? res ?? [];
        if (doctors.length === 1) {
          setDoctorLabel(`${doctors[0].firstName} ${doctors[0].lastName}`);
        }
      })
      .catch(() => {});
  }, []);

  async function loadHistory() {
    setIsLoading(true);
    setError("");

    try {
      const res = await getMyAppointmentsInRange({
        from: fromDate || undefined,
        to: toDate || undefined,
        status: "Completed",
      });

      const data = res.data ?? res;

      setAppointments(
        data.map((a) => ({
          id: a.id,
          title: a.title ?? "Pregled",
          status: a.status ?? "Completed",
          date: new Date(a.date),
          doctorName: a.doctor
            ? `${a.doctor.firstName} ${a.doctor.lastName}`
            : null,
          report: a.report
            ? {
                note: a.report.note,
                diagnoses: (a.report.diagnoses ?? []).map((rd) => ({
                  code: rd.diagnosis.code,
                  name: rd.diagnosis.name,
                })),
              }
            : null,
        })),
      );
    } catch (err) {
      setError(err.message || "Greška pri učitavanju istorije pregleda.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, [fromDate, toDate]);

  const sortedAppointments = useMemo(() => {
    const copy = [...appointments];
    copy.sort((a, b) =>
      sortOrder === "desc" ? b.date - a.date : a.date - b.date,
    );
    return copy;
  }, [appointments, sortOrder]);

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f1f5f9",
      padding: isMobile ? "16px" : "32px",
      color: "#0f172a",
      fontFamily: "Inter, system-ui, sans-serif",
    },
    header: {
      marginBottom: "24px",
    },
    title: {
      margin: 0,
      fontSize: isMobile ? "22px" : "28px",
      fontWeight: 700,
    },
    subtitle: {
      color: "#64748b",
      marginTop: "4px",
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
      alignItems: "flex-end",
      gap: "14px",
      flexWrap: "wrap",
      marginBottom: "20px",
    },
    label: {
      display: "block",
      marginBottom: 4,
      fontSize: "13px",
      fontWeight: 600,
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
    },
    mobileCard: {
      background: "#f8fafc",
      borderRadius: "14px",
      padding: "16px",
      marginBottom: "12px",
      border: "1px solid #e2e8f0",
    },
    centerState: {
      padding: "30px",
      textAlign: "center",
      color: "#64748b",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Izvještaji</h1>
        <div style={styles.subtitle}>Istorija vaših završenih pregleda</div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Filteri</h2>

        <div style={styles.row}>
          <div>
            <label style={styles.label}>Od datuma</label>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Do datuma</label>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Sortiranje</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={styles.select}
            >
              <option value="desc">Najnoviji prvo</option>
              <option value="asc">Najstariji prvo</option>
            </select>
          </div>

          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              style={styles.btn}
            >
              Resetuj filtere
            </button>
          )}
        </div>

        {isLoading ? (
          <div style={styles.centerState}>Učitavanje...</div>
        ) : error ? (
          <div style={styles.centerState}>{error}</div>
        ) : sortedAppointments.length === 0 ? (
          <div style={styles.centerState}>
            Nema završenih pregleda za izabrani period.
          </div>
        ) : isMobile ? (
          <div>
            {sortedAppointments.map((a) => (
              <div
                key={a.id}
                style={{ ...styles.mobileCard, cursor: "pointer" }}
                onClick={() => setSelectedAppointment(a)}
              >
                <strong>{a.title}</strong>
                <div style={{ marginTop: 6, color: "#64748b" }}>
                  {formatDate(a.date)} u {formatTime(a.date)}
                </div>
                <div style={{ marginTop: 6, color: "#64748b" }}>
                  Doktor: {a.doctorName || doctorLabel}
                </div>

                {a.report?.diagnoses?.length > 0 && (
                  <div style={{ marginTop: 8, color: "#1d4ed8", fontWeight: 600 }}>
                    {a.report.diagnoses.map((d) => d.code).join(", ")}
                  </div>
                )}

                <div style={{ marginTop: 8 }}>
                  <span style={{ ...styles.badge, ...getStatusStyle() }}>
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Datum pregleda</th>
                <th style={styles.th}>Vrijeme</th>
                <th style={styles.th}>Vrsta pregleda</th>
                <th style={styles.th}>Doktor</th>
                <th style={styles.th}>Dijagnoze</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedAppointments.map((a, i) => (
                <tr
                  key={a.id}
                  style={{
                    background: i % 2 === 0 ? "#fff" : "#f8fafc",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedAppointment(a)}
                >
                  <td style={styles.td}>{formatDate(a.date)}</td>
                  <td style={styles.td}>{formatTime(a.date)}</td>
                  <td style={styles.td}>{a.title}</td>
                  <td style={styles.td}>{a.doctorName || doctorLabel}</td>
                  <td style={styles.td}>
                    {a.report?.diagnoses?.length > 0
                      ? a.report.diagnoses.map((d) => d.code).join(", ")
                      : "—"}
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...getStatusStyle() }}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedAppointment && (
        <ReportDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}
