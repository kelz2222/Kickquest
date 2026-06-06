import { useState, useEffect, useCallback } from "react";

const T = {
  bg:"#07100d", surface:"#0d1f18", card:"#0f2015", border:"#1a3525",
  gold:"#F5C518", lime:"#9EFF00", red:"#FF3535", white:"#F0EDE6",
  muted:"rgba(240,237,230,0.45)", faint:"rgba(240,237,230,0.08)",
};

const LOGO = "https://i.imgur.com/your-logo.png";

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
  } catch (e) { return { matches: [], error: e.message }; }
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
      team: a.source_id || "Football",
      time: timeAgo(a.pubDate),
      emoji: pickEmoji(a.title),
      url: a.link,
    }));
  } catch (e) { return null; }
}

async function fetchTeamNews(team) {
  const key = import.meta.env.VITE_NEWSDATA_API_KEY || "";
  const q = encodeURIComponent(team + " football");
  try {
    const r = await fetch(
      "https://newsdata.io/api/1/news?apikey=" + key + "&q=" + q + "&language=en&category=sports&size=5"
    );
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    return d.results || [];
  } catch (e) { return []; }
}

function timeAgo(pub) {
  if (!pub) return "recently";
  const m = Math.floor((Date.now() - new Date(pub)) / 60000);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}

function pickEmoji(t = "") {
  const s = t.toLowerCase();
  if (s.includes("injur") || s.includes("hurt")) return "🚑";
  if (s.includes("transfer") || s.includes("sign")) return "💰";
  if (s.includes("world cup") || s.includes("trophy")) return "🏆";
  if (s.includes("goal") || s.includes("win")) return "⚽";
  if (s.includes("squad") || s.includes("lineup")) return "👥";
  return "📰";
}

const FB_MATCHES = [
  { id: 1, homeTeam: { name: "🇧🇷 Brazil" }, awayTeam: { name: "🇩🇪 Germany" }, utcDate: new Date(Date.now() + 36e5).toISOString(), status: "SCHEDULED", score: { fullTime: { home: null, away: null } }, competition: { name: "World Cup 2026" } },
  { id: 2, homeTeam: { name: "🇫🇷 France" }, awayTeam: { name: "🇦🇷 Argentina" }, utcDate: new Date(Date.now() - 12e5).toISOString(), status: "IN_PLAY", score: { fullTime: { home: 1, away: 1 } }, competition: { name: "World Cup 2026" } },
  { id: 3, homeTeam: { name: "🇲🇦 Morocco" }, awayTeam: { name: "🇸🇳 Senegal" }, utcDate: new Date(Date.now() + 864e5).toISOString(), status: "SCHEDULED", score: { fullTime: { home: null, away: null } }, competition: { name: "AFCON" } },
  { id: 4, homeTeam: { name: "🇬🇭 Ghana" }, awayTeam: { name: "🇩🇿 Algeria" }, utcDate: new Date(Date.now() - 72e5).toISOString(), status: "FINISHED", score: { fullTime: { home: 2, away: 1 } }, competition: { name: "AFCON" } },
  { id: 5, homeTeam: { name: "🇪🇸 Spain" }, awayTeam: { name: "🇵🇹 Portugal" }, utcDate: new Date(Date.now() + 1728e5).toISOString(), status: "SCHEDULED", score: { fullTime: { home: null, away: null } }, competition: { name: "World Cup 2026" } },
];

const FB_NEWS = [
  { title: "Mbappe scores hat-trick as France edge Argentina", team: "France", time: "45m ago", emoji: "⚽" },
  { title: "Morocco stuns Spain with late winner", team: "Morocco", time: "1h ago", emoji: "🔥" },
  { title: "Vinicius Jr doubtful for Brazil opener", team: "Brazil", time: "2h ago", emoji: "🚑" },
  { title: "Salah named Egypt captain for World Cup", team: "Egypt", time: "3h ago", emoji: "👑" },
  { title: "Ghana FA confirms final 26-man squad", team: "Ghana", time: "4h ago", emoji: "👥" },
  { title: "Senegal book training base in New York", team: "Senegal", time: "5h ago", emoji: "✈️" },
];

