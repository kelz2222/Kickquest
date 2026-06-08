import { useState, useEffect, useCallback } from "react";

const LOGO = "https://i.imgur.com/JJtXoXJ.png";
const GOOGLE_CLIENT_ID = "185644125904-65hkerj2lu9maacgv5j91g33ief1rm5c.apps.googleusercontent.com";

const T = {
  bg: "#07100d", surface: "#0d1f18", card: "#0f2015", border: "#1a3525",
  gold: "#F5C518", lime: "#9EFF00", red: "#FF3535", white: "#F0EDE6",
  muted: "rgba(240,237,230,0.45)", faint: "rgba(240,237,230,0.08)",
};

const AVATARS = ["⚽","🦁","👑","🔥","🎯","🌟","🇬🇭","🇳🇬","🇰🇪","🇲🇦","🇧🇷","🇫🇷","🇦🇷","🇩🇪","🇪🇸","🏆","💀","🐐","👀","🫡"];

const WC_DATE = new Date("2026-06-11T19:00:00Z");

const WC_FIXTURES = [
  // GROUP A - Mexico, South Korea, Czechia, South Africa
  {id:1,home:"Mexico",away:"South Africa",date:"2026-06-11T19:00:00Z",group:"A",venue:"Mexico City"},
  {id:2,home:"South Korea",away:"Czechia",date:"2026-06-12T02:00:00Z",group:"A",venue:"Guadalajara"},
  {id:3,home:"Mexico",away:"South Korea",date:"2026-06-18T19:00:00Z",group:"A",venue:"Dallas"},
  {id:4,home:"Czechia",away:"South Africa",date:"2026-06-18T22:00:00Z",group:"A",venue:"Seattle"},
  {id:5,home:"Mexico",away:"Czechia",date:"2026-06-25T22:00:00Z",group:"A",venue:"Guadalajara"},
  {id:6,home:"South Africa",away:"South Korea",date:"2026-06-25T22:00:00Z",group:"A",venue:"Kansas City"},

  // GROUP B - Canada, Switzerland, Qatar, Bosnia & Herzegovina
  {id:7,home:"Canada",away:"Bosnia & Herz.",date:"2026-06-12T19:00:00Z",group:"B",venue:"Toronto"},
  {id:8,home:"Switzerland",away:"Qatar",date:"2026-06-12T22:00:00Z",group:"B",venue:"San Francisco"},
  {id:9,home:"Canada",away:"Switzerland",date:"2026-06-19T19:00:00Z",group:"B",venue:"Vancouver"},
  {id:10,home:"Qatar",away:"Bosnia & Herz.",date:"2026-06-19T22:00:00Z",group:"B",venue:"Seattle"},
  {id:11,home:"Canada",away:"Qatar",date:"2026-06-26T22:00:00Z",group:"B",venue:"Kansas City"},
  {id:12,home:"Bosnia & Herz.",away:"Switzerland",date:"2026-06-26T22:00:00Z",group:"B",venue:"Los Angeles"},

  // GROUP C - Brazil, Morocco, Scotland, Haiti
  {id:13,home:"Brazil",away:"Morocco",date:"2026-06-13T22:00:00Z",group:"C",venue:"New York"},
  {id:14,home:"Scotland",away:"Haiti",date:"2026-06-14T01:00:00Z",group:"C",venue:"Boston"},
  {id:15,home:"Brazil",away:"Scotland",date:"2026-06-20T19:00:00Z",group:"C",venue:"San Francisco"},
  {id:16,home:"Morocco",away:"Haiti",date:"2026-06-20T22:00:00Z",group:"C",venue:"Dallas"},
  {id:17,home:"Brazil",away:"Haiti",date:"2026-06-27T02:00:00Z",group:"C",venue:"Boston"},
  {id:18,home:"Morocco",away:"Scotland",date:"2026-06-27T02:00:00Z",group:"C",venue:"Atlanta"},

  // GROUP D - USA, Turkiye, Australia, Paraguay
  {id:19,home:"USA",away:"Paraguay",date:"2026-06-12T01:00:00Z",group:"D",venue:"Los Angeles"},
  {id:20,home:"Turkiye",away:"Australia",date:"2026-06-13T01:00:00Z",group:"D",venue:"Miami"},
  {id:21,home:"USA",away:"Australia",date:"2026-06-19T22:00:00Z",group:"D",venue:"Seattle"},
  {id:22,home:"Paraguay",away:"Turkiye",date:"2026-06-20T01:00:00Z",group:"D",venue:"Houston"},
  {id:23,home:"USA",away:"Turkiye",date:"2026-06-26T02:00:00Z",group:"D",venue:"Los Angeles"},
  {id:24,home:"Australia",away:"Paraguay",date:"2026-06-26T02:00:00Z",group:"D",venue:"Houston"},

  // GROUP E - Germany, Ecuador, Ivory Coast, Curacao
  {id:25,home:"Germany",away:"Curacao",date:"2026-06-14T19:00:00Z",group:"E",venue:"Philadelphia"},
  {id:26,home:"Ecuador",away:"Ivory Coast",date:"2026-06-14T22:00:00Z",group:"E",venue:"Los Angeles"},
  {id:27,home:"Germany",away:"Ecuador",date:"2026-06-20T01:00:00Z",group:"E",venue:"New York"},
  {id:28,home:"Ivory Coast",away:"Curacao",date:"2026-06-21T01:00:00Z",group:"E",venue:"San Francisco"},
  {id:29,home:"Germany",away:"Ivory Coast",date:"2026-06-26T22:00:00Z",group:"E",venue:"Miami"},
  {id:30,home:"Ecuador",away:"Curacao",date:"2026-06-26T22:00:00Z",group:"E",venue:"Seattle"},

  // GROUP F - Netherlands, Japan, Sweden, Tunisia
  {id:31,home:"Netherlands",away:"Japan",date:"2026-06-15T19:00:00Z",group:"F",venue:"Dallas"},
  {id:32,home:"Sweden",away:"Tunisia",date:"2026-06-15T22:00:00Z",group:"F",venue:"Houston"},
  {id:33,home:"Netherlands",away:"Sweden",date:"2026-06-21T19:00:00Z",group:"F",venue:"Kansas City"},
  {id:34,home:"Japan",away:"Tunisia",date:"2026-06-21T22:00:00Z",group:"F",venue:"Los Angeles"},
  {id:35,home:"Netherlands",away:"Tunisia",date:"2026-06-27T22:00:00Z",group:"F",venue:"Atlanta"},
  {id:36,home:"Japan",away:"Sweden",date:"2026-06-27T22:00:00Z",group:"F",venue:"Boston"},

  // GROUP G - Belgium, Iran, Egypt, New Zealand
  {id:37,home:"Belgium",away:"Egypt",date:"2026-06-15T01:00:00Z",group:"G",venue:"Miami"},
  {id:38,home:"Iran",away:"New Zealand",date:"2026-06-16T01:00:00Z",group:"G",venue:"Vancouver"},
  {id:39,home:"Belgium",away:"Iran",date:"2026-06-22T01:00:00Z",group:"G",venue:"Atlanta"},
  {id:40,home:"Egypt",away:"New Zealand",date:"2026-06-22T01:00:00Z",group:"G",venue:"Dallas"},
  {id:41,home:"Belgium",away:"New Zealand",date:"2026-06-27T19:00:00Z",group:"G",venue:"Seattle"},
  {id:42,home:"Egypt",away:"Iran",date:"2026-06-27T19:00:00Z",group:"G",venue:"Philadelphia"},

  // GROUP H - Spain, Uruguay, Saudi Arabia, Cape Verde
  {id:43,home:"Spain",away:"Senegal",date:"2026-06-15T22:00:00Z",group:"H",venue:"Miami"},
  {id:44,home:"Uruguay",away:"Cape Verde",date:"2026-06-16T01:00:00Z",group:"H",venue:"Boston"},
  {id:45,home:"Spain",away:"Uruguay",date:"2026-06-22T22:00:00Z",group:"H",venue:"New York"},
  {id:46,home:"Saudi Arabia",away:"Cape Verde",date:"2026-06-23T01:00:00Z",group:"H",venue:"Kansas City"},
  {id:47,home:"Spain",away:"Cape Verde",date:"2026-06-28T02:00:00Z",group:"H",venue:"Los Angeles"},
  {id:48,home:"Uruguay",away:"Saudi Arabia",date:"2026-06-28T02:00:00Z",group:"H",venue:"Atlanta"},

  // GROUP I - France, Senegal, Norway, Iraq
  {id:49,home:"France",away:"Iraq",date:"2026-06-16T19:00:00Z",group:"I",venue:"Dallas"},
  {id:50,home:"Senegal",away:"Norway",date:"2026-06-16T22:00:00Z",group:"I",venue:"Houston"},
  {id:51,home:"France",away:"Senegal",date:"2026-06-22T19:00:00Z",group:"I",venue:"Los Angeles"},
  {id:52,home:"Norway",away:"Iraq",date:"2026-06-23T01:00:00Z",group:"I",venue:"San Francisco"},
  {id:53,home:"France",away:"Norway",date:"2026-06-28T22:00:00Z",group:"I",venue:"San Francisco"},
  {id:54,home:"Senegal",away:"Iraq",date:"2026-06-28T22:00:00Z",group:"I",venue:"Philadelphia"},

  // GROUP J - Argentina, Austria, Algeria, Jordan
  {id:55,home:"Argentina",away:"Algeria",date:"2026-06-17T01:00:00Z",group:"J",venue:"Boston"},
  {id:56,home:"Austria",away:"Jordan",date:"2026-06-17T19:00:00Z",group:"J",venue:"Kansas City"},
  {id:57,home:"Argentina",away:"Austria",date:"2026-06-23T19:00:00Z",group:"J",venue:"Houston"},
  {id:58,home:"Algeria",away:"Jordan",date:"2026-06-23T22:00:00Z",group:"J",venue:"San Francisco"},
  {id:59,home:"Argentina",away:"Jordan",date:"2026-06-28T19:00:00Z",group:"J",venue:"Miami"},
  {id:60,home:"Algeria",away:"Austria",date:"2026-06-28T19:00:00Z",group:"J",venue:"Dallas"},

  // GROUP K - Portugal, Colombia, DR Congo, Uzbekistan
  {id:61,home:"Portugal",away:"Uzbekistan",date:"2026-06-17T17:00:00Z",group:"K",venue:"Houston"},
  {id:62,home:"Colombia",away:"DR Congo",date:"2026-06-17T20:00:00Z",group:"K",venue:"New York"},
  {id:63,home:"Portugal",away:"Colombia",date:"2026-06-23T22:00:00Z",group:"K",venue:"Los Angeles"},
  {id:64,home:"DR Congo",away:"Uzbekistan",date:"2026-06-24T01:00:00Z",group:"K",venue:"Dallas"},
  {id:65,home:"Portugal",away:"DR Congo",date:"2026-06-28T23:00:00Z",group:"K",venue:"Boston"},
  {id:66,home:"Colombia",away:"Uzbekistan",date:"2026-06-28T23:00:00Z",group:"K",venue:"Atlanta"},

  // GROUP L - England, Croatia, Ghana, Panama
  {id:67,home:"England",away:"Panama",date:"2026-06-18T01:00:00Z",group:"L",venue:"Miami"},
  {id:68,home:"Croatia",away:"Ghana",date:"2026-06-18T19:00:00Z",group:"L",venue:"Dallas"},
  {id:69,home:"England",away:"Ghana",date:"2026-06-24T19:00:00Z",group:"L",venue:"Atlanta"},
  {id:70,home:"Croatia",away:"Panama",date:"2026-06-24T22:00:00Z",group:"L",venue:"Los Angeles"},
  {id:71,home:"England",away:"Croatia",date:"2026-06-27T23:00:00Z",group:"L",venue:"Boston"},
  {id:72,home:"Ghana",away:"Panama",date:"2026-06-27T23:00:00Z",group:"L",venue:"New York"},
];
  

