import { useState, useEffect, useCallback } from "react";

const LOGO = "https://i.imgur.com/JJtXoXJ.png";
const GOOGLE_CLIENT_ID = "185644125904-65hkerj2lu9maacgv5j91g33ief1rm5c.apps.googleusercontent.com";
const SPORTS_API_KEY = "ed60517becbff08b77f62d282d0886ca";

const T = {
  bg: "#07100d", surface: "#0d1f18", card: "#0f2015", border: "#1a3525",
  gold: "#F5C518", lime: "#9EFF00", red: "#FF3535", white: "#F0EDE6",
  muted: "rgba(240,237,230,0.45)", faint: "rgba(240,237,230,0.08)",
};

const WC_DATE = new Date("2026-06-11T18:00:00Z");

function getCountdown() {
  const now = new Date();
  const diff = WC_DATE - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, mins, secs };
}

async function fetchFixtures() {
  const today = new Date().toISOString().split("T")[0];
  const next14 = new Date(Date.now() + 14 * 864e5).toISOString().split("T")[0];
  try {
    const r = await fetch(
      "https://v3.football.api-sports.io/fixtures?from=" + today + "&to=" + next14 + "&league=1&season=2026",
      { headers: { "x-apisports-key": SPORTS_API_KEY } }
    );
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    const wcMatches = d.response || [];
    const r2 = await fetch(
      "https://v3.football.api-sports.io/fixtures?from=" + today + "&to=" + next14 + "&league=39&season=2024",
      { headers: { "x-apisports-key": SPORTS_API_KEY } }
    );
    const d2 = await r2.json();
    const plMatches = d2.response || [];
    const all = [...wcMatches, ...plMatches].slice(0, 20);
    return { matches: all, error: null };
  } catch (e) {
    return { matches: [], error: e.message };
  }
}

async function fetchNews() {
  const key = import.meta.env.VITE_NEWSDATA_API_KEY || "";
  try {
    const r = await fetch(
      "https://newsdata.io/api/1/news?apikey=" + key + "&q=football+soccer+world+cup+2026&language=en&category=sports&size=10"
    );
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    return (d.results || []).map(function(a) {
      return {
        title: a.title,
        source: a.source_id || "Football",
        time: timeAgo(a.pubDate),
        emoji: pickEmoji(a.title),
        url: a.link,
      };
    });
  } catch (e) {
    return null;
  }
}

async function fetchTeamNews(team) {
  const key = import.meta.env.VITE_NEWSDATA_API_KEY || "";
  const q = encodeURIComponent(team + " football 2026");
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

function pickEmoji(t) {
  if (!t) return "📰";
  const s = t.toLowerCase();
  if (s.includes("injur") || s.includes("hurt")) return "🚑";
  if (s.includes("transfer") || s.includes("sign")) return "💰";
  if (s.includes("world cup") || s.includes("trophy")) return "🏆";
  if (s.includes("goal") || s.includes("win")) return "⚽";
  if (s.includes("squad") || s.includes("lineup")) return "👥";
  if (s.includes("red card") || s.includes("ban")) return "🟥";
  if (s.includes("manager") || s.includes("coach")) return "🧑‍💼";
  return "📰";
}

function fmt(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtD(iso) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

function loadGoogleScript(cb) {
  if (document.getElementById("google-gsi")) { cb(); return; }
  const s = document.createElement("script");
  s.id = "google-gsi";
  s.src = "https://accounts.google.com/gsi/client";
  s.onload = cb;
  document.head.appendChild(s);
}

function Dot() {
  return (
    <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#FF3535", boxShadow: "0 0 6px #FF3535", animation: "pulse 1.1s infinite", marginRight: 5 }} />
  );
}

function Toast(props) {
  return (
    <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: props.color, color: "#071008", padding: "9px 20px", borderRadius: 30, fontSize: 12, fontWeight: 700, zIndex: 2000, whiteSpace: "nowrap", animation: "toastIn 0.3s ease-out", boxShadow: "0 4px 20px " + props.color + "60" }}>
      {props.msg}
    </div>
  );
}

function NavTab(props) {
  return (
    <button onClick={props.onClick} style={{ flex: 1, padding: "11px 2px 9px", border: "none", background: "transparent", color: props.active ? "#F5C518" : "rgba(240,237,230,0.45)", fontSize: 10, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.8, cursor: "pointer", borderBottom: props.active ? "2px solid #F5C518" : "2px solid transparent", transition: "all 0.2s" }}>
      {props.label}
    </button>
  );
}

