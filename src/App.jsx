import { useState, useEffect, useCallback } from "react";

const LOGO = "https://i.imgur.com/JJtXoXJ.png";

const T = {
  bg: "#07100d", surface: "#0d1f18", card: "#0f2015", border: "#1a3525",
  gold: "#F5C518", lime: "#9EFF00", red: "#FF3535", white: "#F0EDE6",
  muted: "rgba(240,237,230,0.45)", faint: "rgba(240,237,230,0.08)",
};

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
  return "📰";
}

const fmt = function(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
const fmtD = function(iso) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
};
const sColor = function(s) {
  if (s === "IN_PLAY" || s === "PAUSED") return "#FF3535";
  if (s === "FINISHED") return "rgba(240,237,230,0.45)";
  return "#9EFF00";
};
const sLabel = function(s) {
  if (s === "IN_PLAY") return "LIVE";
  if (s === "PAUSED") return "HT";
  if (s === "FINISHED") return "FT";
  return "SOON";
};

function Dot() {
  return (
    <span style={{
      display: "inline-block", width: 7, height: 7, borderRadius: "50%",
      background: "#FF3535", boxShadow: "0 0 6px #FF3535",
      animation: "pulse 1.1s infinite", marginRight: 5,
    }} />
  );
}

function Toast(props) {
  return (
    <div style={{
      position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
      background: props.color, color: "#071008", padding: "9px 20px",
      borderRadius: 30, fontSize: 12, fontWeight: 700, zIndex: 2000,
      whiteSpace: "nowrap", animation: "toastIn 0.3s ease-out",
      boxShadow: "0 4px 20px " + props.color + "60",
    }}>
      {props.msg}
    </div>
  );
}

function NavTab(props) {
  return (
    <button onClick={props.onClick} style={{
      flex: 1, padding: "11px 2px 9px", border: "none", background: "transparent",
      color: props.active ? "#F5C518" : "rgba(240,237,230,0.45)",
      fontSize: 10, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.8,
      cursor: "pointer",
      borderBottom: props.active ? "2px solid #F5C518" : "2px solid transparent",
      transition: "all 0.2s",
    }}>
      {props.label}
    </button>
  );
}

function MatchCard(props) {
  const match = props.match;
  const pred = props.pred;
  const onPredict = props.onPredict;
  const live = match.status === "IN_PLAY" || match.status === "PAUSED";
  const done = match.status === "FINISHED";
  const hs = match.score && match.score.fullTime ? match.score.fullTime.home : null;
  const as = match.score && match.score.fullTime ? match.score.fullTime.away : null;

  return (
    <div style={{
      background: live ? "linear-gradient(135deg,#1a1500,#0f2010)" : "#0f2015",
      border: "1px solid " + (live ? "#F5C51855" : "#1a3525"),
      borderRadius: 14, padding: "14px 15px", marginBottom: 10,
      position: "relative", overflow: "hidden",
      boxShadow: live ? "0 0 20px #F5C51815" : "none",
    }}>
      {live && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg,transparent,#F5C518,transparent)",
          animation: "shimmer 2s infinite",
        }} />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
        <span style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1.5 }}>
          {(match.competition && match.competition.name ? match.competition.name.toUpperCase() : "FOOTBALL")} - {fmtD(match.utcDate)}
        </span>
        <span style={{ display: "flex", alignItems: "center", fontSize: 10, color: sColor(match.status), fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>
          {live && <Dot />}
          {sLabel(match.status)}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ flex: 1, fontSize: 13, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, color: "#F0EDE6" }}>
          {match.homeTeam.name}
        </span>
        <div style={{ minWidth: 70, textAlign: "center" }}>
          {(live || done) && hs !== null
            ? <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: live ? "#F5C518" : "#F0EDE6", letterSpacing: 3 }}>{hs} - {as}</span>
            : <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: "rgba(240,237,230,0.45)" }}>{fmt(match.utcDate)}</span>
          }
        </div>
        <span style={{ flex: 1, textAlign: "right", fontSize: 13, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, color: "#F0EDE6" }}>
          {match.awayTeam.name}
        </span>
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
            <button onClick={function() { onPredict(match); }} style={{
              width: "100%", padding: 10, border: "none", borderRadius: 10,
              background: "linear-gradient(135deg,#9EFF00,#6abf00)",
              color: "#071008", fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 13, letterSpacing: 2, cursor: "pointer", fontWeight: 700,
            }}>
              PREDICT THIS MATCH
            </button>
          )
      )}
    </div>
  );
}

