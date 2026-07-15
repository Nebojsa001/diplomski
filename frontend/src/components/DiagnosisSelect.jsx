import { useEffect, useRef, useState } from "react";
import { searchDiagnoses } from "@/services/diagnoses.service";

// Kontrolisana komponenta: value = niz izabranih dijagnoza [{id, code, name}, ...]
export default function DiagnosisSelect({ value = [], onChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await searchDiagnoses(query.trim());
        setResults(res.data || []);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const addDiagnosis = (diagnosis) => {
    if (value.some((d) => d.id === diagnosis.id)) return;
    onChange([...value, diagnosis]);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const removeDiagnosis = (id) => {
    onChange(value.filter((d) => d.id !== id));
  };

  const styles = {
    wrapper: { position: "relative" },
    input: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid #cbd5e1",
      outline: "none",
      boxSizing: "border-box",
    },
    dropdown: {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      background: "#fff",
      borderRadius: "10px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
      zIndex: 20,
      maxHeight: "220px",
      overflowY: "auto",
    },
    option: {
      padding: "10px 12px",
      cursor: "pointer",
      borderBottom: "1px solid #f1f5f9",
    },
    chips: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginTop: "10px",
    },
    chip: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: "#eff6ff",
      color: "#1d4ed8",
      padding: "6px 10px",
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: 600,
    },
    chipRemove: {
      cursor: "pointer",
      border: "none",
      background: "transparent",
      color: "#1d4ed8",
      fontWeight: 700,
    },
  };

  return (
    <div style={styles.wrapper}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder="Pretraži MKB-10 šifru ili naziv (npr. I10, hipertenzija)..."
        style={styles.input}
      />

      {isOpen && results.length > 0 && (
        <div style={styles.dropdown}>
          {results.map((d) => (
            <div
              key={d.id}
              style={styles.option}
              // onMouseDown umjesto onClick da se izbjegne blur input-a prije klika
              onMouseDown={() => addDiagnosis(d)}
            >
              <strong>{d.code}</strong> — {d.name}
            </div>
          ))}
        </div>
      )}

      {isOpen && !isSearching && query.trim() && results.length === 0 && (
        <div style={styles.dropdown}>
          <div style={{ ...styles.option, color: "#64748b", cursor: "default" }}>
            Nema rezultata za "{query}".
          </div>
        </div>
      )}

      {value.length > 0 && (
        <div style={styles.chips}>
          {value.map((d) => (
            <span key={d.id} style={styles.chip}>
              {d.code} - {d.name}
              <button
                type="button"
                style={styles.chipRemove}
                onClick={() => removeDiagnosis(d.id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