function CountdownBanner() {
  const [cd, setCd] = useState(getCountdown());
  useEffect(function() {
    const t = setInterval(function() { setCd(getCountdown()); }, 1000);
    return function() { clearInterval(t); };
  }, []);
  if (!cd) return (
    <div style={{ background: "linear-gradient(135deg,#1a1500,#0f2010)", border: "1px solid #F5C51855", borderRadius: 14, padding: "14px 16px", marginBottom: 12, textAlign: "center" }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "#F5C518", letterSpacing: 2 }}>THE WORLD CUP IS HERE!</div>
    </div>
  );
  return (
    <div style={{ background: "linear-gradient(135deg,#1a1500,#0a1a08)", border: "1px solid #F5C51840", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
      <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2, marginBottom: 8, textAlign: "center" }}>WORLD CUP 2026 KICKS OFF IN</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        {[
          { v: cd.days, l: "DAYS" },
          { v: cd.hours, l: "HRS" },
          { v: cd.mins, l: "MINS" },
          { v: cd.secs, l: "SECS" },
        ].map(function(item, i) {
          return (
            <div key={i} style={{ flex: 1, background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)", borderRadius: 10, padding: "10px 4px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: "#F5C518", lineHeight: 1 }}>{String(item.v).padStart(2, "0")}</div>
              <div style={{ fontSize: 7, color: "rgba(240,237,230,0.45)", letterSpacing: 1.5, marginTop: 3 }}>{item.l}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: 9, color: "rgba(240,237,230,0.45)" }}>
        June 11, 2026 - USA - Canada - Mexico
      </div>
    </div>
  );
}

function MatchCard(props) {
  const match = props.match;
  const pred = props.pred;
  const onPredict = props.onPredict;
  const home = match.teams ? match.teams.home.name : (match.homeTeam ? match.homeTeam.name : "Home");
  const away = match.teams ? match.teams.away.name : (match.awayTeam ? match.awayTeam.name : "Away");
  const homeLogo = match.teams ? match.teams.home.logo : null;
  const awayLogo = match.teams ? match.teams.away.logo : null;
  const status = match.fixture ? match.fixture.status.short : match.status;
  const dateIso = match.fixture ? match.fixture.date : match.utcDate;
  const compName = match.league ? match.league.name : (match.competition ? match.competition.name : "Football");
  const hs = match.goals ? match.goals.home : (match.score && match.score.fullTime ? match.score.fullTime.home : null);
  const as = match.goals ? match.goals.away : (match.score && match.score.fullTime ? match.score.fullTime.away : null);
  const elapsed = match.fixture && match.fixture.status.elapsed ? match.fixture.status.elapsed + "'" : "";
  const live = status === "1H" || status === "2H" || status === "HT" || status === "ET" || status === "IN_PLAY" || status === "PAUSED";
  const done = status === "FT" || status === "AET" || status === "PEN" || status === "FINISHED";
  const id = match.fixture ? match.fixture.id : match.id;

  return (
    <div style={{ background: live ? "linear-gradient(135deg,#1a1500,#0f2010)" : "#0f2015", border: "1px solid " + (live ? "#F5C51855" : "#1a3525"), borderRadius: 14, padding: "14px 15px", marginBottom: 10, position: "relative", overflow: "hidden", boxShadow: live ? "0 0 20px #F5C51815" : "none" }}>
      {live && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#F5C518,transparent)", animation: "shimmer 2s infinite" }} />}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
        <span style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>
          {compName.toUpperCase()} - {fmtD(dateIso)}
        </span>
        <span style={{ display: "flex", alignItems: "center", fontSize: 10, color: live ? "#FF3535" : done ? "rgba(240,237,230,0.45)" : "#9EFF00", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>
          {live && <Dot />}
          {live ? (elapsed || "LIVE") : done ? "FT" : fmt(dateIso)}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
          {homeLogo && <img src={homeLogo} alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />}
          <span style={{ fontSize: 13, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, color: "#F0EDE6" }}>{home}</span>
        </div>
        <div style={{ minWidth: 70, textAlign: "center" }}>
          {(live || done) && hs !== null
            ? <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: live ? "#F5C518" : "#F0EDE6", letterSpacing: 3 }}>{hs} - {as}</span>
            : <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: "rgba(240,237,230,0.45)" }}>VS</span>
          }
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 13, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, color: "#F0EDE6", textAlign: "right" }}>{away}</span>
          {awayLogo && <img src={awayLogo} alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />}
        </div>
      </div>
      {!done && (
        pred
          ? (
            <div style={{ background: "rgba(158,255,0,0.08)", border: "1px solid rgba(158,255,0,0.3)", borderRadius: 8, padding: "7px 12px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "#9EFF00" }}>Your pick: {pred.home} - {pred.away}</span>
              <span onClick={function() { onPredict(match); }} style={{ fontSize: 10, color: "rgba(240,237,230,0.45)", cursor: "pointer" }}>Edit</span>
            </div>
          )
          : (
            <button onClick={function() { onPredict(match); }} style={{ width: "100%", padding: 10, border: "none", borderRadius: 10, background: "linear-gradient(135deg,#9EFF00,#6abf00)", color: "#071008", fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 2, cursor: "pointer", fontWeight: 700 }}>
              PREDICT THIS MATCH
            </button>
          )
      )}
    </div>
  );
}