function PredictModal(props) {
  const match = props.match;
  const onClose = props.onClose;
  const onSubmit = props.onSubmit;
  const [h, setH] = useState("");
  const [a, setA] = useState("");
  const ok = h !== "" && a !== "";

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", zIndex: 1000,
    }}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{
        width: "100%", maxWidth: 430, margin: "0 auto",
        background: "#0d1f18", border: "1px solid #1a3525",
        borderRadius: "22px 22px 0 0", padding: "20px 20px 40px",
        animation: "slideUp 0.3s ease-out",
      }}>
        <div style={{ width: 36, height: 4, background: "rgba(240,237,230,0.08)", borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: "#F5C518", letterSpacing: 2, marginBottom: 4 }}>
          PREDICT SCORE
        </div>
        <div style={{ fontSize: 12, color: "rgba(240,237,230,0.45)", marginBottom: 20 }}>
          {match.homeTeam.name} vs {match.awayTeam.name}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", marginBottom: 6, letterSpacing: 1 }}>
              {match.homeTeam.name}
            </div>
            <input
              type="number" min="0" max="20" value={h}
              onChange={function(e) { setH(e.target.value); }}
              placeholder="0"
              style={{
                width: "100%", padding: "14px", borderRadius: 12,
                border: "1px solid #1a3525", background: "#0f2015",
                color: "#F0EDE6", fontSize: 28, fontFamily: "'Bebas Neue',sans-serif",
                textAlign: "center", boxSizing: "border-box", outline: "none",
              }}
            />
          </div>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "rgba(240,237,230,0.45)", paddingTop: 22 }}>
            -
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", marginBottom: 6, letterSpacing: 1 }}>
              {match.awayTeam.name}
            </div>
            <input
              type="number" min="0" max="20" value={a}
              onChange={function(e) { setA(e.target.value); }}
              placeholder="0"
              style={{
                width: "100%", padding: "14px", borderRadius: 12,
                border: "1px solid #1a3525", background: "#0f2015",
                color: "#F0EDE6", fontSize: 28, fontFamily: "'Bebas Neue',sans-serif",
                textAlign: "center", boxSizing: "border-box", outline: "none",
              }}
            />
          </div>
        </div>
        <button
          disabled={!ok}
          onClick={function() { onSubmit(match.id, { home: h, away: a }); onClose(); }}
          style={{
            width: "100%", padding: 15, borderRadius: 12, border: "none",
            background: ok ? "linear-gradient(135deg,#9EFF00,#6abf00)" : "rgba(240,237,230,0.08)",
            color: ok ? "#071008" : "rgba(240,237,230,0.45)",
            fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: 2,
            cursor: ok ? "pointer" : "default", fontWeight: 700,
          }}
        >
          LOCK IN
        </button>
      </div>
    </div>
  );
}

