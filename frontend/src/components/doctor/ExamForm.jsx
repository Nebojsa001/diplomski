import { useEffect, useState } from "react";
import DiagnosisSelect from "@/components/DiagnosisSelect";
import {
  completeAppointment,
  getAppointments,
} from "@/services/appointments.service";
import { TIME_SLOTS, isTimeInPast, slotToIsoString } from "@/utils/timeSlots";

function getTomorrowString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

const TODAY_STR = new Date().toISOString().split("T")[0];

// Forma koja se prikazuje kad je termin u statusu "InProgress".
// Poziva se onCompleted(appointmentId) nakon uspješnog završetka pregleda.
export default function ExamForm({ appointment, onCompleted }) {
  const [diagnoses, setDiagnoses] = useState([]);
  const [note, setNote] = useState("");

  // kontrolni pregled: opciono, biraju se samo datum + slobodan slot
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [nextDateStr, setNextDateStr] = useState(getTomorrowString());
  const [nextTime, setNextTime] = useState("");
  const [takenTimes, setTakenTimes] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Učitaj zauzete termine za izabrani datum (bilo koji status osim otkazanog
  // blokira slot - isto pravilo kao na backendu pri kreiranju termina).
  useEffect(() => {
    if (!scheduleFollowUp || !nextDateStr) return;

    let isMounted = true;

    async function loadTaken() {
      setSlotsLoading(true);
      try {
        const [waiting, inProgress, completed] = await Promise.all([
          getAppointments(nextDateStr, { status: "Waiting" }),
          getAppointments(nextDateStr, { status: "InProgress" }),
          getAppointments(nextDateStr, { status: "Completed" }),
        ]);

        if (!isMounted) return;

        const all = [...waiting.data, ...inProgress.data, ...completed.data];

        const times = all.map((a) => {
          const d = new Date(a.date);
          const hh = String(d.getHours()).padStart(2, "0");
          const mm = String(d.getMinutes()).padStart(2, "0");
          return `${hh}:${mm}`;
        });

        setTakenTimes(times);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setSlotsLoading(false);
      }
    }

    loadTaken();
    return () => {
      isMounted = false;
    };
  }, [scheduleFollowUp, nextDateStr]);

  const availableSlots = TIME_SLOTS.filter(
    (t) => !takenTimes.includes(t) && !isTimeInPast(nextDateStr, t),
  );

  // ako izabrani slot više nije slobodan (promjena datuma i sl.), resetuj ga
  useEffect(() => {
    if (nextTime && !availableSlots.includes(nextTime)) {
      setNextTime(availableSlots[0] || "");
    } else if (!nextTime && availableSlots.length > 0) {
      setNextTime(availableSlots[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextDateStr, takenTimes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (diagnoses.length === 0) {
      setError("Izaberite bar jednu dijagnozu prije završetka pregleda.");
      return;
    }

    if (scheduleFollowUp && !nextTime) {
      setError("Nema slobodnih termina za izabrani datum kontrole.");
      return;
    }

    try {
      setIsSubmitting(true);

      await completeAppointment(appointment.id, {
        diagnosisIds: diagnoses.map((d) => d.id),
        note: note.trim() || undefined,
        nextAppointmentDate:
          scheduleFollowUp && nextTime
            ? slotToIsoString(nextDateStr, nextTime)
            : undefined,
      });

      onCompleted(appointment.id);
    } catch (err) {
      console.error(err);
      setError(err.message || "Greška pri završetku pregleda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    wrapper: {
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      padding: "20px",
      marginTop: "10px",
    },
    label: {
      display: "block",
      marginBottom: "6px",
      fontWeight: 600,
      color: "#0f172a",
    },
    field: { marginBottom: "16px" },
    textarea: {
      width: "100%",
      minHeight: "80px",
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid #cbd5e1",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
      resize: "vertical",
    },
    input: {
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid #cbd5e1",
      outline: "none",
    },
    select: {
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid #cbd5e1",
      outline: "none",
      background: "#fff",
    },
    checkboxLabel: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: 600,
      color: "#0f172a",
      cursor: "pointer",
    },
    submitBtn: {
      padding: "10px 18px",
      borderRadius: "10px",
      border: "none",
      background: "#2563eb",
      color: "white",
      fontWeight: 600,
      cursor: "pointer",
    },
    error: {
      color: "#dc2626",
      marginBottom: "12px",
      fontWeight: 600,
    },
  };

  return (
    <form style={styles.wrapper} onSubmit={handleSubmit}>
      <div style={styles.field}>
        <label style={styles.label}>Dijagnoza (MKB-10)</label>
        <DiagnosisSelect value={diagnoses} onChange={setDiagnoses} />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Terapija / napomena</label>
        <textarea
          style={styles.textarea}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Terapija, preporuke, napomene ljekara..."
        />
      </div>

      <div style={styles.field}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={scheduleFollowUp}
            onChange={(e) => setScheduleFollowUp(e.target.checked)}
          />
          Zakazati kontrolni pregled
        </label>

        {scheduleFollowUp && (
          <div style={{ display: "flex", gap: "12px", marginTop: "10px", flexWrap: "wrap" }}>
            <div>
              <label style={styles.label}>Datum kontrole</label>
              <input
                type="date"
                style={styles.input}
                value={nextDateStr}
                min={TODAY_STR}
                onChange={(e) => setNextDateStr(e.target.value)}
              />
            </div>

            <div>
              <label style={styles.label}>Slobodan termin</label>
              <select
                style={styles.select}
                value={nextTime}
                onChange={(e) => setNextTime(e.target.value)}
                disabled={slotsLoading}
              >
                {slotsLoading ? (
                  <option value="">Učitavanje...</option>
                ) : availableSlots.length === 0 ? (
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
          </div>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
        {isSubmitting ? "Snimanje..." : "Završi pregled"}
      </button>
    </form>
  );
}