function PredictModal(props) {
  const match = props.match;
  const home = match.teams ? match.teams.home.name : (match.homeTeam ? match.homeTeam.name : "Home");
  const away = match.teams ? match.teams.away.name : (match.awayTeam ? match.awayTeam.name : "Away");
  const id = match.fixture ? match.fixture.id : match.id;
  const [h, setH] = useState("");
  const [a, setA] = useState("");
  const ok = h !== "" && a !== "";
  return (
    <div onClick={props.onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", zIndex: 1000 }}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: "#0d1f18", border: "1px solid #1a3525", borderRadius: "22px 22px 0 0", padding: "20px 20px 40px", animation: "slideUp 0.3s ease-out" }}>
        <div style={{ width: 36, height: 4, background: "rgba(240,237,230,0.08)", borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#F5C518", letterSpacing: 2, marginBottom: 4 }}>PREDICT SCORE</div>
        <div style={{ fontSize: 12, color: "rgba(240,237,230,0.45)", marginBottom: 20 }}>{home} vs {away}</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", marginBottom: 6, letterSpacing: 1 }}>{home}</div>
            <input type="number" min="0" max="20" value={h} onChange={function(e) { setH(e.target.value); }} placeholder="0"
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1px solid #1a3525", background: "#0f2015", color: "#F0EDE6", fontSize: 28, fontFamily: "'Bebas Neue',sans-serif", textAlign: "center", boxSizing: "border-box", outline: "none" }} />
          </div>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "rgba(240,237,230,0.45)", paddingTop: 22 }}>-</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", marginBottom: 6, letterSpacing: 1 }}>{away}</div>
            <input type="number" min="0" max="20" value={a} onChange={function(e) { setA(e.target.value); }} placeholder="0"
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1px solid #1a3525", background: "#0f2015", color: "#F0EDE6", fontSize: 28, fontFamily: "'Bebas Neue',sans-serif", textAlign: "center", boxSizing: "border-box", outline: "none" }} />
          </div>
        </div>
        <button disabled={!ok} onClick={function() { props.onSubmit(id, { home: h, away: a }); props.onClose(); }}
          style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: ok ? "linear-gradient(135deg,#9EFF00,#6abf00)" : "rgba(240,237,230,0.08)", color: ok ? "#071008" : "rgba(240,237,230,0.45)", fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 2, cursor: ok ? "pointer" : "default", fontWeight: 700 }}>
          LOCK IN
        </button>
      </div>
    </div>
  );
}