const LEADERBOARD = [
  { rank: 1, name: "NaijaOracle", pts: 3240, streak: 9, avatar: "👑" },
  { rank: 2, name: "FootballGod_KE", pts: 2980, streak: 7, avatar: "🦁" },
  { rank: 3, name: "MoroccoMagic", pts: 2870, streak: 6, avatar: "⭐" },
  { rank: 4, name: "BantaKing_GH", pts: 2610, streak: 4, avatar: "🔥" },
  { rank: 5, name: "SoccerOracle_NG", pts: 2440, streak: 5, avatar: "🎯" },
  { rank: 6, name: "You", pts: 1890, streak: 2, avatar: "😎", isUser: true },
];

const INIT_BANTER = [
  { user: "NaijaOracle 👑", time: "2m", msg: "Can't wait for the World Cup! Who's winning it? 🔥", likes: 47 },
  { user: "BantaKing_GH 🔥", time: "8m", msg: "Ghana is going all the way. Don't test us 🇬🇭", likes: 93 },
  { user: "MoroccoMagic ⭐", time: "15m", msg: "Morocco reached the semis last time. This time we go all the way 🦁", likes: 61 },
  { user: "FootballGod_KE 🦁", time: "22m", msg: "Brazil haven't won since 2002. Their time is UP 💀", likes: 134 },
];

const REWARDS = [
  { id: 1, label: "100MB Data", icon: "📱", pts: 400, color: "#9EFF00" },
  { id: 2, label: "1GB Bundle", icon: "📶", pts: 800, color: "#F5C518" },
  { id: 3, label: "5GB Bundle", icon: "🚀", pts: 2200, color: "#FF9900" },
  { id: 4, label: "VIP League", icon: "👑", pts: 1000, color: "#c084fc" },
];

const fmt = iso => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtD = iso => new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
const sColor = s => s === "IN_PLAY" || s === "PAUSED" ? "#FF3535" : s === "FINISHED" ? "rgba(240,237,230,0.45)" : "#9EFF00";
const sLabel = s => s === "IN_PLAY" ? "LIVE" : s === "PAUSED" ? "HT" : s === "FINISHED" ? "FT" : "•";

function Dot({ color = "#FF3535" }) {
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: "0 0 6px " + color, animation: "pulse 1.1s infinite", marginRight: 5 }} />;
}

function Toast({ msg, color }) {
  return <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: color, color: "#071008", padding: "9px 20px", borderRadius: 30, fontSize: 12, fontWeight: 700, zIndex: 2000, whiteSpace: "nowrap", animation: "toastIn 0.3s ease-out", boxShadow: "0 4px 20px " + color + "60" }}>{msg}</div>;
}

function NavTab({ label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{ flex: 1, padding: "11px 2px 9px", border: "none", background: "transparent", color: active ? "#F5C518" : "rgba(240,237,230,0.45)", fontSize: 10, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.8, cursor: "pointer", borderBottom: active ? "2px solid #F5C518" : "2px solid transparent", transition: "all 0.2s", position: "relative" }}>
      {label}
      {badge && <span style={{ position: "absolute", top: 6, right: "50%", transform: "translateX(12px)", background: "#FF3535", borderRadius: 8, fontSize: 8, padding: "1px 4px", color: "#fff", fontFamily: "sans-serif" }}>{badge}</span>}
    </button>
  );
}

