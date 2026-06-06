import { useState, useEffect, useCallback } from "react";

const LOGO = "https://i.imgur.com/JJtXoXJ.png";

const T = {
  bg: "#07100d", surface: "#0d1f18", card: "#0f2015", border: "#1a3525",
  gold: "#F5C518", lime: "#9EFF00", red: "#FF3535", white: "#F0EDE6",
  muted: "rgba(240,237,230,0.45)", faint: "rgba(240,237,230,0.08)",
};

/* ── LIVE API ── */
async function fetchMatches() {
  const key = import.meta.env.VITE_FOOTBALL_API_KEY || "";
  const today = new Date().toISOString().split("T")[0];
  const next14 = new Date(Date.now() + 14 * 864e5).toISOString().split("T")[0];
  try {
    const r = await fetch(
      "https://api.football-data.org/v4/matches?dateFrom=" + today + "&dateTo=" + next14 + "&competitions=WC,PL,CL,PD,BL1,SA,FL1",
      { headers: { "X-Auth-Token": key } }
    );
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    return { matches: d.matches || [], error: null };
  } catch (e) {
    return { matches: [], error: e.message };
  }
}

async function fetchNews() {
  const key = import.meta.env.VITE_NEWSDATA_API_KEY || "";
  try {
    const r = await fetch(
      "https://newsdata.io/api/1/news?apikey=" + key + "&q=football+soccer&language=en&category=sports&size=8"
    );
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    return (d.results || []).map(a => ({
      title: a.title,
      source: a.source_id || "Football",
      time: timeAgo(a.pubDate),
      emoji: pickEmoji(a.title),
      url: a.link,
    }));
  } catch (e) {
    return null;
  }
}

async function fetchTeamNews(team) {
  const key = import.meta.env.VITE_NEWSDATA_API_KEY || "";
  const q = encodeURIComponent(team + " football");
  try {
    const r = await fetch(
      "https://newsdata.io/api/1/news?apikey=" + key + "&q=" + q + "&language=en&category=sports&size=6"
    );
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    return d.results || [];
  } catch (e) {
    return [];
  }
}

function timeAgo(pub) {
  if (!pub) return "recently";
  const m = Math.floor((Date.now() - new Date(pub)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}

function pickEmoji(t = "") {
  const s = t.toLowerCase();
  if (s.includes("injur") || s.includes("hurt") || s.includes("doubt")) return "🚑";
  if (s.includes("transfer") || s.includes("sign") || s.includes("deal")) return "💰";
  if (s.includes("world cup") || s.includes("trophy") || s.includes("champion")) return "🏆";
  if (s.includes("goal") || s.includes("score") || s.includes("win") || s.includes("beat")) return "⚽";
  if (s.includes("squad") || s.includes("lineup") || s.includes("team")) return "👥";
  if (s.includes("red card") || s.includes("ban") || s.includes("suspend")) return "🟥";
  if (s.includes("manager") || s.includes("coach") || s.includes("sack")) return "🧑‍💼";
  return "📰";
}

const fmt = iso => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtD = iso => new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
const sColor = s => s === "IN_PLAY" || s === "PAUSED" ? T.red : s === "FINISHED" ? T.muted : T.lime;
const sLabel = s => s === "IN_PLAY" ? "LIVE" : s === "PAUSED" ? "HT" : s === "FINISHED" ? "FT" : "SOON";

/* ── COMPONENTS ── */
function Dot({ color = T.red }) {
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: "0 0 6px " + color, animation: "pulse 1.1s infinite", marginRight: 5 }} />;
}

function Toast({ msg, color }) {
  return (
    <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: color, color: "#071008", padding: "9px 20px", borderRadius: 30, fontSize: 12, fontWeight: 700, zIndex: 2000, whiteSpace: "nowrap", animation: "toastIn 0.3s ease-out", boxShadow: "0 4px 20px " + color + "60" }}>
      {msg}
    </div>
  );
}