function TeamModal(props) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(function() {
    fetchTeamNews(props.team).then(function(a) { setArticles(a); setLoading(false); });
  }, [props.team]);
  return (
    <div onClick={props.onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{ width: "100%", maxWidth: 390, background: "#0d1f18", border: "1px solid #1a3525", borderRadius: 20, padding: 22, maxHeight: "80vh", overflowY: "auto", animation: "slideUp 0.3s ease-out" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: "#F5C518", letterSpacing: 2 }}>{props.team.toUpperCase()} - NEWS</div>
          <button onClick={props.onClose} style={{ background: "none", border: "none", color: "rgba(240,237,230,0.45)", fontSize: 20, cursor: "pointer" }}>X</button>
        </div>
        {loading && (
          <div style={{ textAlign: "center", padding: "28px 0", color: "rgba(240,237,230,0.45)" }}>
            <div style={{ fontSize: 32, animation: "spin 0.9s linear infinite", display: "inline-block" }}>⚽</div>
            <div style={{ fontSize: 10, marginTop: 8, letterSpacing: 2 }}>LOADING...</div>
          </div>
        )}
        {!loading && articles.length === 0 && (
          <div style={{ color: "rgba(240,237,230,0.45)", fontSize: 12, textAlign: "center", padding: "20px 0" }}>No recent news for {props.team}.</div>
        )}
        {!loading && articles.map(function(a, i) {
          return (
            <div key={i} style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "#F0EDE6", lineHeight: 1.5, marginBottom: 6 }}>{a.title}</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, color: "rgba(240,237,230,0.45)" }}>{timeAgo(a.pubDate)}</span>
                {a.link && <a href={a.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: "#9EFF00", textDecoration: "none" }}>Read</a>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoginScreen(props) {
  useEffect(function() {
    loadGoogleScript(function() {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: function(response) {
          const parts = response.credential.split(".");
          const payload = JSON.parse(atob(parts[1]));
          props.onLogin({
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            id: payload.sub,
          });
        },
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: "filled_black", size: "large", width: 280, text: "signin_with" }
      );
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#07100d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        * { box-sizing:border-box }
      `}</style>
      <img src={LOGO} alt="KickQuest" style={{ width: 120, height: 120, objectFit: "contain", marginBottom: 20, animation: "float 3s ease-in-out infinite" }} />
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 38, letterSpacing: 4, background: "linear-gradient(135deg,#F5C518,#c49a10)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6, textAlign: "center" }}>
        KICKQUEST
      </div>
      <div style={{ fontSize: 12, color: "rgba(240,237,230,0.45)", letterSpacing: 2, marginBottom: 40, textAlign: "center" }}>
        PREDICT - PLAY - WIN THE WORLD CUP
      </div>
      <div style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 20, padding: "28px 24px", width: "100%", maxWidth: 340, textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 12 }}>⚽🏆🎯</div>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#F5C518", letterSpacing: 2, marginBottom: 8 }}>JOIN THE GAME</div>
        <div style={{ fontSize: 12, color: "rgba(240,237,230,0.45)", lineHeight: 1.6, marginBottom: 24 }}>
          Sign in to predict matches, earn points, and compete on the leaderboard.
        </div>
        <div id="google-btn" style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}></div>
        <div style={{ fontSize: 10, color: "rgba(240,237,230,0.45)", marginTop: 12 }}>Free to join. No credit card needed.</div>
      </div>
      <div style={{ marginTop: 32, display: "flex", gap: 24, textAlign: "center" }}>
        {[["🎯", "Predict", "Match scores"], ["🏆", "Earn", "Points & badges"], ["🎁", "Win", "Data & airtime"]].map(function(item, i) {
          return (
            <div key={i}>
              <div style={{ fontSize: 24 }}>{item[0]}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: "#F5C518", letterSpacing: 1 }}>{item[1]}</div>
              <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)" }}>{item[2]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
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
    { user: "NaijaOracle", time: "2m", msg: "Can't wait for the World Cup! Who's winning it?", likes: 47, avatar: "👑" },
    { user: "BantaKing_GH", time: "8m", msg: "Ghana is going all the way. Don't test us!", likes: 93, avatar: "🇬🇭" },
    { user: "MoroccoMagic", time: "15m", msg: "Morocco reached the semis last time. This time we go all the way!", likes: 61, avatar: "🌟" },
    { user: "FootballGod_KE", time: "22m", msg: "Brazil haven't won since 2002. Their time is UP.", likes: 134, avatar: "🦁" },
    { user: "SoccerOracle_NG", time: "30m", msg: "Argentina defending champions. New era begins now.", likes: 88, avatar: "🎯" },
  ]);
  const [banterInput, setBanterInput] = useState("");
  const [toast, setToast] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  function showToast(msg, color) {
    setToast({ msg: msg, color: color || "#9EFF00" });
    setTimeout(function() { setToast(null); }, 2800);
  }

  function updateLeaderboard(userData, userPts, userPreds) {
    const stored = localStorage.getItem("kq_leaderboard");
    let board = stored ? JSON.parse(stored) : [];
    const idx = board.findIndex(function(x) { return x.id === userData.id; });
    const entry = { id: userData.id, name: userData.name, picture: userData.picture, pts: userPts, preds: Object.keys(userPreds).length };
    if (idx >= 0) board[idx] = entry;
    else board.push(entry);
    board.sort(function(a, b) { return b.pts - a.pts; });
    board = board.slice(0, 20);
    localStorage.setItem("kq_leaderboard", JSON.stringify(board));
    setLeaderboard(board);
  }

  function handleLogin(userData) {
    setUser(userData);
    const savedPts = localStorage.getItem("kq_pts_" + userData.id);
    const savedPreds = localStorage.getItem("kq_preds_" + userData.id);
    const loadedPts = savedPts ? parseInt(savedPts) : 0;
    const loadedPreds = savedPreds ? JSON.parse(savedPreds) : {};
    setPts(loadedPts);
    setPreds(loadedPreds);
    updateLeaderboard(userData, loadedPts, loadedPreds);
    showToast("Welcome, " + userData.name.split(" ")[0] + "!", "#F5C518");
  }

  function handleLogout() {
    if (window.google) window.google.accounts.id.disableAutoSelect();
    setUser(null);
    setPts(0);
    setPreds({});
    setShowProfile(false);
  }

  function addPoints(amount) {
    setPts(function(p) {
      const newPts = p + amount;
      if (user) {
        localStorage.setItem("kq_pts_" + user.id, String(newPts));
        updateLeaderboard(user, newPts, preds);
      }
      return newPts;
    });
  }

  function savePred(id, pred) {
    setPreds(function(p) {
      const newPreds = Object.assign({}, p);
      newPreds[id] = pred;
      if (user) localStorage.setItem("kq_preds_" + user.id, JSON.stringify(newPreds));
      updateLeaderboard(user, pts, newPreds);
      return newPreds;
    });
  }

  function loadMatches() {
    setMatchLoading(true);
    setMatchError(null);
    fetchFixtures().then(function(result) {
      setMatches(result.matches);
      setMatchError(result.error);
      setMatchLoading(false);
    });
  }

  const loadNews = useCallback(function() {
    if (newsLoading) return;
    setNewsLoading(true);
    setNewsError(false);
    fetchNews().then(function(n) {
      if (n) setNews(n);
      else setNewsError(true);
      setNewsLoading(false);
    });
  }, [newsLoading]);

  useEffect(function() {
    const stored = localStorage.getItem("kq_leaderboard");
    if (stored) setLeaderboard(JSON.parse(stored));
    loadMatches();
  }, []);

  useEffect(function() {
    if (tab === "news") loadNews();
  }, [tab]);

  const liveCount = matches.filter(function(m) {
    const s = m.fixture ? m.fixture.status.short : m.status;
    return s === "1H" || s === "2H" || s === "HT" || s === "ET" || s === "IN_PLAY";
  }).length;

  const predCount = Object.keys(preds).length;
  const myRank = user ? leaderboard.findIndex(function(x) { return x.id === user.id; }) + 1 : 0;

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={{ minHeight: "100vh", background: "#07100d", color: "#F0EDE6", fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(1.6)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(14px) translateX(-50%)} to{opacity:1;transform:translateY(0) translateX(-50%)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent }
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button { -webkit-appearance:none }
        input[type=number] { -moz-appearance:textfield }
        ::-webkit-scrollbar { width:0 }
      `}</style>

      {toast && <Toast msg={toast.msg} color={toast.color} />}

      {showProfile && (
        <div onClick={function() { setShowProfile(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", zIndex: 1000 }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: "#0d1f18", border: "1px solid #1a3525", borderRadius: "22px 22px 0 0", padding: "24px 20px 40px", animation: "slideUp 0.3s ease-out" }}>
            <div style={{ width: 36, height: 4, background: "rgba(240,237,230,0.08)", borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <img src={user.picture} alt="" style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid #F5C518" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#F0EDE6" }}>{user.name}</div>
                <div style={{ fontSize: 11, color: "rgba(240,237,230,0.45)" }}>{user.email}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[[pts, "POINTS"], [predCount, "PREDICTIONS"], [myRank > 0 ? "#" + myRank : "-", "RANK"]].map(function(item, i) {
                return (
                  <div key={i} style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#F5C518" }}>{item[0]}</div>
                    <div style={{ fontSize: 8, color: "rgba(240,237,230,0.45)", letterSpacing: 1 }}>{item[1]}</div>
                  </div>
                );
              })}
            </div>
            <button onClick={handleLogout} style={{ width: "100%", padding: 14, background: "rgba(255,53,53,0.15)", border: "1px solid rgba(255,53,53,0.4)", borderRadius: 12, color: "#FF3535", fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: 2, cursor: "pointer" }}>
              SIGN OUT
            </button>
          </div>
        </div>
      )}

      <div style={{ background: "linear-gradient(180deg,#020805 0%,#07100d 100%)", padding: "14px 14px 0", borderBottom: "1px solid #1a3525", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={LOGO} alt="KickQuest" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 10 }} />
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 3, background: "linear-gradient(135deg,#F5C518,#c49a10)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>KickQuest</div>
              <div style={{ fontSize: 7.5, color: "rgba(240,237,230,0.45)", letterSpacing: 2, marginTop: 1 }}>PREDICT - PLAY - WIN THE WORLD CUP</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {liveCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,53,53,0.18)", border: "1px solid rgba(255,53,53,0.45)", borderRadius: 16, padding: "4px 10px" }}>
                <Dot />
                <span style={{ fontSize: 10, color: "#FF3535", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>{liveCount} LIVE</span>
              </div>
            )}
            <div style={{ background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.38)", borderRadius: 18, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 11 }}>⚡</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: "#F5C518", letterSpacing: 1 }}>{pts}</span>
            </div>
            <img src={user.picture} alt="" onClick={function() { setShowProfile(true); }} style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #F5C518", cursor: "pointer" }} />
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <NavTab label="MATCHES" active={tab === "matches"} onClick={function() { setTab("matches"); }} />
          <NavTab label="NEWS" active={tab === "news"} onClick={function() { setTab("news"); }} />
          <NavTab label="BANTER" active={tab === "banter"} onClick={function() { setTab("banter"); }} />
          <NavTab label="LEADERS" active={tab === "leaders"} onClick={function() { setTab("leaders"); }} />
          <NavTab label="REWARDS" active={tab === "rewards"} onClick={function() { setTab("rewards"); }} />
        </div>
      </div>

      <div style={{ padding: "14px 14px 90px" }}>

        {tab === "matches" && (
          <div>
            <CountdownBanner />
            {matchLoading && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(240,237,230,0.45)" }}>
                <div style={{ fontSize: 36, animation: "spin 0.9s linear infinite", display: "inline-block" }}>⚽</div>
                <div style={{ fontSize: 11, marginTop: 10, letterSpacing: 2 }}>LOADING FIXTURES...</div>
              </div>
            )}
            {!matchLoading && matchError && (
              <div style={{ background: "rgba(255,53,53,0.08)", border: "1px solid rgba(255,53,53,0.25)", borderRadius: 14, padding: "20px", textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: "#FF3535", marginBottom: 8, fontWeight: 600 }}>Could not load fixtures</div>
                <div style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", marginBottom: 14 }}>Check your API key in Vercel environment variables.</div>
                <button onClick={loadMatches} style={{ background: "#FF3535", border: "none", borderRadius: 10, padding: "10px 24px", color: "#fff", fontSize: 12, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer" }}>RETRY</button>
              </div>
            )}
            {!matchLoading && !matchError && matches.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏟️</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#F5C518", letterSpacing: 2, marginBottom: 8 }}>NO FIXTURES RIGHT NOW</div>
                <div style={{ fontSize: 12, color: "rgba(240,237,230,0.45)", lineHeight: 1.7 }}>World Cup starts June 11, 2026. Check back soon!</div>
              </div>
            )}
            {!matchLoading && matches.map(function(m, i) {
              const id = m.fixture ? m.fixture.id : m.id;
              return <MatchCard key={id || i} match={m} pred={preds[id]} onPredict={setPredictModal} />;
            })}
            {!matchLoading && (
              <button onClick={loadMatches} style={{ width: "100%", padding: 11, background: "rgba(240,237,230,0.08)", border: "1px solid #1a3525", borderRadius: 12, color: "rgba(240,237,230,0.45)", fontSize: 11, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer", marginTop: 6 }}>
                REFRESH FIXTURES
              </button>
            )}
          </div>
        )}

        {tab === "news" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 13, color: "#F0EDE6", fontWeight: 600 }}>Football News</div>
                <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 1.5, marginTop: 2 }}>LIVE via NEWSDATA.IO</div>
              </div>
              <button onClick={loadNews} disabled={newsLoading} style={{ background: "rgba(240,237,230,0.08)", border: "1px solid #1a3525", borderRadius: 16, padding: "6px 14px", color: newsLoading ? "rgba(240,237,230,0.45)" : "#9EFF00", fontSize: 10, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer" }}>
                {newsLoading ? "LOADING..." : "REFRESH"}
              </button>
            </div>
            {newsLoading && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(240,237,230,0.45)" }}>
                <div style={{ fontSize: 32, animation: "spin 0.9s linear infinite", display: "inline-block" }}>⚽</div>
                <div style={{ fontSize: 10, marginTop: 8, letterSpacing: 2 }}>FETCHING NEWS...</div>
              </div>
            )}
            {!newsLoading && newsError && (
              <div style={{ background: "rgba(255,53,53,0.08)", border: "1px solid rgba(255,53,53,0.25)", borderRadius: 14, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#FF3535", marginBottom: 10 }}>Could not load news.</div>
                <button onClick={loadNews} style={{ background: "#FF3535", border: "none", borderRadius: 8, padding: "8px 18px", color: "#fff", fontSize: 11, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer" }}>RETRY</button>
              </div>
            )}
            {!newsLoading && !newsError && news.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(240,237,230,0.45)" }}>
                <button onClick={loadNews} style={{ background: "#9EFF00", border: "none", borderRadius: 10, padding: "10px 22px", color: "#071008", fontSize: 12, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer" }}>LOAD NEWS</button>
              </div>
            )}
            {!newsLoading && news.map(function(item, i) {
              return (
                <div key={i} style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 14, padding: "14px", marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div onClick={function() { setTeamModal(item.source); }} style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(158,255,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, cursor: "pointer" }}>{item.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#F0EDE6", lineHeight: 1.5, marginBottom: 7, fontWeight: 500 }}>{item.title}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span onClick={function() { setTeamModal(item.source); }} style={{ fontSize: 9, color: "#9EFF00", cursor: "pointer", letterSpacing: 1, fontWeight: 700 }}>{item.source ? item.source.toUpperCase() : ""}</span>
                      <span style={{ fontSize: 9, color: "rgba(240,237,230,0.45)" }}>{item.time}</span>
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", fontSize: 10, color: "#F5C518", textDecoration: "none", fontWeight: 600 }}>Read</a>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "banter" && (
          <div>
            <div style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 16, padding: "14px", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <img src={user.picture} alt="" style={{ width: 32, height: 32, borderRadius: "50%" }} />
                <div style={{ fontSize: 11, color: "#F5C518", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2 }}>DROP YOUR TAKE</div>
              </div>
              <input value={banterInput} onChange={function(e) { setBanterInput(e.target.value); }}
                onKeyDown={function(e) {
                  if (e.key === "Enter" && banterInput.trim()) {
                    setBanter(function(f) { return [{ user: user.name.split(" ")[0], time: "now", msg: banterInput, likes: 0, picture: user.picture }].concat(f); });
                    setBanterInput("");
                    addPoints(5);
                    showToast("Banter posted! +5pts", "#F5C518");
                  }
                }}
                placeholder="Who's winning the World Cup?..."
                style={{ width: "100%", background: "#07100d", border: "1px solid #1a3525", borderRadius: 10, padding: "12px 14px", outline: "none", color: "#F0EDE6", fontSize: 13, fontFamily: "'Outfit',sans-serif", marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {["🔥", "😂", "💀", "👀", "🐐", "🏆"].map(function(e) {
                  return <span key={e} style={{ fontSize: 18, cursor: "pointer" }} onClick={function() { setBanterInput(function(v) { return v + e; }); }}>{e}</span>;
                })}
                <button onClick={function() {
                  if (!banterInput.trim()) return;
                  setBanter(function(f) { return [{ user: user.name.split(" ")[0], time: "now", msg: banterInput, likes: 0, picture: user.picture }].concat(f); });
                  setBanterInput("");
                  addPoints(5);
                  showToast("Banter posted! +5pts", "#F5C518");
                }} style={{ marginLeft: "auto", background: "linear-gradient(135deg,#9EFF00,#6abf00)", border: "none", borderRadius: 10, padding: "8px 18px", color: "#071008", fontSize: 12, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, cursor: "pointer", fontWeight: 700 }}>POST</button>
              </div>
            </div>
            {banter.map(function(b, i) {
              return (
                <div key={i} style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 14, padding: "14px", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    {b.picture
                      ? <img src={b.picture} alt="" style={{ width: 28, height: 28, borderRadius: "50%" }} />
                      : <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(240,237,230,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{b.avatar || "⚽"}</div>
                    }
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#F5C518" }}>{b.user}</span>
                    <span style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", marginLeft: "auto" }}>{b.time}</span>
                  </div>
                  <p style={{ fontSize: 13, margin: "0 0 10px", lineHeight: 1.55, color: "#F0EDE6" }}>{b.msg}</p>
                  <div style={{ display: "flex", gap: 16 }}>
                    <span onClick={function() {
                      setBanter(function(f) {
                        return f.map(function(x, j) {
                          return j === i ? Object.assign({}, x, { likes: x.likes + 1 }) : x;
                        });
                      });
                    }} style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", cursor: "pointer" }}>🔥 {b.likes}</span>
                    <span style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", cursor: "pointer" }}>↩ Reply</span>
                    <span style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", cursor: "pointer", marginLeft: "auto" }}>📤</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "leaders" && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#1a1500,#0f2010)", border: "1px solid rgba(245,197,24,0.3)", borderRadius: 16, padding: "20px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <img src={user.picture} alt="" style={{ width: 50, height: 50, borderRadius: "50%", border: "2px solid #F5C518" }} />
                <div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "#F5C518", letterSpacing: 2 }}>{user.name.split(" ")[0].toUpperCase()}</div>
                  <div style={{ fontSize: 10, color: "rgba(240,237,230,0.45)" }}>Rank {myRank > 0 ? "#" + myRank : "Unranked"}</div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#F5C518" }}>{pts}</div>
                  <div style={{ fontSize: 8, color: "rgba(240,237,230,0.45)", letterSpacing: 1 }}>POINTS</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {[[predCount, "PREDICTIONS"], [pts >= 500 ? "🏅" : "—", "BADGE"], [myRank > 0 ? "#" + myRank : "-", "RANK"]].map(function(item, i) {
                  return (
                    <div key={i} style={{ flex: 1, background: "rgba(240,237,230,0.08)", borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#9EFF00" }}>{item[0]}</div>
                      <div style={{ fontSize: 7, color: "rgba(240,237,230,0.45)", letterSpacing: 1 }}>{item[1]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2, marginBottom: 10 }}>LEADERBOARD</div>
            {leaderboard.length === 0 && (
              <div style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 14, padding: "20px", textAlign: "center", color: "rgba(240,237,230,0.45)", fontSize: 12 }}>
                Be the first! Make predictions to appear here.
              </div>
            )}
            {leaderboard.map(function(p, i) {
              const isMe = user && p.id === user.id;
              return (
                <div key={p.id} style={{ background: isMe ? "linear-gradient(135deg,#0d2818,#112410)" : "#0f2015", border: "1px solid " + (isMe ? "rgba(158,255,0,0.38)" : "#1a3525"), borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: i === 0 ? "#F5C518" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "rgba(240,237,230,0.45)", minWidth: 26 }}>#{i + 1}</span>
                  {p.picture
                    ? <img src={p.picture} alt="" style={{ width: 34, height: 34, borderRadius: "50%", border: isMe ? "1px solid #9EFF00" : "none" }} />
                    : <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(240,237,230,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚽</div>
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isMe ? "#9EFF00" : "#F0EDE6" }}>{p.name}{isMe ? " (You)" : ""}</div>
                    <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)" }}>{p.preds} predictions</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: isMe ? "#9EFF00" : "#F5C518" }}>{p.pts}</div>
                    <div style={{ fontSize: 8, color: "rgba(240,237,230,0.45)" }}>PTS</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "rewards" && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#1a1500,#0f2010)", border: "1px solid rgba(245,197,24,0.3)", borderRadius: 16, padding: "22px 20px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2 }}>YOUR TOTAL POINTS</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 56, color: "#F5C518", lineHeight: 1.1, letterSpacing: 3 }}>{pts}</div>
              <div style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", marginTop: 4 }}>Predict matches to earn more</div>
            </div>
            <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2, marginBottom: 10 }}>HOW TO EARN</div>
            {[
              ["🎯", "Exact score prediction", "+100 pts"],
              ["🏆", "Correct match winner", "+50 pts"],
              ["💬", "Post banter", "+5 pts"],
              ["📤", "Share to TikTok or WhatsApp", "+20 pts"],
              ["👥", "Refer a friend", "+200 pts"],
            ].map(function(item, i) {
              return (
                <div key={i} style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{item[0]}</span>
                  <span style={{ flex: 1, fontSize: 12, color: "rgba(240,237,230,0.45)" }}>{item[1]}</span>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: "#9EFF00", letterSpacing: 1 }}>{item[2]}</span>
                </div>
              );
            })}
            <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2, marginBottom: 10, marginTop: 16 }}>REDEEM REWARDS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "100MB Data", icon: "📱", cost: 400, color: "#9EFF00" },
                { label: "1GB Bundle", icon: "📶", cost: 800, color: "#F5C518" },
                { label: "5GB Bundle", icon: "🚀", cost: 2200, color: "#FF9900" },
                { label: "VIP League", icon: "👑", cost: 1000, color: "#c084fc" },
              ].map(function(r, i) {
                const canAfford = pts >= r.cost;
                return (
                  <button key={i} onClick={function() {
                    if (!canAfford) { showToast("Not enough points!", "#FF3535"); return; }
                    addPoints(-r.cost);
                    showToast(r.label + " redeemed!", "#F5C518");
                  }} style={{ background: "#0f2015", border: "1px solid " + r.color + (canAfford ? "60" : "20"), borderRadius: 14, padding: "16px 10px", textAlign: "center", cursor: canAfford ? "pointer" : "not-allowed", opacity: canAfford ? 1 : 0.5, fontFamily: "inherit" }}>
                    <div style={{ fontSize: 26, marginBottom: 5 }}>{r.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: r.color, marginBottom: 3 }}>{r.label}</div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: "#F5C518" }}>{r.cost} pts</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#020805", borderTop: "1px solid #1a3525", display: "flex", padding: "8px 0 20px" }}>
        {[
          { id: "matches", icon: "⚽", label: "Matches" },
          { id: "news", icon: "📰", label: "News" },
          { id: "banter", icon: "💬", label: "Banter" },
          { id: "leaders", icon: "🏆", label: "Leaders" },
          { id: "rewards", icon: "🎁", label: "Rewards" },
        ].map(function(n) {
          return (
            <button key={n.id} onClick={function() { setTab(n.id); }} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, opacity: tab === n.id ? 1 : 0.35, transition: "opacity 0.2s", color: tab === n.id ? "#F5C518" : "#F0EDE6" }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontSize: 8, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>{n.label}</span>
            </button>
          );
        })}
      </div>

      {predictModal && (
        <PredictModal
          match={predictModal}
          onClose={function() { setPredictModal(null); }}
          onSubmit={function(id, pred) {
            savePred(id, pred);
            addPoints(50);
            showToast("Prediction locked! +50pts", "#9EFF00");
          }}
        />
      )}
      {teamModal && <TeamModal team={teamModal} onClose={function() { setTeamModal(null); }} />}
    </div>
  );
}