function getCountdown() {
  const diff = WC_DATE - new Date();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 864e5),
    hours: Math.floor((diff % 864e5) / 36e5),
    mins: Math.floor((diff % 36e5) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

function getStatus(dateIso) {
  const now = Date.now();
  const start = new Date(dateIso).getTime();
  const end = start + 105 * 60000;
  if (now < start) return "upcoming";
  if (now <= end) return "live";
  return "finished";
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
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
  if (s.includes("injur")) return "🚑";
  if (s.includes("transfer") || s.includes("sign")) return "💰";
  if (s.includes("world cup") || s.includes("trophy")) return "🏆";
  if (s.includes("goal") || s.includes("win")) return "⚽";
  if (s.includes("squad") || s.includes("lineup")) return "👥";
  if (s.includes("red card") || s.includes("ban")) return "🟥";
  if (s.includes("manager") || s.includes("coach")) return "🧑‍💼";
  return "📰";
}

function uKey(uid, t) { return "kq_" + t + "_" + uid; }

function loadGoogle(cb) {
  if (document.getElementById("gsi")) { cb(); return; }
  const s = document.createElement("script");
  s.id = "gsi"; s.src = "https://accounts.google.com/gsi/client"; s.onload = cb;
  document.head.appendChild(s);
}

async function fetchNews() {
  const key = import.meta.env.VITE_NEWSDATA_API_KEY || "";
  try {
    const r = await fetch("https://newsdata.io/api/1/news?apikey=" + key + "&q=football+world+cup+2026&language=en&category=sports&size=10");
    if (!r.ok) throw new Error();
    const d = await r.json();
    return (d.results || []).map(function(a) {
      return { title: a.title, source: a.source_id || "Football", time: timeAgo(a.pubDate), emoji: pickEmoji(a.title), url: a.link };
    });
  } catch (e) { return null; }
}

async function fetchTeamNews(team) {
  const key = import.meta.env.VITE_NEWSDATA_API_KEY || "";
  try {
    const r = await fetch("https://newsdata.io/api/1/news?apikey=" + key + "&q=" + encodeURIComponent(team + " football world cup") + "&language=en&category=sports&size=5");
    if (!r.ok) throw new Error();
    const d = await r.json();
    return d.results || [];
  } catch (e) { return []; }
}

function Dot() {
  return <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:T.red, boxShadow:"0 0 6px "+T.red, animation:"pulse 1.1s infinite", marginRight:5 }} />;
}

