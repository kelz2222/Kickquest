import { useState, useEffect, useCallback } from "react";

const LOGO = "https://i.imgur.com/JJtXoXJ.png";
const GOOGLE_CLIENT_ID = "185644125904-65hkerj2lu9maacgv5j91g33ief1rm5c.apps.googleusercontent.com";
const SPORTS_KEY = "ed60517becbff08b77f62d282d0886ca";

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
  const future = new Date(Date.now() + 60 * 864e5).toISOString().split("T")[0];
  const headers = { "x-apisports-key": SPORTS_KEY };

  async function getLeague(leagueId, season) {
    try {
      const r = await fetch(
        "https://v3.football.api-sports.io/fixtures?league=" + leagueId + "&season=" + season + "&from=" + today + "&to=" + future,
        { headers: headers }
      );
      if (!r.ok) return [];
      const d = await r.json();
      return d.response || [];
    } catch (e) {
      return [];
    }
  }

  try {
    const results = await Promise.all([
      getLeague(1, 2025),
      getLeague(1, 2026),
      getLeague(39, 2024),
      getLeague(2, 2024),
    ]);

    const all = results[0].concat(results[1]).concat(results[2]).concat(results[3]);

    const seen = new Set();
    const unique = all.filter(function(m) {
      const id = m.fixture && m.fixture.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    unique.sort(function(a, b) {
      return new Date(a.fixture.date) - new Date(b.fixture.date);
    });

    return { matches: unique.slice(0, 30), error: null };
  } catch (e) {
    return { matches: [], error: e.message };
  }
}

async function fetchNews() {
  const key = import.meta.env.VITE_NEWSDATA_API_KEY || "";
  try {
    const r = await fetch(
      "https://newsdata.io/api/1/news?apikey=" + key + "&q=football+world+cup+2026&language=en&category=sports&size=10"
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
  const q = encodeURIComponent(team + " football");
  try {
    const r = await fetch(
      "https://newsdata.io/api/1/news?apikey=" + key + "&q=" + q + "&language=en&category=sports&size=5"
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

function userKey(uid, type) {
  return "kq_" + type + "_" + uid;
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
    <div style={{ background: "linear-gradient(135deg,#1a3500,#0f2010)", border: "1px solid #9EFF0055", borderRadius: 14, padding: "14px 16px", marginBottom: 12, textAlign: "center" }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#9EFF00", letterSpacing: 2 }}>THE WORLD CUP IS HERE!</div>
      <div style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", marginTop: 4 }}>USA - Canada - Mexico 2026</div>
    </div>
  );
  return (
    <div style={{ background: "linear-gradient(135deg,#1a1500,#0a1a08)", border: "1px solid #F5C51840", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
      <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2, marginBottom: 8, textAlign: "center" }}>WORLD CUP 2026 KICKS OFF IN</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        {[{ v: cd.days, l: "DAYS" }, { v: cd.hours, l: "HRS" }, { v: cd.mins, l: "MINS" }, { v: cd.secs, l: "SECS" }].map(function(item, i) {
          return (
            <div key={i} style={{ flex: 1, background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)", borderRadius: 10, padding: "10px 4px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: "#F5C518", lineHeight: 1 }}>{String(item.v).padStart(2, "0")}</div>
              <div style={{ fontSize: 7, color: "rgba(240,237,230,0.45)", letterSpacing: 1.5, marginTop: 3 }}>{item.l}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: 9, color: "rgba(240,237,230,0.45)" }}>June 11, 2026 - USA - Canada - Mexico</div>
    </div>
  );
}

function MatchCard(props) {
  const m = props.match;
  const pred = props.pred;
  const home = m.teams ? m.teams.home.name : "Home";
  const away = m.teams ? m.teams.away.name : "Away";
  const homeLogo = m.teams ? m.teams.home.logo : null;
  const awayLogo = m.teams ? m.teams.away.logo : null;
  const status = m.fixture ? m.fixture.status.short : "NS";
  const dateIso = m.fixture ? m.fixture.date : new Date().toISOString();
  const comp = m.league ? m.league.name : "Football";
  const compLogo = m.league ? m.league.logo : null;
  const hs = m.goals ? m.goals.home : null;
  const as = m.goals ? m.goals.away : null;
  const elapsed = m.fixture && m.fixture.status.elapsed ? m.fixture.status.elapsed + "'" : "";
  const live = ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT"].includes(status);
  const done = ["FT", "AET", "PEN"].includes(status);
  const id = m.fixture ? m.fixture.id : Math.random();

  return (
    <div style={{ background: live ? "linear-gradient(135deg,#1a1500,#0f2010)" : T.card, border: "1px solid " + (live ? "#F5C51855" : T.border), borderRadius: 14, padding: "14px 15px", marginBottom: 10, position: "relative", overflow: "hidden", boxShadow: live ? "0 0 20px #F5C51815" : "none" }}>
      {live && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#F5C518,transparent)", animation: "shimmer 2s infinite" }} />}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {compLogo && <img src={compLogo} alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />}
          <span style={{ fontSize: 9, color: T.muted, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>{comp.toUpperCase()}</span>
        </div>
        <span style={{ display: "flex", alignItems: "center", fontSize: 10, color: live ? "#FF3535" : done ? T.muted : "#9EFF00", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>
          {live && <Dot />}
          {live ? (elapsed || "LIVE") : done ? "FT" : fmtD(dateIso) + " " + fmt(dateIso)}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          {homeLogo && <img src={homeLogo} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />}
          <span style={{ fontSize: 13, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, color: T.white }}>{home}</span>
        </div>
        <div style={{ minWidth: 80, textAlign: "center" }}>
          {(live || done) && hs !== null
            ? <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: live ? "#F5C518" : T.white, letterSpacing: 3 }}>{hs} - {as}</span>
            : <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: T.muted }}>VS</span>
          }
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 13, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, color: T.white, textAlign: "right" }}>{away}</span>
          {awayLogo && <img src={awayLogo} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />}
        </div>
      </div>
      {!done && (
        pred
          ? (
            <div style={{ background: "rgba(158,255,0,0.08)", border: "1px solid rgba(158,255,0,0.3)", borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#9EFF00" }}>Your prediction: {pred.home} - {pred.away}</span>
              <span onClick={function() { props.onPredict(m); }} style={{ fontSize: 10, color: T.muted, cursor: "pointer" }}>Edit</span>
            </div>
          )
          : (
            <button onClick={function() { props.onPredict(m); }} style={{ width: "100%", padding: 10, border: "none", borderRadius: 10, background: "linear-gradient(135deg,#9EFF00,#6abf00)", color: "#071008", fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 2, cursor: "pointer", fontWeight: 700 }}>
              PREDICT THIS MATCH
            </button>
          )
      )}
      {done && pred && (
        <div style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.3)", borderRadius: 8, padding: "8px 12px" }}>
          <span style={{ fontSize: 11, color: "#F5C518" }}>Your prediction was: {pred.home} - {pred.away}</span>
        </div>
      )}
    </div>
  );
}

function PredictModal(props) {
  const m = props.match;
  const home = m.teams ? m.teams.home.name : "Home";
  const away = m.teams ? m.teams.away.name : "Away";
  const homeLogo = m.teams ? m.teams.home.logo : null;
  const awayLogo = m.teams ? m.teams.away.logo : null;
  const id = m.fixture ? m.fixture.id : m.id;
  const [h, setH] = useState(props.existing ? props.existing.home : "");
  const [a, setA] = useState(props.existing ? props.existing.away : "");
  const ok = h !== "" && a !== "";

  return (
    <div onClick={props.onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", zIndex: 1000 }}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: T.surface, border: "1px solid " + T.border, borderRadius: "22px 22px 0 0", padding: "20px 20px 40px", animation: "slideUp 0.3s ease-out" }}>
        <div style={{ width: 36, height: 4, background: T.faint, borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: T.gold, letterSpacing: 2, marginBottom: 16 }}>PREDICT SCORE</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 10 }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            {homeLogo && <img src={homeLogo} alt="" style={{ width: 40, height: 40, objectFit: "contain", marginBottom: 6 }} />}
            <div style={{ fontSize: 11, color: T.white, fontWeight: 600, marginBottom: 8 }}>{home}</div>
            <input type="number" min="0" max="20" value={h} onChange={function(e) { setH(e.target.value); }} placeholder="0"
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1px solid " + T.border, background: T.card, color: T.white, fontSize: 32, fontFamily: "'Bebas Neue',sans-serif", textAlign: "center", boxSizing: "border-box", outline: "none" }} />
          </div>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: T.muted, paddingTop: 30 }}>-</span>
          <div style={{ flex: 1, textAlign: "center" }}>
            {awayLogo && <img src={awayLogo} alt="" style={{ width: 40, height: 40, objectFit: "contain", marginBottom: 6 }} />}
            <div style={{ fontSize: 11, color: T.white, fontWeight: 600, marginBottom: 8 }}>{away}</div>
            <input type="number" min="0" max="20" value={a} onChange={function(e) { setA(e.target.value); }} placeholder="0"
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1px solid " + T.border, background: T.card, color: T.white, fontSize: 32, fontFamily: "'Bebas Neue',sans-serif", textAlign: "center", boxSizing: "border-box", outline: "none" }} />
          </div>
        </div>
        <div style={{ fontSize: 11, color: T.muted, textAlign: "center", marginBottom: 16 }}>
          Your prediction is private and only visible to you
        </div>
        <button disabled={!ok} onClick={function() { props.onSubmit(id, { home: h, away: a }); props.onClose(); }}
          style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: ok ? "linear-gradient(135deg,#9EFF00,#6abf00)" : T.faint, color: ok ? "#071008" : T.muted, fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 2, cursor: ok ? "pointer" : "default", fontWeight: 700 }}>
          LOCK IN PREDICTION
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
      <div onClick={function(e) { e.stopPropagation(); }} style={{ width: "100%", maxWidth: 390, background: T.surface, border: "1px solid " + T.border, borderRadius: 20, padding: 22, maxHeight: "80vh", overflowY: "auto", animation: "slideUp 0.3s ease-out" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: T.gold, letterSpacing: 2 }}>{props.team.toUpperCase()} - NEWS</div>
          <button onClick={props.onClose} style={{ background: "none", border: "none", color: T.muted, fontSize: 20, cursor: "pointer" }}>X</button>
        </div>
        {loading && <div style={{ textAlign: "center", padding: "28px 0", color: T.muted }}><div style={{ fontSize: 32, animation: "spin 0.9s linear infinite", display: "inline-block" }}>⚽</div><div style={{ fontSize: 10, marginTop: 8, letterSpacing: 2 }}>LOADING...</div></div>}
        {!loading && articles.length === 0 && <div style={{ color: T.muted, fontSize: 12, textAlign: "center", padding: "20px 0" }}>No recent news for {props.team}.</div>}
        {!loading && articles.map(function(a, i) {
          return (
            <div key={i} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: T.white, lineHeight: 1.5, marginBottom: 6 }}>{a.title}</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, color: T.muted }}>{timeAgo(a.pubDate)}</span>
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
          props.onLogin({ name: payload.name, email: payload.email, picture: payload.picture, id: payload.sub });
        },
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme: "filled_black", size: "large", width: 300, text: "signin_with" }
      );
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Outfit',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        * { box-sizing:border-box }
      `}</style>
      <img src={LOGO} alt="KickQuest" style={{ width: 130, height: 130, objectFit: "contain", marginBottom: 16, animation: "float 3s ease-in-out infinite" }} />
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, letterSpacing: 4, background: "linear-gradient(135deg,#F5C518,#c49a10)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4, textAlign: "center" }}>KICKQUEST</div>
      <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, marginBottom: 36, textAlign: "center" }}>PREDICT - PLAY - WIN THE WORLD CUP</div>
      <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 20, padding: "28px 24px", width: "100%", maxWidth: 340, textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>⚽🏆🎯</div>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: T.gold, letterSpacing: 2, marginBottom: 8 }}>JOIN THE GAME</div>
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.7, marginBottom: 24 }}>
          Sign in to predict World Cup 2026 matches, earn points, and compete on the leaderboard. Your predictions stay private.
        </div>
        <div id="google-btn" style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}></div>
        <div style={{ fontSize: 10, color: T.muted }}>Free to join. No credit card needed.</div>
      </div>
      <div style={{ display: "flex", gap: 28, textAlign: "center" }}>
        {[["🎯", "Predict", "Match scores"], ["🏆", "Earn", "Points & badges"], ["🎁", "Win", "Data & airtime"]].map(function(item, i) {
          return (
            <div key={i}>
              <div style={{ fontSize: 26 }}>{item[0]}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: T.gold, letterSpacing: 1 }}>{item[1]}</div>
              <div style={{ fontSize: 9, color: T.muted }}>{item[2]}</div>
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
  const [preds, setPreds] = useState({});
  const [pts, setPts] = useState(0);
  const [banter, setBanter] = useState([
    { user: "NaijaOracle", time: "2m", msg: "Who's winning the World Cup 2026? My money is on Brazil!", likes: 47, avatar: "👑" },
    { user: "BantaKing_GH", time: "8m", msg: "Ghana is going all the way. Don't test us!", likes: 93, avatar: "🇬🇭" },
    { user: "MoroccoMagic", time: "15m", msg: "Morocco reached the semis in 2022. This time we go ALL THE WAY!", likes: 61, avatar: "🌟" },
    { user: "FootballGod_KE", time: "22m", msg: "Brazil haven't won since 2002. Their drought ends now.", likes: 134, avatar: "🦁" },
    { user: "SoccerOracle_NG", time: "35m", msg: "France is the most complete squad. Mark my words.", likes: 88, avatar: "🎯" },
  ]);
  const [banterInput, setBanterInput] = useState("");
  const [toast, setToast] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [predictModal, setPredictModal] = useState(null);
  const [teamModal, setTeamModal] = useState(null);

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
    board = board.slice(0, 50);
    localStorage.setItem("kq_leaderboard", JSON.stringify(board));
    setLeaderboard(board);
  }

  function handleLogin(userData) {
    setUser(userData);
    const savedPts = localStorage.getItem(userKey(userData.id, "pts"));
    const savedPreds = localStorage.getItem(userKey(userData.id, "preds"));
    const loadedPts = savedPts ? parseInt(savedPts) : 0;
    const loadedPreds = savedPreds ? JSON.parse(savedPreds) : {};
    setPts(loadedPts);
    setPreds(loadedPreds);
    const storedBoard = localStorage.getItem("kq_leaderboard");
    if (storedBoard) setLeaderboard(JSON.parse(storedBoard));
    updateLeaderboard(userData, loadedPts, loadedPreds);
    showToast("Welcome, " + userData.name.split(" ")[0] + "!", T.gold);
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
      const newPts = Math.max(0, p + amount);
      if (user) {
        localStorage.setItem(userKey(user.id, "pts"), String(newPts));
        updateLeaderboard(user, newPts, preds);
      }
      return newPts;
    });
  }

  function savePred(id, pred) {
    setPreds(function(p) {
      const newPreds = Object.assign({}, p);
      newPreds[id] = pred;
      if (user) {
        localStorage.setItem(userKey(user.id, "preds"), JSON.stringify(newPreds));
        updateLeaderboard(user, pts, newPreds);
      }
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
      if (n && n.length > 0) setNews(n);
      else setNewsError(true);
      setNewsLoading(false);
    });
  }, [newsLoading]);

  useEffect(function() {
    const storedBoard = localStorage.getItem("kq_leaderboard");
    if (storedBoard) setLeaderboard(JSON.parse(storedBoard));
    loadMatches();
  }, []);

  useEffect(function() {
    if (tab === "news") loadNews();
  }, [tab]);

  const liveCount = matches.filter(function(m) {
    const s = m.fixture ? m.fixture.status.short : "";
    return ["1H", "2H", "HT", "ET", "BT"].includes(s);
  }).length;

  const predCount = Object.keys(preds).length;
  const myRank = user ? leaderboard.findIndex(function(x) { return x.id === user.id; }) + 1 : 0;

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.white, fontFamily: "'Outfit',sans-serif", maxWidth: 430, margin: "0 auto", position: "relative" }}>
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
          <div onClick={function(e) { e.stopPropagation(); }} style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: T.surface, border: "1px solid " + T.border, borderRadius: "22px 22px 0 0", padding: "24px 20px 40px", animation: "slideUp 0.3s ease-out" }}>
            <div style={{ width: 36, height: 4, background: T.faint, borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <img src={user.picture} alt="" style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid " + T.gold }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: T.white }}>{user.name}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{user.email}</div>
                <div style={{ fontSize: 10, color: "#9EFF00", marginTop: 4 }}>Rank {myRank > 0 ? "#" + myRank : "Unranked"}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[[pts, "POINTS"], [predCount, "PREDICTIONS"], [myRank > 0 ? "#" + myRank : "-", "RANK"]].map(function(item, i) {
                return (
                  <div key={i} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: T.gold }}>{item[0]}</div>
                    <div style={{ fontSize: 8, color: T.muted, letterSpacing: 1 }}>{item[1]}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: "rgba(158,255,0,0.06)", border: "1px solid rgba(158,255,0,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 11, color: T.muted, textAlign: "center" }}>
              Your predictions are private and only visible to you
            </div>
            <button onClick={handleLogout} style={{ width: "100%", padding: 14, background: "rgba(255,53,53,0.15)", border: "1px solid rgba(255,53,53,0.4)", borderRadius: 12, color: "#FF3535", fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: 2, cursor: "pointer" }}>
              SIGN OUT
            </button>
          </div>
        </div>
      )}

      <div style={{ background: "linear-gradient(180deg,#020805 0%,#07100d 100%)", padding: "14px 14px 0", borderBottom: "1px solid " + T.border, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={LOGO} alt="KickQuest" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 10 }} />
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 3, background: "linear-gradient(135deg,#F5C518,#c49a10)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>KickQuest</div>
              <div style={{ fontSize: 7.5, color: T.muted, letterSpacing: 2, marginTop: 1 }}>PREDICT - PLAY - WIN THE WORLD CUP</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {liveCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,53,53,0.18)", border: "1px solid rgba(255,53,53,0.45)", borderRadius: 16, padding: "4px 10px" }}>
                <Dot /><span style={{ fontSize: 10, color: "#FF3535", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>{liveCount} LIVE</span>
              </div>
            )}
            <div style={{ background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.38)", borderRadius: 18, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 11 }}>⚡</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: T.gold }}>{pts}</span>
            </div>
            <img src={user.picture} alt="" onClick={function() { setShowProfile(true); }} style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid " + T.gold, cursor: "pointer" }} />
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
              <div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}>
                <div style={{ fontSize: 36, animation: "spin 0.9s linear infinite", display: "inline-block" }}>⚽</div>
                <div style={{ fontSize: 11, marginTop: 10, letterSpacing: 2 }}>LOADING FIXTURES...</div>
              </div>
            )}
            {!matchLoading && matchError && (
              <div style={{ background: "rgba(255,53,53,0.08)", border: "1px solid rgba(255,53,53,0.25)", borderRadius: 14, padding: "20px", textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: "#FF3535", marginBottom: 8, fontWeight: 600 }}>Could not load fixtures</div>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 14 }}>Check your API key in Vercel environment variables.</div>
                <button onClick={loadMatches} style={{ background: "#FF3535", border: "none", borderRadius: 10, padding: "10px 24px", color: "#fff", fontSize: 12, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer" }}>RETRY</button>
              </div>
            )}
            {!matchLoading && !matchError && matches.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏟️</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: T.gold, letterSpacing: 2, marginBottom: 8 }}>NO FIXTURES FOUND</div>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.7, marginBottom: 16 }}>World Cup 2026 starts June 11. Premier League and Champions League fixtures will appear when scheduled.</div>
                <button onClick={loadMatches} style={{ background: T.lime, border: "none", borderRadius: 10, padding: "10px 24px", color: "#071008", fontSize: 12, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer" }}>RETRY</button>
              </div>
            )}
            {!matchLoading && matches.length > 0 && (
              <div>
                <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2, marginBottom: 10 }}>{matches.length} UPCOMING FIXTURES</div>
                {matches.map(function(m, i) {
                  const id = m.fixture ? m.fixture.id : i;
                  return <MatchCard key={id} match={m} pred={preds[id]} onPredict={setPredictModal} />;
                })}
              </div>
            )}
            {!matchLoading && (
              <button onClick={loadMatches} style={{ width: "100%", padding: 11, background: T.faint, border: "1px solid " + T.border, borderRadius: 12, color: T.muted, fontSize: 11, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer", marginTop: 6 }}>
                REFRESH FIXTURES
              </button>
            )}
          </div>
        )}

        {tab === "news" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 13, color: T.white, fontWeight: 600 }}>Football News</div>
                <div style={{ fontSize: 9, color: T.muted, letterSpacing: 1.5, marginTop: 2 }}>LIVE via NEWSDATA.IO</div>
              </div>
              <button onClick={loadNews} disabled={newsLoading} style={{ background: T.faint, border: "1px solid " + T.border, borderRadius: 16, padding: "6px 14px", color: newsLoading ? T.muted : "#9EFF00", fontSize: 10, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer" }}>
                {newsLoading ? "LOADING..." : "REFRESH"}
              </button>
            </div>
            {newsLoading && (
              <div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}>
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
              <div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}>
                <button onClick={loadNews} style={{ background: "#9EFF00", border: "none", borderRadius: 10, padding: "10px 22px", color: "#071008", fontSize: 12, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer" }}>LOAD NEWS</button>
              </div>
            )}
            {!newsLoading && news.map(function(item, i) {
              return (
                <div key={i} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 14, padding: "14px", marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div onClick={function() { setTeamModal(item.source); }} style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(158,255,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, cursor: "pointer" }}>{item.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: T.white, lineHeight: 1.5, marginBottom: 7, fontWeight: 500 }}>{item.title}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span onClick={function() { setTeamModal(item.source); }} style={{ fontSize: 9, color: "#9EFF00", cursor: "pointer", letterSpacing: 1, fontWeight: 700 }}>{item.source ? item.source.toUpperCase() : ""}</span>
                      <span style={{ fontSize: 9, color: T.muted }}>{item.time}</span>
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", fontSize: 10, color: T.gold, textDecoration: "none", fontWeight: 600 }}>Read</a>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "banter" && (
          <div>
            <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 16, padding: "14px", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <img src={user.picture} alt="" style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid " + T.border }} />
                <div style={{ fontSize: 11, color: T.gold, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2 }}>DROP YOUR TAKE</div>
              </div>
              <input value={banterInput} onChange={function(e) { setBanterInput(e.target.value); }}
                onKeyDown={function(e) {
                  if (e.key === "Enter" && banterInput.trim()) {
                    setBanter(function(f) { return [{ user: user.name.split(" ")[0], time: "now", msg: banterInput, likes: 0, picture: user.picture }].concat(f); });
                    setBanterInput("");
                    addPoints(5);
                    showToast("Banter posted! +5pts", T.gold);
                  }
                }}
                placeholder="Who's winning the World Cup?..."
                style={{ width: "100%", background: T.bg, border: "1px solid " + T.border, borderRadius: 10, padding: "12px 14px", outline: "none", color: T.white, fontSize: 13, fontFamily: "'Outfit',sans-serif", marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {["🔥", "😂", "💀", "👀", "🐐", "🏆"].map(function(e) {
                  return <span key={e} style={{ fontSize: 18, cursor: "pointer" }} onClick={function() { setBanterInput(function(v) { return v + e; }); }}>{e}</span>;
                })}
                <button onClick={function() {
                  if (!banterInput.trim()) return;
                  setBanter(function(f) { return [{ user: user.name.split(" ")[0], time: "now", msg: banterInput, likes: 0, picture: user.picture }].concat(f); });
                  setBanterInput("");
                  addPoints(5);
                  showToast("Banter posted! +5pts", T.gold);
                }} style={{ marginLeft: "auto", background: "linear-gradient(135deg,#9EFF00,#6abf00)", border: "none", borderRadius: 10, padding: "8px 18px", color: "#071008", fontSize: 12, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, cursor: "pointer", fontWeight: 700 }}>POST</button>
              </div>
            </div>
            {banter.map(function(b, i) {
              return (
                <div key={i} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 14, padding: "14px", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    {b.picture
                      ? <img src={b.picture} alt="" style={{ width: 30, height: 30, borderRadius: "50%" }} />
                      : <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.faint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{b.avatar || "⚽"}</div>
                    }
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.gold }}>{b.user}</span>
                    <span style={{ fontSize: 9, color: T.muted, marginLeft: "auto" }}>{b.time}</span>
                  </div>
                  <p style={{ fontSize: 13, margin: "0 0 10px", lineHeight: 1.55, color: T.white }}>{b.msg}</p>
                  <div style={{ display: "flex", gap: 16 }}>
                    <span onClick={function() { setBanter(function(f) { return f.map(function(x, j) { return j === i ? Object.assign({}, x, { likes: x.likes + 1 }) : x; }); }); }} style={{ fontSize: 11, color: T.muted, cursor: "pointer" }}>🔥 {b.likes}</span>
                    <span style={{ fontSize: 11, color: T.muted, cursor: "pointer" }}>↩ Reply</span>
                    <span style={{ fontSize: 11, color: T.muted, cursor: "pointer", marginLeft: "auto" }}>📤</span>
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
                <img src={user.picture} alt="" style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid " + T.gold }} />
                <div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: T.gold, letterSpacing: 2 }}>{user.name.split(" ")[0].toUpperCase()}</div>
                  <div style={{ fontSize: 10, color: T.muted }}>Rank {myRank > 0 ? "#" + myRank : "Unranked"}</div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: T.gold }}>{pts}</div>
                  <div style={{ fontSize: 8, color: T.muted, letterSpacing: 1 }}>POINTS</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {[[predCount, "PREDICTIONS"], [pts >= 500 ? "🏅" : "—", "BADGE"], [myRank > 0 ? "#" + myRank : "-", "RANK"]].map(function(item, i) {
                  return (
                    <div key={i} style={{ flex: 1, background: "rgba(240,237,230,0.08)", borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#9EFF00" }}>{item[0]}</div>
                      <div style={{ fontSize: 7, color: T.muted, letterSpacing: 1 }}>{item[1]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2, marginBottom: 10 }}>GLOBAL LEADERBOARD</div>
            {leaderboard.length === 0 && (
              <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 14, padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🏆</div>
                <div style={{ fontSize: 13, color: T.muted }}>No one on the board yet. Make predictions to earn points and appear here.</div>
              </div>
            )}
            {leaderboard.map(function(p, i) {
              const isMe = user && p.id === user.id;
              return (
                <div key={p.id} style={{ background: isMe ? "linear-gradient(135deg,#0d2818,#112410)" : T.card, border: "1px solid " + (isMe ? "rgba(158,255,0,0.38)" : T.border), borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: i === 0 ? T.gold : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : T.muted, minWidth: 26 }}>#{i + 1}</span>
                  {p.picture
                    ? <img src={p.picture} alt="" style={{ width: 36, height: 36, borderRadius: "50%", border: isMe ? "2px solid #9EFF00" : "none" }} />
                    : <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.faint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚽</div>
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isMe ? "#9EFF00" : T.white }}>{p.name}{isMe ? " (You)" : ""}</div>
                    <div style={{ fontSize: 9, color: T.muted }}>{p.preds} predictions</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: isMe ? "#9EFF00" : T.gold }}>{p.pts}</div>
                    <div style={{ fontSize: 8, color: T.muted }}>PTS</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "rewards" && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#1a1500,#0f2010)", border: "1px solid rgba(245,197,24,0.3)", borderRadius: 16, padding: "22px 20px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2 }}>YOUR TOTAL POINTS</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 56, color: T.gold, lineHeight: 1.1, letterSpacing: 3 }}>{pts}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Predict matches to earn more</div>
            </div>
            <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2, marginBottom: 10 }}>HOW TO EARN POINTS</div>
            {[
              ["🎯", "Exact score prediction", "+100 pts"],
              ["🏆", "Correct match winner", "+50 pts"],
              ["💬", "Post banter", "+5 pts"],
              ["📤", "Share to TikTok or WhatsApp", "+20 pts"],
              ["👥", "Refer a friend", "+200 pts"],
            ].map(function(item, i) {
              return (
                <div key={i} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{item[0]}</span>
                  <span style={{ flex: 1, fontSize: 12, color: T.muted }}>{item[1]}</span>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: "#9EFF00", letterSpacing: 1 }}>{item[2]}</span>
                </div>
              );
            })}
            <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2, marginBottom: 10, marginTop: 16 }}>REDEEM REWARDS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "100MB Data", icon: "📱", cost: 400, color: "#9EFF00" },
                { label: "1GB Bundle", icon: "📶", cost: 800, color: T.gold },
                { label: "5GB Bundle", icon: "🚀", cost: 2200, color: "#FF9900" },
                { label: "VIP League", icon: "👑", cost: 1000, color: "#c084fc" },
              ].map(function(r, i) {
                const canAfford = pts >= r.cost;
                return (
                  <button key={i} onClick={function() {
                    if (!canAfford) { showToast("Not enough points!", "#FF3535"); return; }
                    addPoints(-r.cost);
                    showToast(r.label + " redeemed!", T.gold);
                  }} style={{ background: T.card, border: "1px solid " + r.color + (canAfford ? "60" : "20"), borderRadius: 14, padding: "16px 10px", textAlign: "center", cursor: canAfford ? "pointer" : "not-allowed", opacity: canAfford ? 1 : 0.5, fontFamily: "inherit" }}>
                    <div style={{ fontSize: 28, marginBottom: 5 }}>{r.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: r.color, marginBottom: 3 }}>{r.label}</div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: T.gold }}>{r.cost} pts</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#020805", borderTop: "1px solid " + T.border, display: "flex", padding: "8px 0 20px" }}>
        {[
          { id: "matches", icon: "⚽", label: "Matches" },
          { id: "news", icon: "📰", label: "News" },
          { id: "banter", icon: "💬", label: "Banter" },
          { id: "leaders", icon: "🏆", label: "Leaders" },
          { id: "rewards", icon: "🎁", label: "Rewards" },
        ].map(function(n) {
          return (
            <button key={n.id} onClick={function() { setTab(n.id); }} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, opacity: tab === n.id ? 1 : 0.35, transition: "opacity 0.2s", color: tab === n.id ? T.gold : T.white }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontSize: 8, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>{n.label}</span>
            </button>
          );
        })}
      </div>

      {predictModal && (
        <PredictModal
          match={predictModal}
          existing={preds[predictModal.fixture ? predictModal.fixture.id : predictModal.id]}
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
