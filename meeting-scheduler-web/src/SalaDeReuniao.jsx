import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = "http://10.123.97.137:5087";
const START_HOUR = 7;
const END_HOUR = 20;
const HOUR_W = 64;

// --- helpers ---------------------------------------------------------
const pad = (n) => String(n).padStart(2, "0");
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const fmtTime = (t) => t.slice(0, 5);
const fmtRange = (s, e) => `${fmtTime(s)} – ${fmtTime(e)}`;
const formatDayLabel = (d) =>
  new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(d);

// --- API ---------------------------------------------------------------
async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const fetchRooms = (signal) => apiFetch("/api/rooms", { signal });
const fetchMeetings = (signal) => apiFetch("/api/meetings", { signal });
const postMeeting = (payload) =>
  apiFetch("/api/meetings", { method: "POST", body: JSON.stringify(payload) });
const deleteMeeting = (id) => apiFetch(`/api/meetings/${id}`, { method: "DELETE" });

// --- styles --------------------------------------------------------------
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@800&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  .sr-root {
    --bg:       #3c3c3e;
    --panel:    #48484b;
    --panel2:   #555558;
    --line:     rgba(244,242,237,0.12);
    --lines:    rgba(244,242,237,0.24);
    --paper:    #f4f2ed;
    --dim:      #9aa0ad;
    --dimmer:   #6b7280;
    --amber:    #f2a93b;
    --ambers:   rgba(242,169,59,0.16);
    --mint:     #4ade80;
    --mints:    rgba(74,222,128,0.14);
    --coral:    #ff5e5b;
    --corals:   rgba(255,94,91,0.14);
    --r:        14px;
    box-sizing: border-box;
    background: var(--bg);
    color: var(--paper);
    font-family: 'Manrope', sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }
  .sr-root *, .sr-root *::before, .sr-root *::after { box-sizing: border-box; }

  .sr-app {
    max-width: 880px;
    margin: 0 auto;
    padding: 28px 20px 60px;
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  /* header */
  .sr-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    border-bottom: 1px solid var(--lines);
    padding-bottom: 14px;
  }
  .sr-logo {
    font-family: 'Big Shoulders Display', sans-serif;
    font-weight: 800;
    font-size: clamp(22px,5vw,30px);
    letter-spacing: .04em;
    text-transform: uppercase;
    color: var(--paper);
  }
  .sr-logo span { color: var(--amber); }
  .sr-clock {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(16px,4vw,20px);
    color: var(--dim);
    font-weight: 500;
    letter-spacing: .02em;
  }

  /* status hero */
  .sr-hero {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 22px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    perspective: 600px;
  }
  .sr-flap { overflow: hidden; }
  @keyframes flapIn {
    0%   { transform: rotateX(90deg); opacity: 0; }
    55%  { transform: rotateX(-12deg); opacity: 1; }
    100% { transform: rotateX(0deg); opacity: 1; }
  }
  .sr-status {
    display: block;
    font-family: 'Big Shoulders Display', sans-serif;
    font-weight: 800;
    font-size: clamp(34px,9vw,52px);
    letter-spacing: .03em;
    line-height: 1;
    transform-origin: top center;
  }
  .sr-status.free     { color: var(--mint); }
  .sr-status.occupied { color: var(--coral); }
  .sr-status.neutral  { color: var(--dim); }
  .sr-status.anim     { animation: flapIn .5s ease; }
  .sr-detail {
    font-size: 14px;
    color: var(--dim);
    text-align: right;
    line-height: 1.5;
    max-width: 320px;
  }
  .sr-detail strong { color: var(--paper); font-weight: 600; }

  /* panel */
  .sr-panel {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 20px 22px 22px;
  }
  .sr-panel-title {
    margin: 0 0 16px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: var(--dim);
    font-weight: 700;
  }

  /* sala selector */
  .sr-sala-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 14px 18px;
  }
  .sr-sala-row label { font-size: 13px; color: var(--dim); font-weight: 600; white-space: nowrap; }
  .sr-select {
    background: var(--panel2);
    border: 1px solid var(--lines);
    color: var(--paper);
    border-radius: 8px;
    padding: 8px 12px;
    font-family: 'Manrope', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    flex: 1;
    min-width: 160px;
  }
  .sr-select:focus-visible { outline: 2px solid var(--amber); outline-offset: 1px; }
  .sr-cap {
    font-size: 12px;
    color: var(--dimmer);
    background: var(--panel2);
    border: 1px solid var(--line);
    padding: 5px 10px;
    border-radius: 6px;
    white-space: nowrap;
  }

  /* day nav */
  .sr-daynav {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sr-nav-btn {
    background: var(--panel);
    border: 1px solid var(--line);
    color: var(--paper);
    width: 34px; height: 34px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background .15s, border-color .15s;
    flex-shrink: 0;
  }
  .sr-nav-btn:hover { background: var(--panel2); border-color: var(--lines); }
  .sr-nav-btn:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }
  .sr-today-btn {
    width: auto;
    padding: 0 14px;
    font-family: 'Manrope', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--dim);
  }
  .sr-daylabel {
    flex: 1;
    font-weight: 600;
    font-size: 15px;
    text-transform: capitalize;
    color: var(--paper);
  }

  /* timeline */
  .sr-timeline-wrap {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: var(--r);
    padding: 18px 0 20px;
    overflow-x: auto;
  }
  .sr-timeline { position: relative; margin: 0 20px; width: max-content; }
  .sr-hour-row { display: flex; }
  .sr-hour-cell {
    width: 64px; flex: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; color: var(--dimmer);
    border-left: 1px solid var(--line);
    padding-left: 5px; padding-bottom: 8px;
  }
  .sr-hour-cell:first-child { border-left: none; }
  .sr-track { position: relative; height: 70px; border-top: 1px solid var(--line); }
  .sr-track-grid { position: absolute; inset: 0; display: flex; }
  .sr-track-grid div { width: 64px; flex: none; border-left: 1px solid var(--line); }
  .sr-now-line {
    position: absolute; top: -2px; bottom: 0; width: 2px;
    background: var(--amber); z-index: 3;
  }
  .sr-now-line::before {
    content: ''; position: absolute;
    top: -5px; left: 50%; transform: translateX(-50%);
    width: 7px; height: 7px; border-radius: 50%; background: var(--amber);
  }
  .sr-block {
    position: absolute; top: 6px; height: 58px;
    background: var(--ambers); border: 1px solid var(--amber);
    border-radius: 8px; padding: 5px 8px; overflow: hidden; z-index: 2;
    display: flex; flex-direction: column; justify-content: center; gap: 2px;
    min-width: 60px;
  }
  .sr-block-time {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: var(--amber); font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sr-block-title {
    font-size: 11px; color: var(--paper); font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* form */
  .sr-row { display: flex; gap: 14px; margin-bottom: 14px; flex-wrap: wrap; }
  .sr-field {
    flex: 1; min-width: 140px;
    display: flex; flex-direction: column; gap: 6px;
    font-size: 12px; color: var(--dim); font-weight: 600;
  }
  .sr-input {
    background: var(--panel2); border: 1px solid var(--lines);
    color: var(--paper); border-radius: 8px; padding: 10px 11px;
    font-family: 'Manrope', sans-serif; font-size: 14px;
  }
  .sr-input[type="time"] { font-family: 'JetBrains Mono', monospace; }
  .sr-input:focus-visible { outline: 2px solid var(--amber); outline-offset: 1px; border-color: var(--amber); }
  .sr-submit {
    background: var(--amber); color: #1a1305;
    border: none; font-weight: 700; font-size: 14px;
    padding: 11px 22px; border-radius: 8px; cursor: pointer;
    transition: filter .15s, transform .1s;
    font-family: 'Manrope', sans-serif;
  }
  .sr-submit:hover { filter: brightness(1.08); }
  .sr-submit:active { transform: scale(.98); }
  .sr-submit:disabled { opacity: .5; cursor: not-allowed; }

  .sr-banner {
    margin-top: 14px; border-radius: 8px;
    padding: 12px 14px; font-size: 13px; line-height: 1.5;
  }
  .sr-banner.error { background: var(--corals); border: 1px solid var(--coral); color: var(--paper); }
  .sr-banner.error strong { color: var(--coral); }
  .sr-banner.success { background: var(--mints); border: 1px solid var(--mint); color: var(--paper); }

  /* list */
  .sr-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
  .sr-list-item {
    display: flex; align-items: center; gap: 14px;
    background: var(--panel2); border: 1px solid var(--line);
    border-radius: 10px; padding: 12px 14px;
  }
  .sr-li-time {
    font-family: 'JetBrains Mono', monospace; font-size: 13px;
    font-weight: 600; color: var(--amber); white-space: nowrap;
    width: 96px; flex: none;
  }
  .sr-li-info { flex: 1; min-width: 0; }
  .sr-li-title { font-size: 14px; font-weight: 600; color: var(--paper); }
  .sr-li-person { font-size: 12px; color: var(--dim); margin-top: 2px; }
  .sr-cancel {
    background: transparent; border: 1px solid var(--lines);
    color: var(--dim); font-size: 12px; font-weight: 600;
    padding: 7px 12px; border-radius: 7px; cursor: pointer; flex: none;
    transition: all .15s; font-family: 'Manrope', sans-serif;
  }
  .sr-cancel:hover { border-color: var(--coral); color: var(--coral); }
  .sr-cancel.confirming { background: var(--coral); border-color: var(--coral); color: #fff; }
  .sr-empty { color: var(--dimmer); font-size: 13px; padding: 4px 2px; }
  .sr-note { font-size: 11px; color: var(--dimmer); text-align: center; padding-top: 4px; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .sr-spinner {
    display: inline-block; width: 14px; height: 14px;
    border: 2px solid var(--lines); border-top-color: var(--amber);
    border-radius: 50%; animation: spin .7s linear infinite;
    vertical-align: middle; margin-right: 6px;
  }
  @media (prefers-reduced-motion: reduce) {
    .sr-status.anim, .sr-spinner { animation: none; }
  }
`;

// --- subcomponents -------------------------------------------------------
function Timeline({ bookings, currentDate }) {
  const totalHours = END_HOUR - START_HOUR;
  const trackWidth = totalHours * HOUR_W;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isToday = isSameDay(currentDate, today);

  const nowMin = (() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  })();

  const nowLeft =
    isToday && nowMin >= START_HOUR * 60 && nowMin <= END_HOUR * 60
      ? ((nowMin - START_HOUR * 60) / 60) * HOUR_W
      : null;

  return (
    <div className="sr-timeline-wrap">
      <div className="sr-timeline">
        <div className="sr-hour-row" style={{ width: trackWidth }}>
          {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
            <div key={i} className="sr-hour-cell">{pad(START_HOUR + i)}h</div>
          ))}
        </div>
        <div className="sr-track" style={{ width: trackWidth }}>
          <div className="sr-track-grid">
            {Array.from({ length: totalHours }, (_, i) => <div key={i} />)}
          </div>
          {bookings.map((b) => {
            const s = Math.max(toMinutes(b.startTime), START_HOUR * 60);
            const e = Math.min(toMinutes(b.endTime), END_HOUR * 60);
            if (e <= s) return null;
            const left = ((s - START_HOUR * 60) / 60) * HOUR_W;
            const width = Math.max(((e - s) / 60) * HOUR_W - 3, 20);
            return (
              <div key={b.id} className="sr-block" style={{ left, width }}>
                <span className="sr-block-time">{fmtTime(b.startTime)}–{fmtTime(b.endTime)}</span>
                <span className="sr-block-title">{b.title}</span>
              </div>
            );
          })}
          {nowLeft !== null && <div className="sr-now-line" style={{ left: nowLeft }} />}
        </div>
      </div>
    </div>
  );
}

function BookingList({ bookings, onCancel, currentUser }) {
  const [confirming, setConfirming] = useState(null);

  const handleCancel = (id) => {
    if (confirming !== id) {
      setConfirming(id);
      setTimeout(() => setConfirming((c) => (c === id ? null : c)), 3000);
    } else {
      setConfirming(null);
      onCancel(id);
    }
  };

  if (bookings.length === 0)
    return <p className="sr-empty">Nenhuma reserva para este dia ainda.</p>;

  const sorted = [...bookings].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  return (
    <ul className="sr-list">
      {sorted.map((b) => {
        const isOwner = currentUser &&
          b.createdByLogin.toLowerCase() === currentUser.toLowerCase();
        return (
          <li key={b.id} className="sr-list-item">
            <span className="sr-li-time">{fmtRange(b.startTime, b.endTime)}</span>
            <span className="sr-li-info">
              <div className="sr-li-title">{b.title}</div>
              <div className="sr-li-person">{b.createdByLogin}</div>
            </span>
            {isOwner && (
              <button
                className={`sr-cancel${confirming === b.id ? " confirming" : ""}`}
                onClick={() => handleCancel(b.id)}
              >
                {confirming === b.id ? "Confirmar?" : "Cancelar"}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// --- main component -------------------------------------------------------
export default function SalaDeReuniao({ user, onLogout }) {
  // extrai "javson.silva" de "javson.silva@stratura.com.br"
  const currentUser = user?.username?.split("@")[0] ?? "";
  const [clock, setClock] = useState("");
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  });
  const [apiStatus, setApiStatus] = useState("verificando…");
  const [statusKind, setStatusKind] = useState("neutral");
  const [statusText, setStatusText] = useState("CARREGANDO");
  const [statusDetail, setStatusDetail] = useState("");
  const [statusKey, setStatusKey] = useState("");
  const [animKey, setAnimKey] = useState(0);

  // form
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- controle de concorrência do refresh ---
  // requestSeq garante que só o resultado da chamada MAIS RECENTE é aplicado.
  // inFlightRef evita disparar um novo refresh enquanto o anterior ainda não voltou.
  const requestSeqRef = useRef(0);
  const inFlightRef = useRef(false);
  const abortRef = useRef(null);

  // clock
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(`${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // load rooms
  useEffect(() => {
    fetchRooms()
      .then((data) => {
        setRooms(data);
        if (data.length) setCurrentRoomId(data[0].id);
      })
      .catch(() => setApiStatus("⚠ API offline"));
  }, []);

  // load bookings — protegido contra sobreposição/race condition
  const refresh = useCallback(async () => {
    if (!currentRoomId) return;

    // Se já existe uma chamada em andamento, não dispara outra por cima.
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    const mySeq = ++requestSeqRef.current;

    // cancela qualquer requisição anterior ainda pendente, se o navegador suportar
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const all = await fetchMeetings(controller.signal);

      // Se, enquanto esperávamos, uma chamada mais nova já foi iniciada,
      // descarta esse resultado desatualizado.
      if (mySeq !== requestSeqRef.current) return;

      const key = dateKey(currentDate);
      const filtered = all.filter(
        (m) =>
          (m.roomId === currentRoomId || (m.room && m.room.id === currentRoomId)) &&
          m.meetingDate === key
      );
      setBookings(filtered);
      setApiStatus("conectado ✓");
    } catch (err) {
      if (err.name === "AbortError") return; // cancelado de propósito, ignora
      if (mySeq === requestSeqRef.current) {
        setApiStatus("⚠ Erro ao buscar reuniões");
      }
    } finally {
      if (mySeq === requestSeqRef.current) {
        inFlightRef.current = false;
      }
    }
  }, [currentRoomId, currentDate]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  // compute status
  useEffect(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isToday = isSameDay(currentDate, today);

    let kind, text, detail;
    if (!isToday) {
      kind = "neutral";
      text = currentDate < today ? "DIA PASSADO" : "DIA FUTURO";
      detail = `Visualizando ${formatDayLabel(currentDate)}`;
    } else {
      const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
      const active = bookings.find(
        (b) => toMinutes(b.startTime) <= nowMin && nowMin < toMinutes(b.endTime)
      );
      if (active) {
        kind = "occupied"; text = "OCUPADA";
        detail = `${active.title} · ${active.createdByLogin} · até ${fmtTime(active.endTime)}`;
      } else {
        const next = [...bookings]
          .filter((b) => toMinutes(b.startTime) > nowMin)
          .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))[0];
        kind = "free"; text = "LIVRE";
        detail = next
          ? `Próxima reserva às ${fmtTime(next.startTime)} · ${next.title}`
          : "Nenhuma reserva pendente hoje";
      }
    }

    const newKey = kind + text;
    if (newKey !== statusKey) {
      setAnimKey((k) => k + 1);
      setStatusKey(newKey);
    }
    setStatusKind(kind);
    setStatusText(text);
    setStatusDetail(detail);
  }, [bookings, currentDate, statusKey]);

  const changeDay = (offset) => {
    setCurrentDate((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() + offset);
      return n;
    });
    setError(""); setSuccess("");
  };

  const goToday = () => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    setCurrentDate(d);
    setError(""); setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!currentRoomId) { setError("Selecione uma sala antes de reservar."); return; }
    setSubmitting(true);
    try {
      await postMeeting({
        title,
        meetingDate: dateKey(currentDate),
        startTime: startTime + ":00",
        endTime: endTime + ":00",
        roomId: currentRoomId,
        createdByLogin: currentUser,
      });
      await refresh();
      setSuccess(`Reservado: ${startTime}–${endTime} para "${title}".`);
      setTitle(""); setStartTime(""); setEndTime("");
    } catch (err) {
      setError(err.message || "Não foi possível reservar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await deleteMeeting(id);
      await refresh();
      setError(""); setSuccess("");
    } catch (err) {
      setError(err.message || "Erro ao cancelar.");
    }
  };

  const currentRoom = rooms.find((r) => r.id === currentRoomId);

  return (
    <>
      <style>{css}</style>
      <div className="sr-root">
        <div className="sr-app">

          {/* header */}
          <header className="sr-header">
            <div className="sr-logo">Sala de <span>Reunião</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="sr-clock">{clock}</div>
              {onLogout && (
                <button onClick={onLogout} style={{
                  background: 'transparent',
                  border: '1px solid rgba(244,242,237,0.24)',
                  color: '#9aa0ad',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontFamily: 'Manrope, sans-serif'
                }}>Sair</button>
              )}
            </div>
          </header>

          {/* status hero */}
          <section className="sr-hero">
            <div className="sr-flap">
              <span key={animKey} className={`sr-status ${statusKind} anim`}>
                {statusText}
              </span>
            </div>
            <div className="sr-detail">
              {statusDetail.split(" · ").map((part, i) =>
                i === 0
                  ? <strong key={i}>{part}</strong>
                  : <span key={i}><br />{part}</span>
              )}
            </div>
          </section>

          {/* sala selector */}
          <div className="sr-sala-row">
            <label htmlFor="roomSelect">Sala:</label>
            <select
              id="roomSelect"
              className="sr-select"
              value={currentRoomId ?? ""}
              onChange={(e) => { setCurrentRoomId(parseInt(e.target.value)); setError(""); setSuccess(""); }}
            >
              {rooms.length === 0 && <option value="">Carregando…</option>}
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <span className="sr-cap">
              {currentRoom ? `Capacidade: ${currentRoom.capacity} pessoas` : "—"}
            </span>
          </div>

          {/* day nav */}
          <nav className="sr-daynav">
            <button className="sr-nav-btn" onClick={() => changeDay(-1)} aria-label="Dia anterior">‹</button>
            <div className="sr-daylabel">{formatDayLabel(currentDate)}</div>
            <button className="sr-nav-btn sr-today-btn" onClick={goToday}>Hoje</button>
            <button className="sr-nav-btn" onClick={() => changeDay(1)} aria-label="Próximo dia">›</button>
          </nav>

          {/* timeline */}
          <Timeline bookings={bookings} currentDate={currentDate} />

          {/* form */}
          <section className="sr-panel">
            <h2 className="sr-panel-title">Nova reserva</h2>
            <form onSubmit={handleSubmit}>
              <div className="sr-row">
                <label className="sr-field">
                  Seu login
                  <input
                    className="sr-input"
                    type="text"
                    value={currentUser}
                    readOnly
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </label>
                <label className="sr-field">
                  Assunto
                  <input
                    className="sr-input"
                    type="text"
                    placeholder="Ex: Reunião de time"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="sr-row">
                <label className="sr-field">
                  Início
                  <input
                    className="sr-input"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </label>
                <label className="sr-field">
                  Fim
                  <input
                    className="sr-input"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </label>
              </div>
              <button type="submit" className="sr-submit" disabled={submitting}>
                {submitting ? <><span className="sr-spinner" />Reservando…</> : "Reservar horário"}
              </button>
            </form>
            {error && (
              <div className="sr-banner error">
                <strong>Não foi possível reservar.</strong><br />{error}
              </div>
            )}
            {success && <div className="sr-banner success">{success}</div>}
          </section>

          {/* booking list */}
          <section className="sr-panel">
            <h2 className="sr-panel-title">Reservas do dia</h2>
            <BookingList bookings={bookings} onCancel={handleCancel} currentUser={currentUser} />
          </section>

          <p className="sr-note">Conectado à API · {apiStatus}</p>
        </div>
      </div>
    </>
  );
}