function Toast({ msg, color }) {
  return <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", background:color, color:"#071008", padding:"9px 20px", borderRadius:30, fontSize:12, fontWeight:700, zIndex:2000, whiteSpace:"nowrap", animation:"toastIn 0.3s ease-out", boxShadow:"0 4px 20px "+color+"60" }}>{msg}</div>;
}

function NavTab({ label, active, onClick }) {
  return <button onClick={onClick} style={{ flex:1, padding:"11px 2px 9px", border:"none", background:"transparent", color:active?T.gold:T.muted, fontSize:10, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.8, cursor:"pointer", borderBottom:active?"2px solid "+T.gold:"2px solid transparent", transition:"all 0.2s" }}>{label}</button>;
}

function Countdown() {
  const [cd, setCd] = useState(getCountdown());
  useEffect(function() {
    const t = setInterval(function() { setCd(getCountdown()); }, 1000);
    return function() { clearInterval(t); };
  }, []);
  if (!cd) return (
    <div style={{ background:"linear-gradient(135deg,#1a3500,#0f2010)", border:"1px solid #9EFF0055", borderRadius:14, padding:"14px 16px", marginBottom:12, textAlign:"center" }}>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:T.lime, letterSpacing:2 }}>THE WORLD CUP IS HERE!</div>
      <div style={{ fontSize:11, color:T.muted, marginTop:4 }}>USA - Canada - Mexico 2026</div>
    </div>
  );
  return (
    <div style={{ background:"linear-gradient(135deg,#1a1500,#0a1a08)", border:"1px solid #F5C51840", borderRadius:14, padding:"14px 16px", marginBottom:12 }}>
      <div style={{ fontSize:9, color:T.muted, letterSpacing:2, marginBottom:8, textAlign:"center" }}>WORLD CUP 2026 KICKS OFF IN</div>
      <div style={{ display:"flex", gap:8 }}>
        {[{v:cd.days,l:"DAYS"},{v:cd.hours,l:"HRS"},{v:cd.mins,l:"MINS"},{v:cd.secs,l:"SECS"}].map(function(item, i) {
          return (
            <div key={i} style={{ flex:1, background:"rgba(245,197,24,0.1)", border:"1px solid rgba(245,197,24,0.3)", borderRadius:10, padding:"10px 4px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:T.gold, lineHeight:1 }}>{String(item.v).padStart(2,"0")}</div>
              <div style={{ fontSize:7, color:T.muted, letterSpacing:1.5, marginTop:3 }}>{item.l}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign:"center", marginTop:8, fontSize:9, color:T.muted }}>June 11 - July 19, 2026 · USA · Canada · Mexico</div>
    </div>
  );
}

function MatchCard({ match, pred, onPredict }) {
  const status = getStatus(match.date);
  const live = status === "live";
  const done = status === "finished";
  return (
    <div style={{ background:live?"linear-gradient(135deg,#1a1500,#0f2010)":T.card, border:"1px solid "+(live?T.gold+"55":T.border), borderRadius:14, padding:"14px 15px", marginBottom:10, position:"relative", overflow:"hidden", boxShadow:live?"0 0 20px "+T.gold+"15":"none" }}>
      {live && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,"+T.gold+",transparent)", animation:"shimmer 2s infinite" }} />}
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:9, color:T.gold, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, background:"rgba(245,197,24,0.12)", padding:"2px 7px", borderRadius:5 }}>GROUP {match.group}</span>
          <span style={{ fontSize:9, color:T.muted }}>· {match.venue}</span>
        </div>
        <span style={{ display:"flex", alignItems:"center", fontSize:10, color:live?T.red:done?T.muted:T.lime, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 }}>
          {live && <Dot />}
          {live ? "LIVE" : done ? "FT" : fmtDate(match.date)+" · "+fmtTime(match.date)}
        </span>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, color:T.white }}>{match.home}</div>
        </div>
        <div style={{ minWidth:50, textAlign:"center" }}>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, color:T.muted }}>VS</span>
        </div>
        <div style={{ flex:1, textAlign:"right" }}>
          <div style={{ fontSize:16, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, color:T.white }}>{match.away}</div>
        </div>
      </div>
      {!done && (pred
        ? <div style={{ background:"rgba(158,255,0,0.08)", border:"1px solid rgba(158,255,0,0.3)", borderRadius:8, padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:T.lime }}>Your pick: {match.home} {pred.home} - {pred.away} {match.away}</span>
            <span onClick={function(){ onPredict(match); }} style={{ fontSize:10, color:T.muted, cursor:"pointer" }}>Edit</span>
          </div>
        : <button onClick={function(){ onPredict(match); }} style={{ width:"100%", padding:10, border:"none", borderRadius:10, background:"linear-gradient(135deg,"+T.lime+",#6abf00)", color:"#071008", fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:2, cursor:"pointer", fontWeight:700 }}>
            PREDICT THIS MATCH
          </button>
      )}
      {done && pred && (
        <div style={{ background:"rgba(245,197,24,0.08)", border:"1px solid rgba(245,197,24,0.25)", borderRadius:8, padding:"8px 12px" }}>
          <span style={{ fontSize:11, color:T.gold }}>Your prediction: {match.home} {pred.home} - {pred.away} {match.away}</span>
        </div>
      )}
    </div>
  );
}

