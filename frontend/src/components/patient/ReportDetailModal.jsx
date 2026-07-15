import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../../../public/images/Logo.png";

function formatDateTime(date) {
  if (!(date instanceof Date) || isNaN(date)) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} u ${hh}:${min}`;
}

// appointment: normalizovan objekat iz PatientReports.jsx / DoctorReports.jsx
// ({ date, title, doctorName, patientName?, report: { note, diagnoses: [{code, name}] } })
// showDownload: prikazuje dugme "Preuzmi PDF" (koristi doktor iz DoctorReports.jsx)
export default function ReportDetailModal({
  appointment,
  onClose,
  showDownload = false,
}) {
  if (!appointment) return null;

  const diagnoses = appointment.report?.diagnoses ?? [];

  function handleDownloadPdf() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // logo ukc-a
    doc.addImage(logo, "PNG", 0, 0, pageWidth, 34);

    // doc.setFontSize(14);
    // doc.text("Univerzitetski klinički centar", 14, 18);

    doc.setFontSize(18);
    doc.text("Izvještaj o pregledu", 14, 30);

    doc.setFontSize(11);
    doc.text(`Datum pregleda: ${formatDateTime(appointment.date)}`, 14, 42);
    doc.text(`Pacijent: ${appointment.patientName || "-"}`, 14, 49);
    doc.text(`Doktor: ${appointment.doctorName || "-"}`, 14, 56);

    doc.autoTable({
      startY: 65,
      head: [["MKB-10 šifra", "Naziv dijagnoze"]],
      body:
        diagnoses.length > 0
          ? diagnoses.map((d) => [d.code, d.name])
          : [["-", "Nema unesenih dijagnoza"]],
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] },
    });

    const afterTableY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.text("Terapija / napomena", 14, afterTableY);

    doc.setFontSize(11);
    doc.text(
      doc.splitTextToSize(appointment.report?.note || "Nema napomene.", 180),
      14,
      afterTableY + 8,
    );

    doc.save(`izvjestaj-pregled-${appointment.id}.pdf`);
  }

  const styles = {
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      zIndex: 100,
    },
    modal: {
      background: "#fff",
      borderRadius: "20px",
      padding: "28px",
      width: "100%",
      maxWidth: "560px",
      maxHeight: "90vh",
      overflowY: "auto",
      boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "18px",
    },
    title: { margin: 0, fontSize: "20px", fontWeight: 700, color: "#0f172a" },
    closeBtn: {
      border: "none",
      background: "transparent",
      fontSize: "22px",
      lineHeight: 1,
      cursor: "pointer",
      color: "#64748b",
    },
    headerActions: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    downloadBtn: {
      padding: "8px 14px",
      borderRadius: "10px",
      border: "none",
      background: "#2563eb",
      color: "#fff",
      fontWeight: 600,
      fontSize: "13px",
      cursor: "pointer",
    },
    section: { marginBottom: "18px" },
    label: {
      fontSize: "13px",
      fontWeight: 700,
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.03em",
      marginBottom: "6px",
    },
    value: { color: "#0f172a", fontSize: "15px" },
    diagnosisItem: {
      background: "#eff6ff",
      color: "#1d4ed8",
      borderRadius: "10px",
      padding: "8px 12px",
      marginBottom: "8px",
      fontWeight: 600,
    },
    note: {
      whiteSpace: "pre-wrap",
      background: "#f8fafc",
      borderRadius: "10px",
      padding: "12px 14px",
      color: "#334155",
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Izvještaj o pregledu</h2>
          <div style={styles.headerActions}>
            {showDownload && (
              <button style={styles.downloadBtn} onClick={handleDownloadPdf}>
                Preuzmi PDF
              </button>
            )}
            <button
              style={styles.closeBtn}
              onClick={onClose}
              aria-label="Zatvori"
            >
              ×
            </button>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.label}>Datum pregleda</div>
          <div style={styles.value}>{formatDateTime(appointment.date)}</div>
        </div>

        <div style={styles.section}>
          <div style={styles.label}>Doktor</div>
          <div style={styles.value}>
            {appointment.doctorName || "Nepoznat doktor"}
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.label}>Dijagnoze (MKB-10)</div>
          {diagnoses.length === 0 ? (
            <div style={styles.value}>Nema unesenih dijagnoza.</div>
          ) : (
            diagnoses.map((d) => (
              <div key={d.code} style={styles.diagnosisItem}>
                {d.code} — {d.name}
              </div>
            ))
          )}
        </div>

        <div style={styles.section}>
          <div style={styles.label}>Terapija / napomena</div>
          <div style={styles.note}>
            {appointment.report?.note || "Nema napomene."}
          </div>
        </div>
      </div>
    </div>
  );
}