function NavTab({ label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{ flex: 1, padding: "11px 2px 9px", border: "none", background: "transparent", color: active ? T.gold : T.muted, fontSize: 10, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.8, cursor: "pointer", borderBottom: active ? "2px solid " + T.gold : "2px solid transparent", transition: "all 0.2s", position: "relative" }}>
      {label}
      {badge && <span style={{ position: "absolute", top: 6, right: "50%", transform: "translateX(12px)", background: T.red, borderRadius: 8, fontSize: 8, padding: "1px 4px", color: "#fff", fontFamily: "sans-serif" }}>{badge}</span>}
    </button>
  );
}

function MatchCard({ match, pred, onPredict }) {
  const live = match.status === "IN_PLAY" || match.status === "PAUSED";
  const done = match.status === "FINISHED";
  const hs = match.score?.fullTime?.home;
  const as = match.score?.fullTime?.away;
  return (
    <div style={{ background: live ? "linear-gradient(135deg,#1a1500,#0f2010)" : T.card, border: "1px solid " + (live ? T.gold + "55" : T.border), borderRadius: 14, padding: "14px 15px", marginBottom: 10, position: "relative", overflow: "hidden", boxShadow: live ? "0 0 20px " + T.gold + "15" : "none" }}>
      {live && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent," + T.gold + ",transparent)", animation: "shimmer 2s infinite" }} />}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
        <span style={{ fontSize: 9, color: T.muted, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>
          {(match.competition?.name || "FOOTBALL").toUpperCase()} · {fmtD(match.utcDate)}
        </span>
        <span style={{ display: "flex", alignItems: "center", fontSize: 10, color: sColor(match.status), fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>
          {live && <Dot />}{sLabel(match.status)}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ flex: 1, fontSize: 13, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, color: T.white }}>{match.homeTeam.name}</span>
        <div style={{ minWidth: 70, textAlign: "center" }}>
          {(live || done) && hs !== null
            ? <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: live ? T.gold : T.white, letterSpacing: 3 }}>{hs} – {as}</span>
            : <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: T.muted }}>{fmt(match.utcDate)}</span>
          }
        </div>
        <span style={{ flex: 1, textAlign: "right", fontSize: 13, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, color: T.white }}>{match.awayTeam.name}</span>
      </div>
      {!done && (
        pred
          ? <div style={{ background: T.lime + "12", border: "1px solid " + T.lime + "35", borderRadius: 8, padding: "7px 12px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: T.lime }}>✓ Your pick: {pred.home} – {pred.away}</span>
              <span onClick={() => onPredict(match)} style={{ fontSize: 10, color: T.muted, cursor: "pointer" }}>Edit</span>
            </div>
          : <button onClick={() => onPredict(match)} style={{ width: "100%", padding: 10, border: "none", borderRadius: 10, background: "linear-gradient(135deg," + T.lime + ",#6abf00)", color: "#071008", fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 2, cursor: "pointer", fontWeight: 700 }}>
              ⚡ PREDICT THIS MATCH
            </button>
      )}
    </div>
  );
}

function PredictModal({ match, onClose, onSubmit }) {
  const [h, setH] = useState("");
  const [a, setA] = useState("");
  const ok = h !== "" && a !== "";
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", zIndex: 1000 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: T.surface, border: "1px solid " + T.border, borderRadius: "22px 22px 0 0", padding: "20px 20px 40px", animation: "slideUp 0.3s ease-out" }}>
        <div style={{ width: 36, height: 4, background: T.faint, borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: T.gold, letterSpacing: 2, marginBottom: 4 }}>PREDICT SCORE</div>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 20 }}>{match.homeTeam.name} vs {match.awayTeam.name}</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
          {[{ label: match.homeTeam.name, val: h, set: setH }, null, { label: match.awayTeam.name, val: a, set: setA }].map((item, i) =>
            item === null
              ? <span key={i} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: T.muted, paddingTop: 22 }}>—</span>
              : <div key={i} style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: T.muted, marginBottom: 6, letterSpacing: 1 }}>{item.label}</div>
                  <input type="number" min="0" max="20" value={item.val} onChange={e => item.set(e.target.value)} placeholder="0"
                    style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1px solid " + T.border, background: T.card, color: T.white, fontSize: 28, fontFamily: "'Bebas Neue',sans-serif", textAlign: "center", boxSizing: "border-box", outline: "none" }} />
                </div>
          )}
        </div>
        <button disabled={!ok} onClick={() => { onSubmit(match.id, { home: h, away: a }); onClose(); }}
          style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: ok ? "linear-gradient(135deg," + T.lime + ",#6abf00)" : T.faint, color: ok ? "#071008" : T.muted, fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 2, cursor: ok ? "pointer" : "default", fontWeight: 700 }}>
          LOCK IN ⚡
        </button>
      </div>
    </div>
  );
}