function PredictModal({ match, existing, onClose, onSubmit }) {
  const [h, setH] = useState(existing ? existing.home : "");
  const [a, setA] = useState(existing ? existing.away : "");
  const ok = h !== "" && a !== "";
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", zIndex:1000 }}>
      <div onClick={function(e){ e.stopPropagation(); }} style={{ width:"100%", maxWidth:430, margin:"0 auto", background:T.surface, border:"1px solid "+T.border, borderRadius:"22px 22px 0 0", padding:"20px 20px 40px", animation:"slideUp 0.3s ease-out" }}>
        <div style={{ width:36, height:4, background:T.faint, borderRadius:2, margin:"0 auto 20px" }} />
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:T.gold, letterSpacing:2, marginBottom:4 }}>PREDICT SCORE</div>
        <div style={{ fontSize:11, color:T.muted, marginBottom:16 }}>Group {match.group} · {fmtDate(match.date)}</div>
        <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:20 }}>
          <div style={{ flex:1, textAlign:"center" }}>
            <div style={{ fontSize:13, color:T.white, fontWeight:600, marginBottom:10 }}>{match.home}</div>
            <input type="number" min="0" max="20" value={h} onChange={function(e){ setH(e.target.value); }} placeholder="0"
              style={{ width:"100%", padding:"14px", borderRadius:12, border:"1px solid "+T.border, background:T.card, color:T.white, fontSize:32, fontFamily:"'Bebas Neue',sans-serif", textAlign:"center", boxSizing:"border-box", outline:"none" }} />
          </div>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color:T.muted, paddingTop:20 }}>-</span>
          <div style={{ flex:1, textAlign:"center" }}>
            <div style={{ fontSize:13, color:T.white, fontWeight:600, marginBottom:10 }}>{match.away}</div>
            <input type="number" min="0" max="20" value={a} onChange={function(e){ setA(e.target.value); }} placeholder="0"
              style={{ width:"100%", padding:"14px", borderRadius:12, border:"1px solid "+T.border, background:T.card, color:T.white, fontSize:32, fontFamily:"'Bebas Neue',sans-serif", textAlign:"center", boxSizing:"border-box", outline:"none" }} />
          </div>
        </div>
        <div style={{ fontSize:10, color:T.muted, textAlign:"center", marginBottom:14 }}>Your prediction is private — only visible to you</div>
        <button disabled={!ok} onClick={function(){ onSubmit(match.id, {home:h, away:a}); onClose(); }}
          style={{ width:"100%", padding:15, borderRadius:12, border:"none", background:ok?"linear-gradient(135deg,"+T.lime+",#6abf00)":T.faint, color:ok?"#071008":T.muted, fontFamily:"'Bebas Neue',sans-serif", fontSize:17, letterSpacing:2, cursor:ok?"pointer":"default", fontWeight:700 }}>
          LOCK IN PREDICTION
        </button>
      </div>
    </div>
  );
}