function MatchCard({ match, pred, onPredict }) {
  const live = match.status === "IN_PLAY" || match.status === "PAUSED";
  const done = match.status === "FINISHED";
  const hs = match.score?.fullTime?.home;
  const as = match.score?.fullTime?.away;
  return (
    <div style={{ background: live ? "linear-gradient(135deg,#1a1500,#0f2010)" : "#0f2015", border: "1px solid " + (live ? "#F5C51855" : "#1a3525"), borderRadius: 14, padding: "14px 15px", marginBottom: 10, position: "relative", overflow: "hidden", boxShadow: live ? "0 0 20px #F5C51815" : "none" }}>
      {live && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#F5C518,transparent)", animation: "shimmer 2s infinite" }} />}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
        <span style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>{(match.competition?.name || "FOOTBALL").toUpperCase()} · {fmtD(match.utcDate)}</span>
        <span style={{ display: "flex", alignItems: "center", fontSize: 10, color: sColor(match.status), fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>{live && <Dot />}{sLabel(match.status)}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ flex: 1, fontSize: 13, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, color: "#F0EDE6" }}>{match.homeTeam.name}</span>
        <div style={{ minWidth: 60, textAlign: "center" }}>
          {(live || done) && hs !== null
            ? <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: live ? "#F5C518" : "#F0EDE6", letterSpacing: 2 }}>{hs} – {as}</span>
            : <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 12, color: "rgba(240,237,230,0.45)" }}>{fmt(match.utcDate)}</span>
          }
        </div>
        <span style={{ flex: 1, textAlign: "right", fontSize: 13, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, color: "#F0EDE6" }}>{match.awayTeam.name}</span>
      </div>
      {!done && (pred
        ? <div style={{ background: "#9EFF0012", border: "1px solid #9EFF0035", borderRadius: 8, padding: "7px 12px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: "#9EFF00" }}>✓ Your pick: {pred.home} – {pred.away}</span>
            <span onClick={() => onPredict(match)} style={{ fontSize: 10, color: "rgba(240,237,230,0.45)", cursor: "pointer" }}>Edit</span>
          </div>
        : <button onClick={() => onPredict(match)} style={{ width: "100%", padding: 9, border: "none", borderRadius: 10, background: "linear-gradient(135deg,#9EFF00,#6abf00)", color: "#071008", fontFamily: "'Bebas Neue',sans-serif", fontSize: 12, letterSpacing: 2, cursor: "pointer" }}>⚡ PREDICT THIS MATCH</button>
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
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: "#0d1f18", border: "1px solid #1a3525", borderRadius: "22px 22px 0 0", padding: "20px 20px 34px", animation: "slideUp 0.3s ease-out" }}>
        <div style={{ width: 36, height: 4, background: "rgba(240,237,230,0.08)", borderRadius: 2, margin: "0 auto 18px" }} />
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "#F5C518", letterSpacing: 2, marginBottom: 4 }}>PREDICT SCORE</div>
        <div style={{ fontSize: 12, color: "rgba(240,237,230,0.45)", marginBottom: 18 }}>{match.homeTeam.name} vs {match.awayTeam.name}</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
          {[{ label: match.homeTeam.name, val: h, set: setH }, null, { label: match.awayTeam.name, val: a, set: setA }].map((item, i) =>
            item === null
              ? <span key={i} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "rgba(240,237,230,0.45)", paddingTop: 20 }}>—</span>
              : <div key={i} style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", marginBottom: 5, letterSpacing: 1 }}>{item.label}</div>
                  <input type="number" min="0" max="20" value={item.val} onChange={e => item.set(e.target.value)} placeholder="0"
                    style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #1a3525", background: "#0f2015", color: "#F0EDE6", fontSize: 24, fontFamily: "'Bebas Neue',sans-serif", textAlign: "center", boxSizing: "border-box", outline: "none" }} />
                </div>
          )}
        </div>
        <button disabled={!ok} onClick={() => { onSubmit(match.id, { home: h, away: a }); onClose(); }}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: ok ? "linear-gradient(135deg,#9EFF00,#6abf00)" : "rgba(240,237,230,0.08)", color: ok ? "#071008" : "rgba(240,237,230,0.45)", fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: 2, cursor: ok ? "pointer" : "default" }}>
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
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 390, background: "#0d1f18", border: "1px solid #1a3525", borderRadius: 18, padding: 22, animation: "slideUp 0.3s ease-out", maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: "#F5C518", letterSpacing: 2 }}>📰 {team.toUpperCase()} · LATEST</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(240,237,230,0.45)", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        {loading && <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(240,237,230,0.45)" }}><div style={{ fontSize: 30, animation: "spin 0.9s linear infinite", display: "inline-block" }}>⚽</div><div style={{ fontSize: 10, marginTop: 8, letterSpacing: 2 }}>SEARCHING...</div></div>}
        {!loading && articles.length === 0 && <div style={{ color: "rgba(240,237,230,0.45)", fontSize: 12, textAlign: "center", padding: "16px 0" }}>No recent news for {team}.</div>}
        {!loading && articles.map((a, i) => (
          <div key={i} style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#F0EDE6", lineHeight: 1.45, marginBottom: 5 }}>{a.title}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: "rgba(240,237,230,0.45)" }}>{timeAgo(a.pubDate)}</span>
              {a.link && <a href={a.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: "#9EFF00", textDecoration: "none" }}>Read →</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("matches");
  const [matches, setMatches] = useState(FB_MATCHES);
  const [matchLoading, setMatchLoading] = useState(true);
  const [matchError, setMatchError] = useState(null);
  const [news, setNews] = useState(FB_NEWS);
  const [newsLoading, setNewsLoading] = useState(false);
  const [predictModal, setPredictModal] = useState(null);
  const [teamModal, setTeamModal] = useState(null);
  const [preds, setPreds] = useState({});
  const [pts, setPts] = useState(1890);
  const [banter, setBanter] = useState(INIT_BANTER);
  const [banterInput, setBanterInput] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = "#9EFF00") => { setToast({ msg, color }); setTimeout(() => setToast(null), 2800); };

  const loadMatches = () => {
    setMatchLoading(true); setMatchError(null);
    fetchMatches().then(({ matches: m, error: e }) => { if (m.length) setMatches(m); setMatchError(e); setMatchLoading(false); });
  };
  useEffect(() => { loadMatches(); }, []);

  const loadNews = useCallback(() => {
    if (newsLoading) return;
    setNewsLoading(true);
    fetchNews().then(n => { if (n) setNews(n); setNewsLoading(false); });
  }, [newsLoading]);
  useEffect(() => { if (tab === "news") loadNews(); }, [tab]);

  const liveCount = matches.filter(m => m.status === "IN_PLAY" || m.status === "PAUSED").length;

  return (
    <div style={{ minHeight: "100vh", background: "#07100d", color: "#F0EDE6", fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(1.6)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(14px) translateX(-50%)} to{opacity:1;transform:translateY(0) translateX(-50%)} }
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance:none }
        input[type=number] { -moz-appearance:textfield }
        ::-webkit-scrollbar { width:0 }
      `}</style>

      {toast && <Toast msg={toast.msg} color={toast.color} />}

      <div style={{ background: "linear-gradient(180deg,#030a05 0%,#07100d 100%)", padding: "14px 14px 0", borderBottom: "1px solid #1a3525", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={LOGO} alt="KickQuest" style={{ width: 42, height: 42, objectFit: "contain", borderRadius: 8 }} />
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 3, background: "linear-gradient(135deg,#F5C518,#c49a10)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>KickQuest</div>
              <div style={{ fontSize: 7.5, color: "rgba(240,237,230,0.45)", letterSpacing: 2, marginTop: 1 }}>PREDICT · PLAY · WIN THE WORLD CUP</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {liveCount > 0 && <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,53,53,0.18)", border: "1px solid rgba(255,53,53,0.45)", borderRadius: 16, padding: "4px 10px" }}><Dot /><span style={{ fontSize: 10, color: "#FF3535", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>{liveCount} LIVE</span></div>}
            <div style={{ background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.38)", borderRadius: 18, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 12 }}>⚡</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, color: "#F5C518", letterSpacing: 1 }}>{pts.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          {[{ id: "matches", label: "MATCHES" }, { id: "news", label: "NEWS" }, { id: "banter", label: "BANTER", badge: 3 }, { id: "leaders", label: "LEADERS" }, { id: "rewards", label: "REWARDS" }]
            .map(t => <NavTab key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} badge={t.badge} />)}
        </div>
      </div>

      <div style={{ padding: "14px 14px 84px" }}>

        {tab === "matches" && (
          <div>
            {matchLoading && <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(240,237,230,0.45)" }}><div style={{ fontSize: 32, animation: "spin 0.9s linear infinite", display: "inline-block" }}>⚽</div><div style={{ fontSize: 10, marginTop: 8, letterSpacing: 2 }}>LOADING LIVE FIXTURES...</div></div>}
            {!matchLoading && matchError && (
              <div style={{ background: "rgba(255,53,53,0.1)", border: "1px solid rgba(255,53,53,0.3)", borderRadius: 12, padding: 16, textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#FF3535", marginBottom: 8 }}>Could not load fixtures. Check your API key.</div>
                <button onClick={loadMatches} style={{ background: "#FF3535", border: "none", borderRadius: 8, padding: "8px 18px", color: "#fff", fontSize: 11, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer" }}>RETRY</button>
              </div>
            )}
            {!matchLoading && !matchError && matches.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 16px" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏟️</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#F5C518", letterSpacing: 2, marginBottom: 6 }}>NO MATCHES TODAY</div>
                <div style={{ fontSize: 12, color: "rgba(240,237,230,0.45)", lineHeight: 1.6 }}>No fixtures in the next 14 days. Check back closer to the World Cup!</div>
              </div>
            )}
            {!matchLoading && matches.map(m => <MatchCard key={m.id} match={m} pred={preds[m.id]} onPredict={setPredictModal} />)}
            {!matchLoading && <button onClick={loadMatches} style={{ width: "100%", padding: 10, background: "rgba(240,237,230,0.08)", border: "1px solid #1a3525", borderRadius: 12, color: "rgba(240,237,230,0.45)", fontSize: 11, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer", marginTop: 4 }}>↻ REFRESH FIXTURES</button>}
          </div>
        )}

        {tab === "news" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2 }}>LIVE FOOTBALL NEWS · NEWSDATA.IO</div>
              <button onClick={loadNews} disabled={newsLoading} style={{ background: "rgba(240,237,230,0.08)", border: "1px solid #1a3525", borderRadius: 16, padding: "5px 12px", color: newsLoading ? "rgba(240,237,230,0.45)" : "#9EFF00", fontSize: 10, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer" }}>{newsLoading ? "LOADING..." : "↻ REFRESH"}</button>
            </div>
            {newsLoading && <div style={{ textAlign: "center", padding: "30px 0", color: "rgba(240,237,230,0.45)" }}><div style={{ fontSize: 32, animation: "spin 0.9s linear infinite", display: "inline-block" }}>⚽</div><div style={{ fontSize: 10, marginTop: 8, letterSpacing: 2 }}>FETCHING LIVE NEWS...</div></div>}
            {!newsLoading && news.map((item, i) => (
              <div key={i} style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div onClick={() => setTeamModal(item.team)} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(158,255,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, cursor: "pointer" }}>{item.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#F0EDE6", lineHeight: 1.45, marginBottom: 5 }}>{item.title}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span onClick={() => setTeamModal(item.team)} style={{ fontSize: 9, color: "#9EFF00", cursor: "pointer", letterSpacing: 1, textDecoration: "underline", textUnderlineOffset: 2 }}>{item.team?.toUpperCase()}</span>
                    <span style={{ fontSize: 9, color: "rgba(240,237,230,0.45)" }}>{item.time}</span>
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", fontSize: 9, color: "rgba(240,237,230,0.45)", textDecoration: "none" }}>Read →</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "banter" && (
          <div>
            <div style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
              <input value={banterInput} onChange={e => setBanterInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && banterInput.trim()) { setBanter(f => [{ user: "You 😎", time: "now", msg: banterInput, likes: 0 }, ...f]); setBanterInput(""); showToast("🗣️ Banter dropped!", "#F5C518"); } }}
                placeholder="Drop your hottest football take… 🔥"
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "#F0EDE6", fontSize: 13, fontFamily: "'Outfit',sans-serif", marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {["🔥", "😂", "💀", "👀", "🐐", "🫡"].map(e => <span key={e} style={{ fontSize: 18, cursor: "pointer" }} onClick={() => setBanterInput(v => v + e)}>{e}</span>)}
                <button onClick={() => { if (!banterInput.trim()) return; setBanter(f => [{ user: "You 😎", time: "now", msg: banterInput, likes: 0 }, ...f]); setBanterInput(""); showToast("🗣️ Banter dropped!", "#F5C518"); }}
                  style={{ marginLeft: "auto", background: "#9EFF00", border: "none", borderRadius: 8, padding: "5px 14px", color: "#071008", fontSize: 11, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, cursor: "pointer" }}>POST</button>
              </div>
            </div>
            {banter.map((b, i) => (
              <div key={i} style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#F5C518" }}>{b.user}</span>
                  <span style={{ fontSize: 9, color: "rgba(240,237,230,0.45)" }}>{b.time}</span>
                </div>
                <p style={{ fontSize: 13, margin: "0 0 8px", lineHeight: 1.5 }}>{b.msg}</p>
                <div style={{ display: "flex", gap: 14 }}>
                  <span onClick={() => setBanter(f => f.map((x, j) => j === i ? { ...x, likes: x.likes + 1 } : x))} style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", cursor: "pointer" }}>🔥 {b.likes}</span>
                  <span style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", cursor: "pointer" }}>↩ Reply</span>
                  <span style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", cursor: "pointer", marginLeft: "auto" }}>📤</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "leaders" && (
          <div>
            <div style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.28)", borderRadius: 14, padding: 18, marginBottom: 14, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2 }}>YOUR RANK</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, color: "#F5C518", lineHeight: 1 }}>#6</div>
              <div style={{ fontSize: 11, color: "rgba(240,237,230,0.45)" }}>550 pts behind Top 5</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 10 }}>
                {[["12", "CORRECT", "#9EFF00"], ["🔥 x2", "STREAK", "#F5C518"], ["1,890", "POINTS", "#F0EDE6"]].map(([v, l, c], i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: c }}>{v}</div>
                    <div style={{ fontSize: 8, color: "rgba(240,237,230,0.45)", letterSpacing: 1 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {LEADERBOARD.map((p, i) => (
              <div key={p.rank} style={{ background: p.isUser ? "linear-gradient(135deg,#0d2818,#112410)" : "#0f2015", border: "1px solid " + (p.isUser ? "rgba(158,255,0,0.38)" : "#1a3525"), borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: i === 0 ? "#F5C518" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "rgba(240,237,230,0.45)", minWidth: 26 }}>#{p.rank}</span>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: p.isUser ? "rgba(158,255,0,0.15)" : "rgba(240,237,230,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{p.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: p.isUser ? "#9EFF00" : "#F0EDE6" }}>{p.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)" }}>🔥 {p.streak} streak</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: p.isUser ? "#9EFF00" : "#F5C518" }}>{p.pts.toLocaleString()}</div>
                  <div style={{ fontSize: 8, color: "rgba(240,237,230,0.45)" }}>PTS</div>
                </div>
              </div>
            ))}
            <button style={{ width: "100%", padding: 12, background: "rgba(240,237,230,0.08)", border: "1px solid #1a3525", borderRadius: 12, color: "rgba(240,237,230,0.45)", fontSize: 12, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer", marginTop: 4 }}>📤 SHARE MY RANK</button>
          </div>
        )}

        {tab === "rewards" && (
          <div>
            <div style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.28)", borderRadius: 14, padding: 18, marginBottom: 18, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2 }}>AVAILABLE POINTS</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 50, color: "#F5C518", lineHeight: 1.1, letterSpacing: 2 }}>{pts.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", marginTop: 4 }}>⚡ Predict correctly to earn more</div>
            </div>
            <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2, marginBottom: 10 }}>REDEEM REWARDS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {REWARDS.map(r => (
                <button key={r.id} onClick={() => { if (pts < r.pts) { showToast("❌ Not enough points!", "#FF3535"); return; } setPts(p => p - r.pts); showToast("🎉 " + r.label + " redeemed!", "#F5C518"); }}
                  style={{ background: "#0f2015", border: "1px solid " + r.color + "38", borderRadius: 14, padding: "16px 10px", textAlign: "center", cursor: pts >= r.pts ? "pointer" : "not-allowed", opacity: pts >= r.pts ? 1 : 0.45, fontFamily: "inherit" }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{r.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: r.color, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: "#F5C518" }}>{r.pts.toLocaleString()} pts</div>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2, marginBottom: 10 }}>HOW TO EARN</div>
            {[["🎯", "Correct score", "+ 100 pts"], ["🏆", "Correct winner", "+ 50 pts"], ["⚡", "Daily streak", "+ 25/day"], ["📤", "Share TikTok/WhatsApp", "+ 20 pts"], ["👥", "Refer a friend", "+ 200 pts"]].map(([icon, label, val], i) => (
              <div key={i} style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 10, padding: "10px 14px", marginBottom: 7, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ flex: 1, fontSize: 12, color: "rgba(240,237,230,0.45)" }}>{label}</span>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: "#9EFF00", letterSpacing: 1 }}>{val}</span>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2, marginBottom: 10 }}>SPONSORS</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["🍺 Star Lager", "📱 MTN", "💰 Bet9ja", "⚽ PremierBet"].map((s, i) => (
                  <div key={i} style={{ background: "rgba(240,237,230,0.08)", border: "1px solid #1a3525", borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "rgba(240,237,230,0.45)" }}>{s}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#030a05", borderTop: "1px solid #1a3525", display: "flex", padding: "8px 0 18px" }}>
        {[{ id: "matches", icon: "⚽", label: "Matches" }, { id: "news", icon: "📰", label: "News" }, { id: "banter", icon: "🗣️", label: "Banter" }, { id: "leaders", icon: "🏆", label: "Leaders" }, { id: "rewards", icon: "🎁", label: "Rewards" }].map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, opacity: tab === n.id ? 1 : 0.35, transition: "opacity 0.2s", color: tab === n.id ? "#F5C518" : "#F0EDE6" }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span style={{ fontSize: 8, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>{n.label}</span>
          </button>
        ))}
      </div>

      {predictModal && <PredictModal match={predictModal} onClose={() => setPredictModal(null)} onSubmit={(id, pred) => { setPreds(p => ({ ...p, [id]: pred })); showToast("🎯 Prediction locked! +50pts if correct"); }} />}
      {teamModal && <TeamModal team={teamModal} onClose={() => setTeamModal(null)} />}
    </div>
  );
}