function TeamModal(props) {
  const team = props.team;
  const onClose = props.onClose;
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    fetchTeamNews(team).then(function(a) {
      setArticles(a);
      setLoading(false);
    });
  }, [team]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000, padding: 20,
    }}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{
        width: "100%", maxWidth: 390, background: "#0d1f18",
        border: "1px solid #1a3525", borderRadius: 20, padding: 22,
        maxHeight: "80vh", overflowY: "auto", animation: "slideUp 0.3s ease-out",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: "#F5C518", letterSpacing: 2 }}>
            {team.toUpperCase()} - LATEST NEWS
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(240,237,230,0.45)", fontSize: 20, cursor: "pointer" }}>
            X
          </button>
        </div>
        {loading && (
          <div style={{ textAlign: "center", padding: "28px 0", color: "rgba(240,237,230,0.45)" }}>
            <div style={{ fontSize: 32, animation: "spin 0.9s linear infinite", display: "inline-block" }}>⚽</div>
            <div style={{ fontSize: 10, marginTop: 8, letterSpacing: 2 }}>SEARCHING LIVE NEWS...</div>
          </div>
        )}
        {!loading && articles.length === 0 && (
          <div style={{ color: "rgba(240,237,230,0.45)", fontSize: 12, textAlign: "center", padding: "20px 0" }}>
            No recent news found for {team}.
          </div>
        )}
        {!loading && articles.map(function(a, i) {
          return (
            <div key={i} style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "#F0EDE6", lineHeight: 1.5, marginBottom: 6 }}>{a.title}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, color: "rgba(240,237,230,0.45)" }}>{timeAgo(a.pubDate)}</span>
                {a.link && (
                  <a href={a.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: "#9EFF00", textDecoration: "none" }}>
                    Read full story
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
    { user: "NaijaOracle", time: "2m", msg: "Can't wait for the World Cup! Who's winning it?", likes: 47 },
    { user: "BantaKing_GH", time: "8m", msg: "Ghana is going all the way. Don't test us!", likes: 93 },
    { user: "MoroccoMagic", time: "15m", msg: "Morocco reached the semis last time. This time we go all the way!", likes: 61 },
    { user: "FootballGod_KE", time: "22m", msg: "Brazil haven't won since 2002. Their time is UP.", likes: 134 },
  ]);
  const [banterInput, setBanterInput] = useState("");
  const [toast, setToast] = useState(null);

  function showToast(msg, color) {
    setToast({ msg: msg, color: color || "#9EFF00" });
    setTimeout(function() { setToast(null); }, 2800);
  }

  function loadMatches() {
    setMatchLoading(true);
    setMatchError(null);
    fetchMatches().then(function(result) {
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

  useEffect(function() { loadMatches(); }, []);
  useEffect(function() { if (tab === "news") loadNews(); }, [tab]);

  const liveCount = matches.filter(function(m) {
    return m.status === "IN_PLAY" || m.status === "PAUSED";
  }).length;

  const predCount = Object.keys(preds).length;

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
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button { -webkit-appearance:none }
        input[type=number] { -moz-appearance:textfield }
        ::-webkit-scrollbar { width:0 }
      `}</style>

      {toast && <Toast msg={toast.msg} color={toast.color} />}

      <div style={{ background: "linear-gradient(180deg,#020805 0%,#07100d 100%)", padding: "14px 14px 0", borderBottom: "1px solid #1a3525", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={LOGO} alt="KickQuest" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 10 }} />
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: 3, background: "linear-gradient(135deg,#F5C518,#c49a10)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
                KickQuest
              </div>
              <div style={{ fontSize: 7.5, color: "rgba(240,237,230,0.45)", letterSpacing: 2, marginTop: 1 }}>
                PREDICT - PLAY - WIN THE WORLD CUP
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {liveCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,53,53,0.18)", border: "1px solid rgba(255,53,53,0.45)", borderRadius: 16, padding: "4px 10px" }}>
                <Dot />
                <span style={{ fontSize: 10, color: "#FF3535", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>
                  {liveCount} LIVE
                </span>
              </div>
            )}
            <div style={{ background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.38)", borderRadius: 18, padding: "5px 12px", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 12 }}>pts</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, color: "#F5C518", letterSpacing: 1 }}>
                {pts}
              </span>
            </div>
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
            {matchLoading && (
              <div style={{ textAlign: "center", padding: "50px 0", color: "rgba(240,237,230,0.45)" }}>
                <div style={{ fontSize: 36, animation: "spin 0.9s linear infinite", display: "inline-block" }}>⚽</div>
                <div style={{ fontSize: 11, marginTop: 10, letterSpacing: 2 }}>LOADING LIVE FIXTURES...</div>
              </div>
            )}
            {!matchLoading && matchError && (
              <div style={{ background: "rgba(255,53,53,0.08)", border: "1px solid rgba(255,53,53,0.25)", borderRadius: 14, padding: "20px 16px", textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: "#FF3535", marginBottom: 6, fontWeight: 600 }}>Could not load fixtures</div>
                <div style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", marginBottom: 14, lineHeight: 1.5 }}>
                  Check that your API key is saved in Vercel environment variables.
                </div>
                <button onClick={loadMatches} style={{ background: "#FF3535", border: "none", borderRadius: 10, padding: "10px 24px", color: "#fff", fontSize: 12, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer" }}>
                  RETRY
                </button>
              </div>
            )}
            {!matchLoading && !matchError && matches.length === 0 && (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 56, marginBottom: 14 }}>🏟️</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#F5C518", letterSpacing: 2, marginBottom: 8 }}>
                  NO FIXTURES RIGHT NOW
                </div>
                <div style={{ fontSize: 12, color: "rgba(240,237,230,0.45)", lineHeight: 1.7 }}>
                  The World Cup kicks off June 11, 2026. Check back soon!
                </div>
              </div>
            )}
            {!matchLoading && !matchError && matches.length > 0 && (
              <div>
                <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2, marginBottom: 10 }}>
                  {matches.length} FIXTURES - NEXT 14 DAYS
                </div>
                {matches.map(function(m) {
                  return <MatchCard key={m.id} match={m} pred={preds[m.id]} onPredict={setPredictModal} />;
                })}
              </div>
            )}
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
                <div style={{ fontSize: 11, color: "#F0EDE6", fontWeight: 600 }}>Football News</div>
                <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 1.5, marginTop: 2 }}>LIVE via NEWSDATA.IO</div>
              </div>
              <button onClick={loadNews} disabled={newsLoading} style={{ background: "rgba(240,237,230,0.08)", border: "1px solid #1a3525", borderRadius: 16, padding: "6px 14px", color: newsLoading ? "rgba(240,237,230,0.45)" : "#9EFF00", fontSize: 10, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer" }}>
                {newsLoading ? "LOADING..." : "REFRESH"}
              </button>
            </div>
            {newsLoading && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(240,237,230,0.45)" }}>
                <div style={{ fontSize: 32, animation: "spin 0.9s linear infinite", display: "inline-block" }}>⚽</div>
                <div style={{ fontSize: 10, marginTop: 8, letterSpacing: 2 }}>FETCHING LIVE NEWS...</div>
              </div>
            )}
            {!newsLoading && newsError && (
              <div style={{ background: "rgba(255,53,53,0.08)", border: "1px solid rgba(255,53,53,0.25)", borderRadius: 14, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#FF3535", marginBottom: 10 }}>Could not load news. Check your API key.</div>
                <button onClick={loadNews} style={{ background: "#FF3535", border: "none", borderRadius: 8, padding: "8px 18px", color: "#fff", fontSize: 11, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer" }}>
                  RETRY
                </button>
              </div>
            )}
            {!newsLoading && !newsError && news.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(240,237,230,0.45)" }}>
                <div style={{ fontSize: 10, letterSpacing: 2, marginBottom: 14 }}>NO NEWS LOADED YET</div>
                <button onClick={loadNews} style={{ background: "#9EFF00", border: "none", borderRadius: 10, padding: "10px 22px", color: "#071008", fontSize: 12, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, cursor: "pointer" }}>
                  LOAD NEWS
                </button>
              </div>
            )}
            {!newsLoading && news.map(function(item, i) {
              return (
                <div key={i} style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 14, padding: "14px", marginBottom: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div onClick={function() { setTeamModal(item.source); }} style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(158,255,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, cursor: "pointer" }}>
                    {item.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#F0EDE6", lineHeight: 1.5, marginBottom: 7, fontWeight: 500 }}>{item.title}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span onClick={function() { setTeamModal(item.source); }} style={{ fontSize: 9, color: "#9EFF00", cursor: "pointer", letterSpacing: 1, fontWeight: 700 }}>
                        {item.source ? item.source.toUpperCase() : ""}
                      </span>
                      <span style={{ fontSize: 9, color: "rgba(240,237,230,0.45)" }}>{item.time}</span>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", fontSize: 10, color: "#F5C518", textDecoration: "none", fontWeight: 600 }}>
                          Read
                        </a>
                      )}
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
              <div style={{ fontSize: 11, color: "#F5C518", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, marginBottom: 10 }}>
                DROP YOUR TAKE
              </div>
              <input
                value={banterInput}
                onChange={function(e) { setBanterInput(e.target.value); }}
                onKeyDown={function(e) {
                  if (e.key === "Enter" && banterInput.trim()) {
                    setBanter(function(f) { return [{ user: "You", time: "now", msg: banterInput, likes: 0 }].concat(f); });
                    setBanterInput("");
                    showToast("Banter posted!", "#F5C518");
                  }
                }}
                placeholder="Who's winning the World Cup?..."
                style={{ width: "100%", background: "#07100d", border: "1px solid #1a3525", borderRadius: 10, padding: "12px 14px", outline: "none", color: "#F0EDE6", fontSize: 13, fontFamily: "'Outfit',sans-serif", marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {["🔥", "😂", "💀", "👀", "🐐", "🏆"].map(function(e) {
                  return (
                    <span key={e} style={{ fontSize: 18, cursor: "pointer" }} onClick={function() { setBanterInput(function(v) { return v + e; }); }}>
                      {e}
                    </span>
                  );
                })}
                <button onClick={function() {
                  if (!banterInput.trim()) return;
                  setBanter(function(f) { return [{ user: "You", time: "now", msg: banterInput, likes: 0 }].concat(f); });
                  setBanterInput("");
                  showToast("Banter posted!", "#F5C518");
                }} style={{ marginLeft: "auto", background: "linear-gradient(135deg,#9EFF00,#6abf00)", border: "none", borderRadius: 10, padding: "8px 18px", color: "#071008", fontSize: 12, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, cursor: "pointer", fontWeight: 700 }}>
                  POST
                </button>
              </div>
            </div>
            {banter.map(function(b, i) {
              return (
                <div key={i} style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 14, padding: "14px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#F5C518" }}>{b.user}</span>
                    <span style={{ fontSize: 9, color: "rgba(240,237,230,0.45)" }}>{b.time}</span>
                  </div>
                  <p style={{ fontSize: 13, margin: "0 0 10px", lineHeight: 1.55, color: "#F0EDE6" }}>{b.msg}</p>
                  <div style={{ display: "flex", gap: 16 }}>
                    <span onClick={function() {
                      setBanter(function(f) {
                        return f.map(function(x, j) {
                          return j === i ? { user: x.user, time: x.time, msg: x.msg, likes: x.likes + 1 } : x;
                        });
                      });
                    }} style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", cursor: "pointer" }}>
                      Fire {b.likes}
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", cursor: "pointer" }}>Reply</span>
                    <span style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", cursor: "pointer", marginLeft: "auto" }}>Share</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "leaders" && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#1a1500,#0f2010)", border: "1px solid rgba(245,197,24,0.3)", borderRadius: 16, padding: "24px 20px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🏆</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#F5C518", letterSpacing: 2, marginBottom: 8 }}>
                LEADERBOARD
              </div>
              <div style={{ fontSize: 12, color: "rgba(240,237,230,0.45)", lineHeight: 1.7, marginBottom: 16 }}>
                Real leaderboards need user accounts. Full login is coming soon.
              </div>
              <div style={{ background: "rgba(240,237,230,0.08)", border: "1px solid #1a3525", borderRadius: 12, padding: "14px" }}>
                <div style={{ fontSize: 11, color: "#F5C518", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2, marginBottom: 10 }}>
                  YOUR SESSION STATS
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 28 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "#9EFF00" }}>{predCount}</div>
                    <div style={{ fontSize: 8, color: "rgba(240,237,230,0.45)", letterSpacing: 1 }}>PREDICTIONS</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "#9EFF00" }}>{pts}</div>
                    <div style={{ fontSize: 8, color: "rgba(240,237,230,0.45)", letterSpacing: 1 }}>POINTS</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "#9EFF00" }}>-</div>
                    <div style={{ fontSize: 8, color: "rgba(240,237,230,0.45)", letterSpacing: 1 }}>RANK</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: "#0f2015", border: "1px solid #1a3525", borderRadius: 14, padding: "16px" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: "#F5C518", letterSpacing: 2, marginBottom: 12 }}>
                COMING SOON
              </div>
              {[
                ["👤", "User accounts and login"],
                ["🏅", "Global leaderboard with real players"],
                ["📊", "Your prediction history and accuracy"],
                ["🎁", "Real airtime and data reward redemption"],
                ["🔔", "Goal alerts and match notifications"],
              ].map(function(item, i) {
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 4 ? "1px solid #1a3525" : "none" }}>
                    <span style={{ fontSize: 18 }}>{item[0]}</span>
                    <span style={{ fontSize: 12, color: "rgba(240,237,230,0.45)" }}>{item[1]}</span>
                    <span style={{ marginLeft: "auto", fontSize: 9, color: "#9EFF00", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>SOON</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "rewards" && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#1a1500,#0f2010)", border: "1px solid rgba(245,197,24,0.3)", borderRadius: 16, padding: "22px 20px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2 }}>YOUR POINTS THIS SESSION</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 56, color: "#F5C518", lineHeight: 1.1, letterSpacing: 3 }}>
                {pts}
              </div>
              <div style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", marginTop: 4 }}>
                Make predictions to earn points
              </div>
            </div>
            <div style={{ background: "#0f2015", border: "1px solid rgba(245,197,24,0.2)", borderRadius: 14, padding: "16px", marginBottom: 14 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: "#F5C518", letterSpacing: 2, marginBottom: 6 }}>
                REWARDS - COMING SOON
              </div>
              <div style={{ fontSize: 11, color: "rgba(240,237,230,0.45)", lineHeight: 1.6, marginBottom: 14 }}>
                Airtime and data bundle redemption is being integrated with MTN, Airtel and Glo. Available at launch.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "100MB Data", icon: "📱", pts: 400, color: "#9EFF00" },
                  { label: "1GB Bundle", icon: "📶", pts: 800, color: "#F5C518" },
                  { label: "5GB Bundle", icon: "🚀", pts: 2200, color: "#FF9900" },
                  { label: "VIP League", icon: "👑", pts: 1000, color: "#c084fc" },
                ].map(function(r, i) {
                  return (
                    <div key={i} style={{ background: "#07100d", border: "1px solid " + r.color + "30", borderRadius: 12, padding: "14px 10px", textAlign: "center", opacity: 0.65 }}>
                      <div style={{ fontSize: 26, marginBottom: 5 }}>{r.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: r.color, marginBottom: 3 }}>{r.label}</div>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, color: "#F5C518" }}>{r.pts} pts</div>
                      <div style={{ fontSize: 8, color: "rgba(240,237,230,0.45)", marginTop: 4, letterSpacing: 1 }}>COMING SOON</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ fontSize: 9, color: "rgba(240,237,230,0.45)", letterSpacing: 2, marginBottom: 10 }}>
              HOW TO EARN POINTS
            </div>
            {[
              ["🎯", "Exact score prediction", "+100 pts"],
              ["🏆", "Correct match winner", "+50 pts"],
              ["⚡", "Daily prediction streak", "+25/day"],
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
            setPreds(function(p) { return Object.assign({}, p, { [id]: pred }); });
            setPts(function(p) { return p + 50; });
            showToast("Prediction locked! +50pts", "#9EFF00");
          }}
        />
      )}
      {teamModal && (
        <TeamModal
          team={teamModal}
          onClose={function() { setTeamModal(null); }}
        />
      )}

    </div>
  );
}
