import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { getAppointmentsInRange } from "@/services/appointments.service";
import { getUsers, getDoctors } from "@/services/users.service";

// import jsPDF from "jspdf";
// import "jspdf-autotable";

const PIE_COLORS = [
  "#2563eb",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
];

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

export default function DoctorReports() {
  const isMobile = window.innerWidth < 768;

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);

  const [doctorsCount, setDoctorsCount] = useState(1);
  const [doctorLabel, setDoctorLabel] = useState("Doktor");

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [patientAppointmentsLoading, setPatientAppointmentsLoading] =
    useState(false);

  useEffect(() => {
    getDoctors()
      .then((res) => {
        const doctors = res?.data ?? res ?? [];
        setDoctorsCount(doctors.length || 1);
        if (doctors.length === 1) {
          setDoctorLabel(`${doctors[0].firstName} ${doctors[0].lastName}`);
        }
      })
      .catch(() => {});

    getUsers("patient")
      .then((res) => {
        const data = res?.data ?? res ?? [];
        setPatients(data);
      })
      .catch(() => {
        setPatients([]);
      })
      .finally(() => setPatientsLoading(false));
  }, []);

  async function loadCompleted() {
    setIsLoading(true);
    setError("");

    try {
      const res = await getAppointmentsInRange({
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
          patientName: a.user
            ? `${a.user.firstName} ${a.user.lastName}`
            : `Pacijent ${a.id}`,
          patientId: a.user?.id,
        })),
      );
    } catch (err) {
      setError(err.message || "Greška pri učitavanju izvještaja.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCompleted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  const stats = useMemo(() => {
    const totalAppointments = appointments.length;
    const uniquePatients = new Set(
      appointments.map((a) => a.patientId ?? a.patientName),
    ).size;

    const byType = {};
    appointments.forEach((a) => {
      byType[a.title] = (byType[a.title] || 0) + 1;
    });

    const chartData = Object.entries(byType).map(([name, value]) => ({
      name,
      value,
      percent: totalAppointments
        ? Math.round((value / totalAppointments) * 1000) / 10
        : 0,
    }));

    return { totalAppointments, uniquePatients, byType, chartData };
  }, [appointments]);

  async function openPatientHistory(patient) {
    setSelectedPatient(patient);
    setPatientAppointmentsLoading(true);

    try {
      const res = await getAppointmentsInRange({
        status: "Completed",
        userId: patient.id,
      });

      const data = res.data ?? res;

      setPatientAppointments(
        data.map((a) => ({
          id: a.id,
          title: a.title ?? "Pregled",
          status: a.status ?? "Completed",
          date: new Date(a.date),
        })),
      );
    } catch {
      setPatientAppointments([]);
    } finally {
      setPatientAppointmentsLoading(false);
    }
  }

  function handleDownloadPdf() {
    const doc = new jsPDF();

    const periodLabel =
      fromDate || toDate
        ? `${fromDate ? formatDate(new Date(fromDate)) : "..."} - ${
            toDate ? formatDate(new Date(toDate)) : "..."
          }`
        : "Svi podaci";

    doc.setFontSize(16);
    doc.text("Izvještaj o pregledima", 14, 18);

    doc.setFontSize(11);
    doc.text(`Period: ${periodLabel}`, 14, 28);
    doc.text(`Ukupan broj pregleda: ${stats.totalAppointments}`, 14, 35);
    doc.text(`Broj pregledanih pacijenata: ${stats.uniquePatients}`, 14, 42);

    doc.autoTable(doc, {
      startY: 50,
      head: [["Vrsta pregleda", "Broj pregleda"]],
      body: stats.chartData.map((row) => [row.name, String(row.value)]),
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
    });

    const afterStatsY = doc.lastAutoTable.finY + 10;

    doc.setFontSize(12);
    doc.text("Svi završeni pregledi u periodu", 14, afterStatsY);

    doc.autoTable(doc, {
      startY: afterStatsY + 4,
      head: [["Datum", "Vrijeme", "Pacijent", "Vrsta pregleda", "Status"]],
      body: appointments
        .slice()
        .sort((a, b) => a.date - b.date)
        .map((a) => [
          formatDate(a.date),
          formatTime(a.date),
          a.patientName,
          a.title,
          a.status,
        ]),
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
    });

    const filenameSuffix =
      fromDate || toDate ? `_${fromDate || "od"}_${toDate || "do"}` : "";

    doc.save(`izvjestaj-pregledi${filenameSuffix}.pdf`);
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
      flexWrap: "wrap",
      gap: "16px",
      marginBottom: "24px",
    },
    title: { margin: 0, fontSize: isMobile ? "22px" : "28px", fontWeight: 700 },
    subtitle: { color: "#64748b", marginTop: "4px" },
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
      marginBottom: "10px",
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
    btn: {
      padding: "10px 18px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "14px",
    },
    ghostBtn: { background: "#e2e8f0", color: "#334155" },
    primaryBtn: { background: "#2563eb", color: "#fff" },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: isMobile
        ? "1fr"
        : "repeat(auto-fit,minmax(200px,1fr))",
      gap: "20px",
      marginBottom: "24px",
    },
    statCard: {
      background: "#fff",
      padding: "24px",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    },
    statNumber: {
      fontSize: "34px",
      fontWeight: 700,
      color: "#2563eb",
      margin: 0,
    },
    statText: { marginTop: "8px", color: "#334155", fontWeight: 500 },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      background: "#2563eb",
      color: "#fff",
      padding: "14px 16px",
      textAlign: "left",
      fontWeight: 600,
    },
    td: { padding: "14px 16px", borderBottom: "1px solid #e2e8f0" },
    centerState: { padding: "30px", textAlign: "center", color: "#64748b" },
    userRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 16px",
      borderBottom: "1px solid #e2e8f0",
      cursor: "pointer",
    },
    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      zIndex: 100,
    },
    modal: {
      background: "#fff",
      borderRadius: "20px",
      padding: "24px",
      width: "100%",
      maxWidth: "640px",
      maxHeight: "80vh",
      overflowY: "auto",
    },
    badge: {
      padding: "5px 12px",
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: 600,
      display: "inline-block",
      background: "#dcfce7",
      color: "#166534",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Izvještaji</h1>
          <div style={styles.subtitle}>
            Statistika završenih pregleda
            {doctorsCount === 1 ? ` — ${doctorLabel}` : ""}
          </div>
        </div>

        <button
          onClick={handleDownloadPdf}
          style={{ ...styles.btn, ...styles.primaryBtn }}
        >
          Preuzmi PDF
        </button>
      </div>

      {/* FILTERI */}
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

          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              style={{ ...styles.btn, ...styles.ghostBtn }}
            >
              Resetuj filtere
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div style={styles.card}>
          <div style={styles.centerState}>Učitavanje...</div>
        </div>
      ) : error ? (
        <div style={styles.card}>
          <div style={styles.centerState}>{error}</div>
        </div>
      ) : (
        <>
          {/* STATS */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h2 style={styles.statNumber}>{stats.uniquePatients}</h2>
              <div style={styles.statText}>Pregledanih pacijenata</div>
            </div>

            <div style={styles.statCard}>
              <h2 style={styles.statNumber}>{stats.totalAppointments}</h2>
              <div style={styles.statText}>Ukupan broj pregleda</div>
            </div>

            <div style={styles.statCard}>
              <h2 style={styles.statNumber}>{stats.chartData.length}</h2>
              <div style={styles.statText}>Vrsta pregleda</div>
            </div>
          </div>

          {/* PIE CHART */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Pregledi po vrsti</h2>

            {stats.chartData.length === 0 ? (
              <div style={styles.centerState}>
                Nema završenih pregleda za izabrani period.
              </div>
            ) : (
              <div style={{ width: "100%", height: 340 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={stats.chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, percent, value }) =>
                        `${name}: ${value} (${percent}%)`
                      }
                    >
                      {stats.chartData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} (${props.payload.percent}%)`,
                        name,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* KORISNICI */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Korisnici</h2>

            {patientsLoading ? (
              <div style={styles.centerState}>Učitavanje...</div>
            ) : patients.length === 0 ? (
              <div style={styles.centerState}>
                Nema registrovanih pacijenata.
              </div>
            ) : (
              <div>
                {patients.map((p) => (
                  <div
                    key={p.id}
                    style={styles.userRow}
                    onClick={() => openPatientHistory(p)}
                  >
                    <div>
                      <strong>
                        {p.firstName} {p.lastName}
                      </strong>
                      <div style={{ color: "#64748b", fontSize: "13px" }}>
                        {p.email}
                      </div>
                    </div>
                    <span
                      style={{
                        color: "#2563eb",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      Prikaži istoriju →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL - ISTORIJA PACIJENTA */}
      {selectedPatient && (
        <div
          style={styles.modalOverlay}
          onClick={() => setSelectedPatient(null)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ margin: 0, fontWeight: 700 }}>
                {selectedPatient.firstName} {selectedPatient.lastName}
              </h2>

              <button
                onClick={() => setSelectedPatient(null)}
                style={{ ...styles.btn, ...styles.ghostBtn }}
              >
                Zatvori
              </button>
            </div>

            <div style={{ color: "#64748b", marginBottom: "16px" }}>
              Završeni pregledi
            </div>

            {patientAppointmentsLoading ? (
              <div style={styles.centerState}>Učitavanje...</div>
            ) : patientAppointments.length === 0 ? (
              <div style={styles.centerState}>
                Nema završenih pregleda za ovog pacijenta.
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Datum</th>
                    <th style={styles.th}>Vrijeme</th>
                    <th style={styles.th}>Vrsta pregleda</th>
                    {doctorsCount > 1 && <th style={styles.th}>Doktor</th>}
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patientAppointments.map((a) => (
                    <tr key={a.id}>
                      <td style={styles.td}>{formatDate(a.date)}</td>
                      <td style={styles.td}>{formatTime(a.date)}</td>
                      <td style={styles.td}>{a.title}</td>
                      {doctorsCount > 1 && (
                        <td style={styles.td}>{doctorLabel}</td>
                      )}
                      <td style={styles.td}>
                        <span style={styles.badge}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