function TeamModal({ team, onClose }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTeamNews(team).then(a => { setArticles(a); setLoading(false); });
  }, [team]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 390, background: T.surface, border: "1px solid " + T.border, borderRadius: 20, padding: 22, maxHeight: "80vh", overflowY: "auto", animation: "slideUp 0.3s ease-out" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: T.gold, letterSpacing: 2 }}>📰 {team.toUpperCase()} · LATEST NEWS</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {loading && (
          <div style={{ textAlign: "center", padding: "28px 0", color: T.muted }}>
            <div style={{ fontSize: 32, animation: "spin 0.9s linear infinite", display: "inline-block" }}>⚽</div>
            <div style={{ fontSize: 10, marginTop: 8, letterSpacing: 2 }}>SEARCHING LIVE NEWS...</div>
          </div>
        )}
        {!loading && articles.length === 0 && <div style={{ color: T.muted, fontSize: 12, textAlign: "center", padding: "20px 0" }}>No recent news found for {team}.</div>}
        {!loading && articles.map((a, i) => (
          <div key={i} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: T.white, lineHeight: 1.5, marginBottom: 6 }}>{a.title}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: T.muted }}>{timeAgo(a.pubDate)}</span>
              {a.link && <a href={a.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: T.lime, textDecoration: "none" }}>Read full story →</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── MAIN APP ── */
export default function App() {
  const [tab, setTab] = useState("matches");
  const [matches, setMatches] = useState([]);
  const [matchLoading, setMatchLoading] = useState(true);
  const [matchError, setMatchError] = useState(null);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(false);
  const [predictModal, setPredictModal] = useState(null);
  const [teamModal, setTeamModal] = useState(null);
  const [preds, setPreds] = useState({});
  const [pts, setPts] = useState(0);
  const [banter, setBanter] = useState([
    { user: "NaijaOracle 👑", time: "2m", msg: "Can't wait for the World Cup! Who's winning it? 🔥", likes: 47 },
    { user: "BantaKing_GH 🔥", time: "8m", msg: "Ghana is going all the way. Don't test us 🇬🇭", likes: 93 },
    { user: "MoroccoMagic ⭐", time: "15m", msg: "Morocco reached the semis last time. This time we go all the way 🦁", likes: 61 },
    { user: "FootballGod_KE 🦁", time: "22m", msg: "Brazil haven't won since 2002. Their time is UP 💀", likes: 134 },
  ]);
  const [banterInput, setBanterInput] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = T.lime) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2800);
  };

  const loadMatches = () => {
    setMatchLoading(true);
    setMatchError(null);
    fetchMatches().then(({ matches: m, error: e }) => {
      setMatches(m);
      setMatchError(e);
      setMatchLoading(false);
    });
  };

  const loadNews = useCallback(() => {
    if (newsLoading) return;
    setNewsLoading(true);
    setNewsError(false);
    fetchNews().then(n => {
      if (n) setNews(n);
      else setNewsError(true);
      setNewsLoading(false);
    });
  }, [newsLoading]);

  useEffect(() => { loadMatches(); }, []);
  useEffect(() => { if (tab === "news") loadNews(); }, [tab]);

  const liveCount = matches.filter(m => m.status === "IN_PLAY" || m.status === "PAUSED").length;
  const correctP