function TeamModal({ team, onClose }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(function() {
    fetchTeamNews(team).then(function(a){ setArticles(a); setLoading(false); });
  }, [team]);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
      <div onClick={function(e){ e.stopPropagation(); }} style={{ width:"100%", maxWidth:390, background:T.surface, border:"1px solid "+T.border, borderRadius:20, padding:22, maxHeight:"80vh", overflowY:"auto", animation:"slideUp 0.3s ease-out" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:17, color:T.gold, letterSpacing:2 }}>{team.toUpperCase()} - NEWS</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, fontSize:20, cursor:"pointer" }}>✕</button>
        </div>
        {loading && <div style={{ textAlign:"center", padding:"28px 0", color:T.muted }}><div style={{ fontSize:32, animation:"spin 0.9s linear infinite", display:"inline-block" }}>⚽</div><div style={{ fontSize:10, marginTop:8, letterSpacing:2 }}>LOADING...</div></div>}
        {!loading && articles.length === 0 && <div style={{ color:T.muted, fontSize:12, textAlign:"center", padding:"20px 0" }}>No recent news for {team}.</div>}
        {!loading && articles.map(function(a, i) {
          return (
            <div key={i} style={{ background:T.card, border:"1px solid "+T.border, borderRadius:12, padding:"12px 14px", marginBottom:8 }}>
              <div style={{ fontSize:12, color:T.white, lineHeight:1.5, marginBottom:6 }}>{a.title}</div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:9, color:T.muted }}>{timeAgo(a.pubDate)}</span>
                {a.link && <a href={a.link} target="_blank" rel="noopener noreferrer" style={{ fontSize:9, color:T.lime, textDecoration:"none" }}>Read</a>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SetupProfile({ googleUser, onComplete }) {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("⚽");
  const [favTeam, setFavTeam] = useState("");
  const [error, setError] = useState("");

  const TEAMS = ["Brazil","France","Argentina","Germany","Spain","England","Portugal","Morocco","Nigeria","Ghana","Senegal","Egypt","Netherlands","Belgium","USA","Mexico","South Korea","Japan","Colombia","Uruguay"];

  function handleDone() {
    const u = username.trim();
    if (u.length < 3) { setError("Username must be at least 3 characters"); return; }
    if (u.length > 20) { setError("Username must be 20 characters or less"); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(u)) { setError("Only letters, numbers and underscores"); return; }
    onComplete({ username: u, avatar, favTeam: favTeam.trim() });
  }

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Outfit',sans-serif", overflowY:"auto" }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap'); *{box-sizing:border-box}"}</style>
      <img src={LOGO} alt="KickQuest" style={{ width:70, height:70, objectFit:"contain", marginBottom:12 }} />
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:3, background:"linear-gradient(135deg,"+T.gold+",#c49a10)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>SET UP YOUR PROFILE</div>
      <div style={{ fontSize:11, color:T.muted, letterSpacing:1.5, marginBottom:20, textAlign:"center" }}>Welcome, {googleUser.name.split(" ")[0]}! Choose how you appear in KickQuest.</div>

      <div style={{ width:"100%", maxWidth:360 }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, color:T.muted, letterSpacing:1.5, marginBottom:10 }}>PICK YOUR AVATAR</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
            {AVATARS.map(function(em) {
              return (
                <button key={em} onClick={function(){ setAvatar(em); }}
                  style={{ width:44, height:44, borderRadius:10, border:"2px solid "+(avatar===em?T.gold:T.border), background:avatar===em?"rgba(245,197,24,0.15)":T.card, fontSize:22, cursor:"pointer" }}>
                  {em}
                </button>
              );
            })}
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", border:"2px solid "+T.gold, background:T.card, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>{avatar}</div>
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:T.muted, letterSpacing:1.5, marginBottom:8 }}>CHOOSE A USERNAME</div>
          <input value={username} onChange={function(e){ setUsername(e.target.value); setError(""); }}
            placeholder="e.g. FootballKing_NG"
            maxLength={20}
            style={{ width:"100%", padding:"14px", borderRadius:12, border:"1px solid "+(error?T.red:T.border), background:T.card, color:T.white, fontSize:15, fontFamily:"'Outfit',sans-serif", outline:"none" }} />
          {error && <div style={{ fontSize:10, color:T.red, marginTop:6 }}>{error}</div>}
          <div style={{ fontSize:9, color:T.muted, marginTop:4 }}>3–20 characters. Letters, numbers and underscores only.</div>
        </div>

        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, color:T.muted, letterSpacing:1.5, marginBottom:8 }}>FAVOURITE TEAM <span style={{ color:T.faint }}>(optional)</span></div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {TEAMS.map(function(t) {
              return (
                <button key={t} onClick={function(){ setFavTeam(favTeam===t?"":t); }}
                  style={{ padding:"6px 12px", borderRadius:20, border:"1px solid "+(favTeam===t?T.gold:T.border), background:favTeam===t?"rgba(245,197,24,0.15)":T.faint, color:favTeam===t?T.gold:T.muted, fontSize:11, cursor:"pointer" }}>
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={handleDone}
          style={{ width:"100%", padding:15, borderRadius:12, border:"none", background:"linear-gradient(135deg,"+T.lime+",#6abf00)", color:"#071008", fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:2, cursor:"pointer", fontWeight:700 }}>
          LET'S GO ⚽
        </button>
      </div>
    </div>
  );
}

function LoginScreen({ onGoogleLogin }) {
  useEffect(function() {
    loadGoogle(function() {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: function(response) {
          const parts = response.credential.split(".");
          const payload = JSON.parse(atob(parts[1]));
          onGoogleLogin({ name: payload.name, email: payload.email, picture: payload.picture, id: payload.sub });
        },
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        { theme:"filled_black", size:"large", width:300, text:"signin_with" }
      );
    });
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Outfit',sans-serif" }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap'); @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}} *{box-sizing:border-box}"}</style>
      <img src={LOGO} alt="KickQuest" style={{ width:130, height:130, objectFit:"contain", marginBottom:16, animation:"float 3s ease-in-out infinite" }} />
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:40, letterSpacing:4, background:"linear-gradient(135deg,"+T.gold+",#c49a10)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4, textAlign:"center" }}>KICKQUEST</div>
      <div style={{ fontSize:11, color:T.muted, letterSpacing:2, marginBottom:36, textAlign:"center" }}>PREDICT · PLAY · WIN THE WORLD CUP</div>
      <div style={{ background:T.card, border:"1px solid "+T.border, borderRadius:20, padding:"28px 24px", width:"100%", maxWidth:340, textAlign:"center", marginBottom:32 }}>
        <div style={{ fontSize:28, marginBottom:10 }}>⚽🏆🎯</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:T.gold, letterSpacing:2, marginBottom:8 }}>JOIN THE GAME</div>
        <div style={{ fontSize:12, color:T.muted, lineHeight:1.7, marginBottom:24 }}>
          Predict all 68 World Cup 2026 matches, earn points and compete on the global leaderboard.
        </div>
        <div id="google-btn" style={{ display:"flex", justifyContent:"center", marginBottom:16 }}></div>
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"16px 0" }}>
          <div style={{ flex:1, height:1, background:T.border }} />
          <span style={{ fontSize:10, color:T.muted }}>SAFE & SECURE</span>
          <div style={{ flex:1, height:1, background:T.border }} />
        </div>
        <div style={{ display:"flex", gap:16, justifyContent:"center" }}>
          {[["🔒","Private predictions"],["🆓","Free forever"],["🏅","Real leaderboard"]].map(function(item, i) {
            return (
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontSize:18 }}>{item[0]}</div>
                <div style={{ fontSize:8, color:T.muted, marginTop:2 }}>{item[1]}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display:"flex", gap:28, textAlign:"center" }}>
        {[["🎯","Predict","68 matches"],["🏆","Earn","Points & badges"],["🎁","Win","Data & airtime"]].map(function(item, i) {
          return (
            <div key={i}>
              <div style={{ fontSize:26 }}>{item[0]}</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, color:T.gold, letterSpacing:1 }}>{item[1]}</div>
              <div style={{ fontSize:9, color:T.muted }}>{item[2]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [googleUser, setGoogleUser] = useState(null);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("matches");
  const [filter, setFilter] = useState("ALL");
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(false);
  const [preds, setPreds] = useState({});
  const [pts, setPts] = useState(0);
  const [banter, setBanter] = useState([
    { username:"NaijaOracle", avatar:"👑", time:"2m", msg:"Brazil vs Morocco on June 13 is the group stage match of the tournament!", likes:47 },
    { username:"BantaKing_GH", avatar:"🇬🇭", time:"8m", msg:"Ghana vs Croatia and Panama. We are going through no debate!", likes:93 },
    { username:"MoroccoMagic", avatar:"🌟", time:"15m", msg:"Morocco to stun Brazil again. Atlas Lions never back down!", likes:61 },
    { username:"FootballGod_KE", avatar:"🦁", time:"22m", msg:"England Group K with Croatia and Ghana. Tasty group!", likes:134 },
    { username:"SoccerOracle_NG", avatar:"🎯", time:"35m", msg:"Nigeria vs Saudi Arabia opener. Super Eagles going all the way!", likes:88 },
  ]);
  const [banterInput, setBanterInput] = useState("");
  const [toast, setToast] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [predictModal, setPredictModal] = useState(null);
  const [teamModal, setTeamModal] = useState(null);

  const GROUPS = ["ALL","A","B","C","D","E","F","G","H","I","J","K","L"];

  function showToast(msg, color) {
    setToast({ msg, color: color || T.lime });
    setTimeout(function() { setToast(null); }, 2800);
  }

  useEffect(function() {
    const saved = localStorage.getItem("kq_session");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
        const sp = localStorage.getItem(uKey(u.id, "pts"));
        const sr = localStorage.getItem(uKey(u.id, "preds"));
        if (sp) setPts(parseInt(sp));
        if (sr) setPreds(JSON.parse(sr));
        const board = localStorage.getItem("kq_leaderboard");
        if (board) setLeaderboard(JSON.parse(board));
        setScreen("app");
        return;
      } catch (e) {}
    }
    setScreen("login");
  }, []);

  function handleGoogleLogin(gUser) {
    setGoogleUser(gUser);
    const existing = localStorage.getItem(uKey(gUser.id, "profile"));
    if (existing) {
      finishLogin(Object.assign({}, gUser, JSON.parse(existing)));
    } else {
      setScreen("setup");
    }
  }

  function handleSetupComplete(profile) {
    localStorage.setItem(uKey(googleUser.id, "profile"), JSON.stringify(profile));
    finishLogin(Object.assign({}, googleUser, profile));
  }

  function finishLogin(fullUser) {
    setUser(fullUser);
    localStorage.setItem("kq_session", JSON.stringify(fullUser));
    const sp = localStorage.getItem(uKey(fullUser.id, "pts"));
    const sr = localStorage.getItem(uKey(fullUser.id, "preds"));
    const loadedPts = sp ? parseInt(sp) : 0;
    const loadedPreds = sr ? JSON.parse(sr) : {};
    setPts(loadedPts);
    setPreds(loadedPreds);
    const board = localStorage.getItem("kq_leaderboard");
    if (board) setLeaderboard(JSON.parse(board));
    updateLeaderboard(fullUser, loadedPts, loadedPreds);
    setScreen("app");
    showToast("Welcome, @" + fullUser.username + "!", T.gold);
  }

  function handleLogout() {
    if (window.google) window.google.accounts.id.disableAutoSelect();
    localStorage.removeItem("kq_session");
    setUser(null); setPts(0); setPreds({}); setShowProfile(false);
    setScreen("login");
  }

  function updateLeaderboard(u, userPts, userPreds) {
    const stored = localStorage.getItem("kq_leaderboard");
    let board = stored ? JSON.parse(stored) : [];
    const idx = board.findIndex(function(x){ return x.id === u.id; });
    const entry = { id:u.id, username:u.username, avatar:u.avatar, favTeam:u.favTeam||"", pts:userPts, preds:Object.keys(userPreds).length };
    if (idx >= 0) board[idx] = entry; else board.push(entry);
    board.sort(function(a,b){ return b.pts - a.pts; });
    board = board.slice(0, 50);
    localStorage.setItem("kq_leaderboard", JSON.stringify(board));
    setLeaderboard(board);
  }

  function addPoints(amount) {
    setPts(function(p) {
      const n = Math.max(0, p + amount);
      if (user) { localStorage.setItem(uKey(user.id,"pts"), String(n)); updateLeaderboard(user, n, preds); }
      return n;
    });
  }

  function savePred(id, pred) {
    setPreds(function(p) {
      const np = Object.assign({}, p);
      np[id] = pred;
      if (user) { localStorage.setItem(uKey(user.id,"preds"), JSON.stringify(np)); updateLeaderboard(user, pts, np); }
      return np;
    });
  }

  const loadNews = useCallback(function() {
    if (newsLoading) return;
    setNewsLoading(true); setNewsError(false);
    fetchNews().then(function(n) {
      if (n && n.length > 0) setNews(n); else setNewsError(true);
      setNewsLoading(false);
    });
  }, [newsLoading]);

  useEffect(function() { if (tab === "news") loadNews(); }, [tab]);

  const filteredMatches = filter === "ALL" ? WC_FIXTURES : WC_FIXTURES.filter(function(m){ return m.group === filter; });
  const predCount = Object.keys(preds).length;
  const myRank = user ? leaderboard.findIndex(function(x){ return x.id === user.id; }) + 1 : 0;
  const liveCount = WC_FIXTURES.filter(function(m){ return getStatus(m.date) === "live"; }).length;

  if (screen === "loading") return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <img src={LOGO} alt="" style={{ width:80, height:80, objectFit:"contain", marginBottom:16 }} />
      <div style={{ fontSize:30, animation:"spin 1s linear infinite" }}>⚽</div>
    </div>
  );

  if (screen === "login") return <LoginScreen onGoogleLogin={handleGoogleLogin} />;
  if (screen === "setup") return <SetupProfile googleUser={googleUser} onComplete={handleSetupComplete} />;

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.white, fontFamily:"'Outfit',sans-serif", maxWidth:430, margin:"0 auto", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(1.6)}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(14px) translateX(-50%)}to{opacity:1;transform:translateY(0) translateX(-50%)}}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
        ::-webkit-scrollbar{width:0}
      `}</style>

      {toast && <Toast msg={toast.msg} color={toast.color} />}

      {showProfile && (
        <div onClick={function(){ setShowProfile(false); }} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", zIndex:1000 }}>
          <div onClick={function(e){ e.stopPropagation(); }} style={{ width:"100%", maxWidth:430, margin:"0 auto", background:T.surface, border:"1px solid "+T.border, borderRadius:"22px 22px 0 0", padding:"24px 20px 40px", animation:"slideUp 0.3s ease-out" }}>
            <div style={{ width:36, height:4, background:T.faint, borderRadius:2, margin:"0 auto 20px" }} />
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
              <div style={{ width:60, height:60, borderRadius:"50%", border:"2px solid "+T.gold, background:T.card, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30 }}>{user.avatar}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:18, color:T.white }}>@{user.username}</div>
                <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{user.email}</div>
                {user.favTeam && <div style={{ fontSize:11, color:T.gold, marginTop:3 }}>Supports {user.favTeam}</div>}
                <div style={{ fontSize:10, color:T.lime, marginTop:3 }}>Rank {myRank > 0 ? "#"+myRank : "Unranked"}</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
              {[[pts,"POINTS"],[predCount+"/"+WC_FIXTURES.length,"PREDICTED"],[myRank>0?"#"+myRank:"-","RANK"]].map(function(item, i) {
                return (
                  <div key={i} style={{ background:T.card, border:"1px solid "+T.border, borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:T.gold }}>{item[0]}</div>
                    <div style={{ fontSize:8, color:T.muted, letterSpacing:1 }}>{item[1]}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ background:"rgba(158,255,0,0.06)", border:"1px solid rgba(158,255,0,0.2)", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:11, color:T.muted, textAlign:"center" }}>
              Your predictions are private — only you can see them
            </div>
            <button onClick={handleLogout} style={{ width:"100%", padding:14, background:"rgba(255,53,53,0.15)", border:"1px solid rgba(255,53,53,0.4)", borderRadius:12, color:T.red, fontFamily:"'Bebas Neue',sans-serif", fontSize:15, letterSpacing:2, cursor:"pointer" }}>
              SIGN OUT
            </button>
          </div>
        </div>
      )}

      <div style={{ background:"linear-gradient(180deg,#020805 0%,#07100d 100%)", padding:"14px 14px 0", borderBottom:"1px solid "+T.border, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <img src={LOGO} alt="KickQuest" style={{ width:44, height:44, objectFit:"contain", borderRadius:10 }} />
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:3, background:"linear-gradient(135deg,"+T.gold+",#c49a10)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1 }}>KickQuest</div>
              <div style={{ fontSize:7.5, color:T.muted, letterSpacing:2, marginTop:1 }}>PREDICT · PLAY · WIN THE WORLD CUP</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {liveCount > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(255,53,53,0.18)", border:"1px solid rgba(255,53,53,0.45)", borderRadius:16, padding:"4px 10px" }}>
                <Dot /><span style={{ fontSize:10, color:T.red, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 }}>{liveCount} LIVE</span>
              </div>
            )}
            <div style={{ background:"rgba(245,197,24,0.15)", border:"1px solid rgba(245,197,24,0.38)", borderRadius:18, padding:"5px 10px", display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:11 }}>⚡</span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:14, color:T.gold }}>{pts}</span>
            </div>
            <div onClick={function(){ setShowProfile(true); }} style={{ width:36, height:36, borderRadius:"50%", border:"2px solid "+T.gold, background:T.card, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, cursor:"pointer" }}>
              {user.avatar}
            </div>
          </div>
        </div>
        <div style={{ display:"flex" }}>
          <NavTab label="MATCHES" active={tab==="matches"} onClick={function(){ setTab("matches"); }} />
          <NavTab label="NEWS" active={tab==="news"} onClick={function(){ setTab("news"); }} />
          <NavTab label="BANTER" active={tab==="banter"} onClick={function(){ setTab("banter"); }} />
          <NavTab label="LEADERS" active={tab==="leaders"} onClick={function(){ setTab("leaders"); }} />
          <NavTab label="REWARDS" active={tab==="rewards"} onClick={function(){ setTab("rewards"); }} />
        </div>
      </div>

      <div style={{ padding:"14px 14px 90px" }}>

        {tab === "matches" && (
          <div>
            <Countdown />
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:9, color:T.muted, letterSpacing:2, marginBottom:8 }}>FILTER BY GROUP</div>
              <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4 }}>
                {GROUPS.map(function(g) {
                  return (
                    <button key={g} onClick={function(){ setFilter(g); }}
                      style={{ flexShrink:0, padding:"5px 12px", borderRadius:20, border:"1px solid "+(filter===g?T.gold:T.border), background:filter===g?"rgba(245,197,24,0.15)":T.faint, color:filter===g?T.gold:T.muted, fontSize:11, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, cursor:"pointer" }}>
                      {g==="ALL"?"ALL":"GRP "+g}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ fontSize:9, color:T.muted, letterSpacing:2, marginBottom:10 }}>
              {filteredMatches.length} MATCHES · {predCount} PREDICTED
            </div>
            {filteredMatches.map(function(m) {
              return <MatchCard key={m.id} match={m} pred={preds[m.id]} onPredict={setPredictModal} />;
            })}
          </div>
        )}

        {tab === "news" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div>
                <div style={{ fontSize:13, color:T.white, fontWeight:600 }}>World Cup 2026 News</div>
                <div style={{ fontSize:9, color:T.muted, letterSpacing:1.5, marginTop:2 }}>LIVE via NEWSDATA.IO</div>
              </div>
              <button onClick={loadNews} disabled={newsLoading} style={{ background:T.faint, border:"1px solid "+T.border, borderRadius:16, padding:"6px 14px", color:newsLoading?T.muted:T.lime, fontSize:10, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, cursor:"pointer" }}>
                {newsLoading?"LOADING...":"REFRESH"}
              </button>
            </div>
            {newsLoading && <div style={{ textAlign:"center", padding:"40px 0", color:T.muted }}><div style={{ fontSize:32, animation:"spin 0.9s linear infinite", display:"inline-block" }}>⚽</div><div style={{ fontSize:10, marginTop:8, letterSpacing:2 }}>FETCHING NEWS...</div></div>}
            {!newsLoading && newsError && (
              <div style={{ background:"rgba(255,53,53,0.08)", border:"1px solid rgba(255,53,53,0.25)", borderRadius:14, padding:"20px", textAlign:"center" }}>
                <div style={{ fontSize:12, color:T.red, marginBottom:10 }}>Could not load news.</div>
                <button onClick={loadNews} style={{ background:T.red, border:"none", borderRadius:8, padding:"8px 18px", color:"#fff", fontSize:11, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, cursor:"pointer" }}>RETRY</button>
              </div>
            )}
            {!newsLoading && !newsError && news.length === 0 && (
              <div style={{ textAlign:"center", padding:"40px 0", color:T.muted }}>
                <button onClick={loadNews} style={{ background:T.lime, border:"none", borderRadius:10, padding:"10px 22px", color:"#071008", fontSize:12, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, cursor:"pointer" }}>LOAD NEWS</button>
              </div>
            )}
            {!newsLoading && news.map(function(item, i) {
              return (
                <div key={i} style={{ background:T.card, border:"1px solid "+T.border, borderRadius:14, padding:"14px", marginBottom:10, display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div onClick={function(){ setTeamModal(item.source); }} style={{ width:42, height:42, borderRadius:12, background:"rgba(158,255,0,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0, cursor:"pointer" }}>{item.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:T.white, lineHeight:1.5, marginBottom:7, fontWeight:500 }}>{item.title}</div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span onClick={function(){ setTeamModal(item.source); }} style={{ fontSize:9, color:T.lime, cursor:"pointer", letterSpacing:1, fontWeight:700 }}>{item.source?item.source.toUpperCase():""}</span>
                      <span style={{ fontSize:9, color:T.muted }}>{item.time}</span>
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft:"auto", fontSize:10, color:T.gold, textDecoration:"none", fontWeight:600 }}>Read</a>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "banter" && (
          <div>
            <div style={{ background:T.card, border:"1px solid "+T.border, borderRadius:16, padding:"14px", marginBottom:16 }}>
              <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
                <div style={{ width:34, height:34, borderRadius:"50%", border:"1px solid "+T.border, background:T.surface, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{user.avatar}</div>
                <div style={{ fontSize:12, color:T.gold, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2 }}>@{user.username}</div>
              </div>
              <input value={banterInput} onChange={function(e){ setBanterInput(e.target.value); }}
                onKeyDown={function(e) {
                  if (e.key==="Enter" && banterInput.trim()) {
                    setBanter(function(f){ return [{ username:user.username, avatar:user.avatar, time:"now", msg:banterInput, likes:0 }].concat(f); });
                    setBanterInput(""); addPoints(5);
                    showToast("Banter posted! +5pts", T.gold);
                  }
                }}
                placeholder="Who's winning the World Cup?..."
                style={{ width:"100%", background:T.bg, border:"1px solid "+T.border, borderRadius:10, padding:"12px 14px", outline:"none", color:T.white, fontSize:13, fontFamily:"'Outfit',sans-serif", marginBottom:10 }} />
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                {["🔥","😂","💀","👀","🐐","🏆"].map(function(e) {
                  return <span key={e} style={{ fontSize:18, cursor:"pointer" }} onClick={function(){ setBanterInput(function(v){ return v+e; }); }}>{e}</span>;
                })}
                <button onClick={function() {
                  if (!banterInput.trim()) return;
                  setBanter(function(f){ return [{ username:user.username, avatar:user.avatar, time:"now", msg:banterInput, likes:0 }].concat(f); });
                  setBanterInput(""); addPoints(5);
                  showToast("Banter posted! +5pts", T.gold);
                }} style={{ marginLeft:"auto", background:"linear-gradient(135deg,"+T.lime+",#6abf00)", border:"none", borderRadius:10, padding:"8px 18px", color:"#071008", fontSize:12, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer", fontWeight:700 }}>POST</button>
              </div>
            </div>
            {banter.map(function(b, i) {
              return (
                <div key={i} style={{ background:T.card, border:"1px solid "+T.border, borderRadius:14, padding:"14px", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:T.surface, border:"1px solid "+T.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{b.avatar||"⚽"}</div>
                    <span style={{ fontSize:12, fontWeight:700, color:T.gold }}>@{b.username}</span>
                    <span style={{ fontSize:9, color:T.muted, marginLeft:"auto" }}>{b.time}</span>
                  </div>
                  <p style={{ fontSize:13, margin:"0 0 10px", lineHeight:1.55, color:T.white }}>{b.msg}</p>
                  <div style={{ display:"flex", gap:16 }}>
                    <span onClick={function(){ setBanter(function(f){ return f.map(function(x,j){ return j===i?Object.assign({},x,{likes:x.likes+1}):x; }); }); }} style={{ fontSize:11, color:T.muted, cursor:"pointer" }}>🔥 {b.likes}</span>
                    <span style={{ fontSize:11, color:T.muted, cursor:"pointer" }}>↩ Reply</span>
                    <span style={{ fontSize:11, color:T.muted, cursor:"pointer", marginLeft:"auto" }}>📤</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "leaders" && (
          <div>
            <div style={{ background:"linear-gradient(135deg,#1a1500,#0f2010)", border:"1px solid rgba(245,197,24,0.3)", borderRadius:16, padding:"20px", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                <div style={{ width:56, height:56, borderRadius:"50%", border:"2px solid "+T.gold, background:T.card, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>{user.avatar}</div>
                <div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:T.gold, letterSpacing:2 }}>@{user.username}</div>
                  {user.favTeam && <div style={{ fontSize:10, color:T.muted }}>Supports {user.favTeam}</div>}
                  <div style={{ fontSize:10, color:T.lime, marginTop:2 }}>Rank {myRank>0?"#"+myRank:"Unranked"}</div>
                </div>
                <div style={{ marginLeft:"auto", textAlign:"right" }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:30, color:T.gold }}>{pts}</div>
                  <div style={{ fontSize:8, color:T.muted, letterSpacing:1 }}>POINTS</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                {[[predCount+"/"+WC_FIXTURES.length,"PREDICTED"],[pts>=500?"🏅":"—","BADGE"],[myRank>0?"#"+myRank:"-","RANK"]].map(function(item, i) {
                  return (
                    <div key={i} style={{ flex:1, background:"rgba(240,237,230,0.08)", borderRadius:10, padding:"10px 6px", textAlign:"center" }}>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:T.lime }}>{item[0]}</div>
                      <div style={{ fontSize:7, color:T.muted, letterSpacing:1 }}>{item[1]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ fontSize:9, color:T.muted, letterSpacing:2, marginBottom:10 }}>GLOBAL LEADERBOARD</div>
            {leaderboard.length === 0 && (
              <div style={{ background:T.card, border:"1px solid "+T.border, borderRadius:14, padding:"24px", textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:10 }}>🏆</div>
                <div style={{ fontSize:13, color:T.muted }}>No one on the board yet. Make predictions to appear here.</div>
              </div>
            )}
            {leaderboard.map(function(p, i) {
              const isMe = user && p.id === user.id;
              return (
                <div key={p.id} style={{ background:isMe?"linear-gradient(135deg,#0d2818,#112410)":T.card, border:"1px solid "+(isMe?"rgba(158,255,0,0.38)":T.border), borderRadius:12, padding:"12px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:i===0?T.gold:i===1?"#C0C0C0":i===2?"#CD7F32":T.muted, minWidth:26 }}>#{i+1}</span>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:T.surface, border:isMe?"2px solid "+T.lime:"1px solid "+T.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{p.avatar||"⚽"}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:isMe?T.lime:T.white }}>@{p.username}{isMe?" (You)":""}</div>
                    <div style={{ fontSize:9, color:T.muted }}>{p.preds} predictions{p.favTeam?" · "+p.favTeam:""}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:isMe?T.lime:T.gold }}>{p.pts}</div>
                    <div style={{ fontSize:8, color:T.muted }}>PTS</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "rewards" && (
          <div>
            <div style={{ background:"linear-gradient(135deg,#1a1500,#0f2010)", border:"1px solid rgba(245,197,24,0.3)", borderRadius:16, padding:"22px 20px", marginBottom:16, textAlign:"center" }}>
              <div style={{ fontSize:9, color:T.muted, letterSpacing:2 }}>YOUR TOTAL POINTS</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:56, color:T.gold, lineHeight:1.1, letterSpacing:3 }}>{pts}</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:4 }}>Predict all {WC_FIXTURES.length} matches to maximise points</div>
            </div>
            <div style={{ fontSize:9, color:T.muted, letterSpacing:2, marginBottom:10 }}>HOW TO EARN POINTS</div>
            {[["🎯","Exact score prediction","+100 pts"],["🏆","Correct match winner","+50 pts"],["💬","Post banter","+5 pts"],["📤","Share to TikTok or WhatsApp","+20 pts"],["👥","Refer a friend","+200 pts"]].map(function(item, i) {
              return (
                <div key={i} style={{ background:T.card, border:"1px solid "+T.border, borderRadius:10, padding:"12px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:20 }}>{item[0]}</span>
                  <span style={{ flex:1, fontSize:12, color:T.muted }}>{item[1]}</span>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:14, color:T.lime, letterSpacing:1 }}>{item[2]}</span>
                </div>
              );
            })}
            <div style={{ fontSize:9, color:T.muted, letterSpacing:2, marginBottom:10, marginTop:16 }}>REDEEM REWARDS</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                {label:"100MB Data",icon:"📱",cost:400,color:T.lime},
                {label:"1GB Bundle",icon:"📶",cost:800,color:T.gold},
                {label:"5GB Bundle",icon:"🚀",cost:2200,color:"#FF9900"},
                {label:"VIP League",icon:"👑",cost:1000,color:"#c084fc"},
              ].map(function(r, i) {
                const canAfford = pts >= r.cost;
                return (
                  <button key={i} onClick={function() {
                    if (!canAfford) { showToast("Not enough points!", T.red); return; }
                    addPoints(-r.cost);
                    showToast(r.label+" redeemed!", T.gold);
                  }} style={{ background:T.card, border:"1px solid "+r.color+(canAfford?"60":"20"), borderRadius:14, padding:"16px 10px", textAlign:"center", cursor:canAfford?"pointer":"not-allowed", opacity:canAfford?1:0.5, fontFamily:"inherit" }}>
                    <div style={{ fontSize:28, marginBottom:5 }}>{r.icon}</div>
                    <div style={{ fontSize:11, fontWeight:600, color:r.color, marginBottom:3 }}>{r.label}</div>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, color:T.gold }}>{r.cost} pts</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"#020805", borderTop:"1px solid "+T.border, display:"flex", padding:"8px 0 20px" }}>
        {[{id:"matches",icon:"⚽",label:"Matches"},{id:"news",icon:"📰",label:"News"},{id:"banter",icon:"💬",label:"Banter"},{id:"leaders",icon:"🏆",label:"Leaders"},{id:"rewards",icon:"🎁",label:"Rewards"}].map(function(n) {
          return (
            <button key={n.id} onClick={function(){ setTab(n.id); }} style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, opacity:tab===n.id?1:0.35, transition:"opacity 0.2s", color:tab===n.id?T.gold:T.white }}>
              <span style={{ fontSize:20 }}>{n.icon}</span>
              <span style={{ fontSize:8, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5 }}>{n.label}</span>
            </button>
          );
        })}
      </div>

      {predictModal && (
        <PredictModal
          match={predictModal}
          existing={preds[predictModal.id]}
          onClose={function(){ setPredictModal(null); }}
          onSubmit={function(id, pred) {
            savePred(id, pred); addPoints(50);
            showToast("Prediction locked! +50pts", T.lime);
          }}
        />
      )}
      {teamModal && <TeamModal team={teamModal} onClose={function(){ setTeamModal(null); }} />}
    </div>
  );
}
