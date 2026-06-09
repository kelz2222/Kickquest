import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvUn3MlPHGQEiIk1rP7PG2li4xUskv7bI",
  authDomain: "kickquest-8db8d.firebaseapp.com",
  projectId: "kickquest-8db8d",
  storageBucket: "kickquest-8db8d.firebasestorage.app",
  messagingSenderId: "661793997143",
  appId: "1:661793997143:web:c738bc2a048437332c3e12",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const LOGO = "https://i.imgur.com/JJtXoXJ.png";

const T = {
  bg:"#07100d", surface:"#0d1f18", card:"#0f2015", border:"#1a3525",
  gold:"#F5C518", lime:"#9EFF00", red:"#FF3535", white:"#F0EDE6",
  muted:"rgba(240,237,230,0.45)", faint:"rgba(240,237,230,0.08)",
};

const AVATARS = ["⚽","🦁","👑","🔥","🎯","🌟","🇬🇭","🇳🇬","🇰🇪","🇲🇦","🇧🇷","🇫🇷","🇦🇷","🇩🇪","🇪🇸","🏆","💀","🐐","👀","🫡"];
const TEAMS = ["Brazil","France","Argentina","Germany","Spain","England","Portugal","Morocco","Ghana","Senegal","Egypt","Netherlands","Belgium","USA","Mexico","South Korea","Colombia","Uruguay","Ivory Coast","Algeria"];

const WC_DATE = new Date("2026-06-11T19:00:00Z");

const WC_FIXTURES = [
  {id:1,home:"Mexico",away:"South Africa",date:"2026-06-11T19:00:00Z",group:"A",venue:"Mexico City"},
  {id:2,home:"South Korea",away:"Czechia",date:"2026-06-12T02:00:00Z",group:"A",venue:"Guadalajara"},
  {id:3,home:"Mexico",away:"South Korea",date:"2026-06-18T19:00:00Z",group:"A",venue:"Dallas"},
  {id:4,home:"Czechia",away:"South Africa",date:"2026-06-18T22:00:00Z",group:"A",venue:"Seattle"},
  {id:5,home:"Mexico",away:"Czechia",date:"2026-06-25T22:00:00Z",group:"A",venue:"Guadalajara"},
  {id:6,home:"South Africa",away:"South Korea",date:"2026-06-25T22:00:00Z",group:"A",venue:"Kansas City"},
  {id:7,home:"Canada",away:"Bosnia & Herz.",date:"2026-06-12T19:00:00Z",group:"B",venue:"Toronto"},
  {id:8,home:"Switzerland",away:"Qatar",date:"2026-06-12T22:00:00Z",group:"B",venue:"San Francisco"},
  {id:9,home:"Canada",away:"Switzerland",date:"2026-06-19T19:00:00Z",group:"B",venue:"Vancouver"},
  {id:10,home:"Qatar",away:"Bosnia & Herz.",date:"2026-06-19T22:00:00Z",group:"B",venue:"Seattle"},
  {id:11,home:"Canada",away:"Qatar",date:"2026-06-26T22:00:00Z",group:"B",venue:"Kansas City"},
  {id:12,home:"Bosnia & Herz.",away:"Switzerland",date:"2026-06-26T22:00:00Z",group:"B",venue:"Los Angeles"},
  {id:13,home:"Brazil",away:"Morocco",date:"2026-06-13T22:00:00Z",group:"C",venue:"New York"},
  {id:14,home:"Scotland",away:"Haiti",date:"2026-06-14T01:00:00Z",group:"C",venue:"Boston"},
  {id:15,home:"Brazil",away:"Scotland",date:"2026-06-20T19:00:00Z",group:"C",venue:"San Francisco"},
  {id:16,home:"Morocco",away:"Haiti",date:"2026-06-20T22:00:00Z",group:"C",venue:"Dallas"},
  {id:17,home:"Brazil",away:"Haiti",date:"2026-06-27T02:00:00Z",group:"C",venue:"Boston"},
  {id:18,home:"Morocco",away:"Scotland",date:"2026-06-27T02:00:00Z",group:"C",venue:"Atlanta"},
  {id:19,home:"USA",away:"Paraguay",date:"2026-06-12T01:00:00Z",group:"D",venue:"Los Angeles"},
  {id:20,home:"Turkiye",away:"Australia",date:"2026-06-13T01:00:00Z",group:"D",venue:"Miami"},
  {id:21,home:"USA",away:"Australia",date:"2026-06-19T22:00:00Z",group:"D",venue:"Seattle"},
  {id:22,home:"Paraguay",away:"Turkiye",date:"2026-06-20T01:00:00Z",group:"D",venue:"Houston"},
  {id:23,home:"USA",away:"Turkiye",date:"2026-06-26T02:00:00Z",group:"D",venue:"Los Angeles"},
  {id:24,home:"Australia",away:"Paraguay",date:"2026-06-26T02:00:00Z",group:"D",venue:"Houston"},
  {id:25,home:"Germany",away:"Curacao",date:"2026-06-14T19:00:00Z",group:"E",venue:"Philadelphia"},
  {id:26,home:"Ecuador",away:"Ivory Coast",date:"2026-06-14T22:00:00Z",group:"E",venue:"Los Angeles"},
  {id:27,home:"Germany",away:"Ecuador",date:"2026-06-20T01:00:00Z",group:"E",venue:"New York"},
  {id:28,home:"Ivory Coast",away:"Curacao",date:"2026-06-21T01:00:00Z",group:"E",venue:"San Francisco"},
  {id:29,home:"Germany",away:"Ivory Coast",date:"2026-06-26T22:00:00Z",group:"E",venue:"Miami"},
  {id:30,home:"Ecuador",away:"Curacao",date:"2026-06-26T22:00:00Z",group:"E",venue:"Seattle"},
  {id:31,home:"Netherlands",away:"Japan",date:"2026-06-15T19:00:00Z",group:"F",venue:"Dallas"},
  {id:32,home:"Sweden",away:"Tunisia",date:"2026-06-15T22:00:00Z",group:"F",venue:"Houston"},
  {id:33,home:"Netherlands",away:"Sweden",date:"2026-06-21T19:00:00Z",group:"F",venue:"Kansas City"},
  {id:34,home:"Japan",away:"Tunisia",date:"2026-06-21T22:00:00Z",group:"F",venue:"Los Angeles"},
  {id:35,home:"Netherlands",away:"Tunisia",date:"2026-06-27T22:00:00Z",group:"F",venue:"Atlanta"},
  {id:36,home:"Japan",away:"Sweden",date:"2026-06-27T22:00:00Z",group:"F",venue:"Boston"},
  {id:37,home:"Belgium",away:"Egypt",date:"2026-06-15T01:00:00Z",group:"G",venue:"Miami"},
  {id:38,home:"Iran",away:"New Zealand",date:"2026-06-16T01:00:00Z",group:"G",venue:"Vancouver"},
  {id:39,home:"Belgium",away:"Iran",date:"2026-06-22T01:00:00Z",group:"G",venue:"Atlanta"},
  {id:40,home:"Egypt",away:"New Zealand",date:"2026-06-22T01:00:00Z",group:"G",venue:"Dallas"},
  {id:41,home:"Belgium",away:"New Zealand",date:"2026-06-27T19:00:00Z",group:"G",venue:"Seattle"},
  {id:42,home:"Egypt",away:"Iran",date:"2026-06-27T19:00:00Z",group:"G",venue:"Philadelphia"},
  {id:43,home:"Spain",away:"Saudi Arabia",date:"2026-06-15T22:00:00Z",group:"H",venue:"Miami"},
  {id:44,home:"Uruguay",away:"Cape Verde",date:"2026-06-16T01:00:00Z",group:"H",venue:"Boston"},
  {id:45,home:"Spain",away:"Uruguay",date:"2026-06-22T22:00:00Z",group:"H",venue:"New York"},
  {id:46,home:"Saudi Arabia",away:"Cape Verde",date:"2026-06-23T01:00:00Z",group:"H",venue:"Kansas City"},
  {id:47,home:"Spain",away:"Cape Verde",date:"2026-06-28T02:00:00Z",group:"H",venue:"Los Angeles"},
  {id:48,home:"Uruguay",away:"Saudi Arabia",date:"2026-06-28T02:00:00Z",group:"H",venue:"Atlanta"},
  {id:49,home:"France",away:"Iraq",date:"2026-06-16T19:00:00Z",group:"I",venue:"Dallas"},
  {id:50,home:"Senegal",away:"Norway",date:"2026-06-16T22:00:00Z",group:"I",venue:"Houston"},
  {id:51,home:"France",away:"Senegal",date:"2026-06-22T19:00:00Z",group:"I",venue:"Los Angeles"},
  {id:52,home:"Norway",away:"Iraq",date:"2026-06-23T01:00:00Z",group:"I",venue:"San Francisco"},
  {id:53,home:"France",away:"Norway",date:"2026-06-28T22:00:00Z",group:"I",venue:"San Francisco"},
  {id:54,home:"Senegal",away:"Iraq",date:"2026-06-28T22:00:00Z",group:"I",venue:"Philadelphia"},
  {id:55,home:"Argentina",away:"Algeria",date:"2026-06-17T01:00:00Z",group:"J",venue:"Boston"},
  {id:56,home:"Austria",away:"Jordan",date:"2026-06-17T19:00:00Z",group:"J",venue:"Kansas City"},
  {id:57,home:"Argentina",away:"Austria",date:"2026-06-23T19:00:00Z",group:"J",venue:"Houston"},
  {id:58,home:"Algeria",away:"Jordan",date:"2026-06-23T22:00:00Z",group:"J",venue:"San Francisco"},
  {id:59,home:"Argentina",away:"Jordan",date:"2026-06-28T19:00:00Z",group:"J",venue:"Miami"},
  {id:60,home:"Algeria",away:"Austria",date:"2026-06-28T19:00:00Z",group:"J",venue:"Dallas"},
  {id:61,home:"Portugal",away:"Uzbekistan",date:"2026-06-17T17:00:00Z",group:"K",venue:"Houston"},
  {id:62,home:"Colombia",away:"DR Congo",date:"2026-06-17T20:00:00Z",group:"K",venue:"New York"},
  {id:63,home:"Portugal",away:"Colombia",date:"2026-06-23T22:00:00Z",group:"K",venue:"Los Angeles"},
  {id:64,home:"DR Congo",away:"Uzbekistan",date:"2026-06-24T01:00:00Z",group:"K",venue:"Dallas"},
  {id:65,home:"Portugal",away:"DR Congo",date:"2026-06-28T23:00:00Z",group:"K",venue:"Boston"},
  {id:66,home:"Colombia",away:"Uzbekistan",date:"2026-06-28T23:00:00Z",group:"K",venue:"Atlanta"},
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
  return new Date(iso).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString([], { weekday:"short", month:"short", day:"numeric" });
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
  return "📰";
}

function uKey(uid, t) { return "kq_" + t + "_" + uid; }

function checkDailyBonus(uid, currentPts, onAward) {
  const today = new Date().toDateString();
  const last = localStorage.getItem(uKey(uid, "lastlogin"));
  if (last !== today) {
    localStorage.setItem(uKey(uid, "lastlogin"), today);
    const n = currentPts + 10;
    localStorage.setItem(uKey(uid, "pts"), String(n));
    onAward(n);
  }
}

async function fetchNews() {
  const key = import.meta.env.VITE_NEWSDATA_API_KEY || "";
  try {
    const r = await fetch("https://newsdata.io/api/1/news?apikey=" + key + "&q=football+world+cup+2026&language=en&category=sports&size=10");
    if (!r.ok) throw new Error();
    const d = await r.json();
    return (d.results || []).map(function(a) {
      return { title:a.title, source:a.source_id||"Football", time:timeAgo(a.pubDate), emoji:pickEmoji(a.title), url:a.link };
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
    <div style={{ background:"linear-gradient(135deg,#1a3500,#0f2010)", border:"1px solid #9EFF0055", borderRadius:14, padding:"14px", marginBottom:12, textAlign:"center" }}>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:T.lime, letterSpacing:2 }}>THE WORLD CUP IS HERE!</div>
      <div style={{ fontSize:11, color:T.muted, marginTop:4 }}>USA - Canada - Mexico 2026</div>
    </div>
  );
  return (
    <div style={{ background:"linear-gradient(135deg,#1a1500,#0a1a08)", border:"1px solid #F5C51840", borderRadius:14, padding:"14px 16px", marginBottom:12 }}>
      <div style={{ fontSize:9, color:T.muted, letterSpacing:2, marginBottom:8, textAlign:"center" }}>WORLD CUP 2026 KICKS OFF IN</div>
      <div style={{ display:"flex", gap:8 }}>
        {[{v:cd.days,l:"DAYS"},{v:cd.hours,l:"HRS"},{v:cd.mins,l:"MINS"},{v:cd.secs,l:"SECS"}].map(function(item,i) {
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
  const upcoming = status === "upcoming";
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
        <div style={{ flex:1 }}><div style={{ fontSize:16, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, color:T.white }}>{match.home}</div></div>
        <div style={{ minWidth:50, textAlign:"center" }}><span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, color:T.muted }}>VS</span></div>
        <div style={{ flex:1, textAlign:"right" }}><div style={{ fontSize:16, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, color:T.white }}>{match.away}</div></div>
      </div>
      {upcoming && !pred && (
        <button onClick={function(){onPredict(match);}} style={{ width:"100%", padding:10, border:"none", borderRadius:10, background:"linear-gradient(135deg,"+T.lime+",#6abf00)", color:"#071008", fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:2, cursor:"pointer", fontWeight:700 }}>
          PREDICT THIS MATCH
        </button>
      )}
      {pred && (
        <div style={{ background:done?"rgba(245,197,24,0.08)":"rgba(158,255,0,0.08)", border:"1px solid "+(done?"rgba(245,197,24,0.25)":"rgba(158,255,0,0.3)"), borderRadius:8, padding:"10px 12px" }}>
          <div style={{ fontSize:10, color:done?T.gold:T.lime, marginBottom:3 }}>
            {done ? "Your prediction was:" : "🔒 Locked in:"}
          </div>
          <div style={{ fontSize:14, color:T.white, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 }}>
            {match.home} {pred.home} - {pred.away} {match.away}
          </div>
          {!done && <div style={{ fontSize:9, color:T.muted, marginTop:4 }}>Predictions are final — no editing allowed</div>}
        </div>
      )}
      {live && !pred && (
        <div style={{ background:"rgba(255,53,53,0.08)", border:"1px solid rgba(255,53,53,0.3)", borderRadius:8, padding:"8px 12px", textAlign:"center" }}>
          <span style={{ fontSize:11, color:T.red }}>Match in progress — predictions closed</span>
        </div>
      )}
      {done && !pred && (
        <div style={{ background:T.faint, border:"1px solid "+T.border, borderRadius:8, padding:"8px 12px", textAlign:"center" }}>
          <span style={{ fontSize:11, color:T.muted }}>No prediction made for this match</span>
        </div>
      )}
    </div>
  );
}

function PredictModal({ match, onClose, onSubmit }) {
  const [h, setH] = useState("");
  const [a, setA] = useState("");
  const ok = h !== "" && a !== "";
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", zIndex:1000 }}>
      <div onClick={function(e){e.stopPropagation();}} style={{ width:"100%", maxWidth:430, margin:"0 auto", background:T.surface, border:"1px solid "+T.border, borderRadius:"22px 22px 0 0", padding:"20px 20px 40px", animation:"slideUp 0.3s ease-out" }}>
        <div style={{ width:36, height:4, background:T.faint, borderRadius:2, margin:"0 auto 20px" }} />
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:T.gold, letterSpacing:2, marginBottom:4 }}>PREDICT SCORE</div>
        <div style={{ fontSize:11, color:T.muted, marginBottom:4 }}>Group {match.group} · {fmtDate(match.date)}</div>
        <div style={{ background:"rgba(255,53,53,0.08)", border:"1px solid rgba(255,53,53,0.2)", borderRadius:8, padding:"8px 12px", marginBottom:16 }}>
          <span style={{ fontSize:11, color:T.red }}>⚠️ Once locked, predictions cannot be changed</span>
        </div>
        <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:20 }}>
          <div style={{ flex:1, textAlign:"center" }}>
            <div style={{ fontSize:13, color:T.white, fontWeight:600, marginBottom:10 }}>{match.home}</div>
            <input type="number" min="0" max="20" value={h} onChange={function(e){setH(e.target.value);}} placeholder="0"
              style={{ width:"100%", padding:"14px", borderRadius:12, border:"1px solid "+T.border, background:T.card, color:T.white, fontSize:32, fontFamily:"'Bebas Neue',sans-serif", textAlign:"center", boxSizing:"border-box", outline:"none" }} />
          </div>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color:T.muted, paddingTop:20 }}>-</span>
          <div style={{ flex:1, textAlign:"center" }}>
            <div style={{ fontSize:13, color:T.white, fontWeight:600, marginBottom:10 }}>{match.away}</div>
            <input type="number" min="0" max="20" value={a} onChange={function(e){setA(e.target.value);}} placeholder="0"
              style={{ width:"100%", padding:"14px", borderRadius:12, border:"1px solid "+T.border, background:T.card, color:T.white, fontSize:32, fontFamily:"'Bebas Neue',sans-serif", textAlign:"center", boxSizing:"border-box", outline:"none" }} />
          </div>
        </div>
        <div style={{ fontSize:10, color:T.muted, textAlign:"center", marginBottom:14 }}>
          Points awarded only when official results are confirmed
        </div>
        <button disabled={!ok} onClick={function(){onSubmit(match.id,{home:h,away:a});onClose();}}
          style={{ width:"100%", padding:15, borderRadius:12, border:"none", background:ok?"linear-gradient(135deg,"+T.lime+",#6abf00)":T.faint, color:ok?"#071008":T.muted, fontFamily:"'Bebas Neue',sans-serif", fontSize:17, letterSpacing:2, cursor:ok?"pointer":"default", fontWeight:700 }}>
          LOCK IN — FINAL PREDICTION
        </button>
      </div>
    </div>
  );
}

function TeamModal({ team, onClose }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(function(){fetchTeamNews(team).then(function(a){setArticles(a);setLoading(false);});}, [team]);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
      <div onClick={function(e){e.stopPropagation();}} style={{ width:"100%", maxWidth:390, background:T.surface, border:"1px solid "+T.border, borderRadius:20, padding:22, maxHeight:"80vh", overflowY:"auto", animation:"slideUp 0.3s ease-out" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:17, color:T.gold, letterSpacing:2 }}>{team.toUpperCase()} - NEWS</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, fontSize:20, cursor:"pointer" }}>✕</button>
        </div>
        {loading && <div style={{ textAlign:"center", padding:"28px 0", color:T.muted }}><div style={{ fontSize:32, animation:"spin 0.9s linear infinite", display:"inline-block" }}>⚽</div></div>}
        {!loading && articles.length === 0 && <div style={{ color:T.muted, fontSize:12, textAlign:"center", padding:"20px 0" }}>No recent news for {team}.</div>}
        {!loading && articles.map(function(a,i){
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

function LoadingScreen() {
  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <img src={LOGO} alt="" style={{ width:90, height:90, objectFit:"contain", marginBottom:20 }} />
      <div style={{ fontSize:32, animation:"spin 1s linear infinite" }}>⚽</div>
    </div>
  );
}

function AuthScreen({ onSuccess }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function parseError(err) {
    const c = err.code || "";
    if (c.includes("email-already")) return "This email is already registered. Sign in instead.";
    if (c.includes("wrong-password") || c.includes("invalid-credential")) return "Incorrect email or password.";
    if (c.includes("user-not-found")) return "No account found with this email.";
    if (c.includes("weak-password")) return "Password must be at least 6 characters.";
    if (c.includes("invalid-email")) return "Please enter a valid email address.";
    if (c.includes("popup-closed")) return "";
    return "Something went wrong. Please try again.";
  }

  async function handleEmail() {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && password !== confirm) { setError("Passwords do not match."); return; }
    if (mode === "signup" && password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        onSuccess(cred.user, true);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        onSuccess(cred.user, false);
      }
    } catch (err) { setLoading(false); setError(parseError(err)); }
  }

  async function handleGoogle() {
    setError(""); setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const isNew = !!(cred._tokenResponse && cred._tokenResponse.isNewUser);
      onSuccess(cred.user, isNew);
    } catch (err) { setLoading(false); const e = parseError(err); if (e) setError(e); }
  }

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Outfit',sans-serif" }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap'); @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}} *{box-sizing:border-box}"}</style>

      <img src={LOGO} alt="KickQuest" style={{ width:100, height:100, objectFit:"contain", marginBottom:12, animation:"float 3s ease-in-out infinite" }} />
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:4, background:"linear-gradient(135deg,"+T.gold+",#c49a10)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4, textAlign:"center" }}>KICKQUEST</div>
      <div style={{ fontSize:10, color:T.muted, letterSpacing:2, marginBottom:28, textAlign:"center" }}>PREDICT · PLAY · WIN THE WORLD CUP</div>

      <div style={{ width:"100%", maxWidth:340 }}>
        <div style={{ display:"flex", background:T.card, border:"1px solid "+T.border, borderRadius:14, padding:4, marginBottom:20 }}>
          {[{id:"signin",label:"SIGN IN"},{id:"signup",label:"CREATE ACCOUNT"}].map(function(m) {
            return (
              <button key={m.id} onClick={function(){setMode(m.id);setError("");setEmail("");setPassword("");setConfirm("");}}
                style={{ flex:1, padding:"11px 6px", borderRadius:10, border:"none", background:mode===m.id?"linear-gradient(135deg,"+T.lime+",#6abf00)":T.card, color:mode===m.id?"#071008":T.muted, fontFamily:"'Bebas Neue',sans-serif", fontSize:12, letterSpacing:1.5, cursor:"pointer", fontWeight:700, transition:"all 0.2s" }}>
                {m.label}
              </button>
            );
          })}
        </div>

        <button onClick={handleGoogle} disabled={loading}
          style={{ width:"100%", padding:"13px", borderRadius:12, border:"1px solid "+T.border, background:T.card, color:T.white, fontSize:14, fontFamily:"'Outfit',sans-serif", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:16, fontWeight:600, opacity:loading?0.7:1 }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.5 26.7 36 24 36c-5.2 0-9.7-3.3-11.3-8H6.1C9.5 35.7 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C37 39 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          {mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <div style={{ flex:1, height:1, background:T.border }} />
          <span style={{ fontSize:10, color:T.muted }}>OR WITH EMAIL</span>
          <div style={{ flex:1, height:1, background:T.border }} />
        </div>

        <input value={email} onChange={function(e){setEmail(e.target.value);setError("");}}
          placeholder="Email address" type="email"
          style={{ width:"100%", padding:"13px 14px", borderRadius:12, border:"1px solid "+T.border, background:T.card, color:T.white, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", marginBottom:10 }} />

        <input value={password} onChange={function(e){setPassword(e.target.value);setError("");}}
          placeholder="Password (min 6 characters)" type="password"
          style={{ width:"100%", padding:"13px 14px", borderRadius:12, border:"1px solid "+T.border, background:T.card, color:T.white, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", marginBottom:mode==="signup"?10:16 }} />

        {mode === "signup" && (
          <input value={confirm} onChange={function(e){setConfirm(e.target.value);setError("");}}
            placeholder="Confirm password" type="password"
            style={{ width:"100%", padding:"13px 14px", borderRadius:12, border:"1px solid "+T.border, background:T.card, color:T.white, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", marginBottom:16 }} />
        )}

        {error !== "" && (
          <div style={{ fontSize:11, color:T.red, marginBottom:12, textAlign:"center", padding:"9px 14px", background:"rgba(255,53,53,0.1)", borderRadius:8, border:"1px solid rgba(255,53,53,0.2)" }}>
            {error}
          </div>
        )}

        <button onClick={handleEmail} disabled={loading}
          style={{ width:"100%", padding:14, borderRadius:12, border:"none", background:"linear-gradient(135deg,"+T.lime+",#6abf00)", color:"#071008", fontFamily:"'Bebas Neue',sans-serif", fontSize:16, letterSpacing:2, cursor:"pointer", fontWeight:700, opacity:loading?0.7:1 }}>
          {loading ? "LOADING..." : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
        </button>

        {mode === "signup" && (
          <div style={{ fontSize:10, color:T.muted, textAlign:"center", marginTop:12 }}>
            🎁 Get +10 points signup bonus when you join!
          </div>
        )}
      </div>
    </div>
  );
}

function SetupProfile({ firebaseUser, onComplete }) {
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("⚽");
  const [favTeam, setFavTeam] = useState("");
  const [error, setError] = useState("");

  function handleDone() {
    const u = username.trim();
    if (u.length < 3) { setError("Username must be at least 3 characters"); return; }
    if (u.length > 20) { setError("Username must be 20 characters or less"); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(u)) { setError("Only letters, numbers and underscores"); return; }
    onComplete({ username:u, avatar, favTeam:favTeam.trim() });
  }

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Outfit',sans-serif", overflowY:"auto" }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap'); *{box-sizing:border-box}"}</style>
      <img src={LOGO} alt="" style={{ width:70, height:70, objectFit:"contain", marginBottom:12 }} />
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:3, background:"linear-gradient(135deg,"+T.gold+",#c49a10)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>SET UP YOUR PROFILE</div>
      <div style={{ fontSize:11, color:T.muted, letterSpacing:1.5, marginBottom:20, textAlign:"center" }}>One last step — choose how you appear in KickQuest</div>

      <div style={{ width:"100%", maxWidth:360 }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, color:T.muted, letterSpacing:1.5, marginBottom:10 }}>PICK YOUR AVATAR</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
            {AVATARS.map(function(em) {
              return (
                <button key={em} onClick={function(){setAvatar(em);}}
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
          <input value={username} onChange={function(e){setUsername(e.target.value);setError("");}}
            placeholder="e.g. FootballKing_GH"
            maxLength={20}
            style={{ width:"100%", padding:"13px 14px", borderRadius:12, border:"1px solid "+(error?T.red:T.border), background:T.card, color:T.white, fontSize:15, fontFamily:"'Outfit',sans-serif", outline:"none" }} />
          {error && <div style={{ fontSize:10, color:T.red, marginTop:6 }}>{error}</div>}
          <div style={{ fontSize:9, color:T.muted, marginTop:4 }}>3–20 characters. Letters, numbers and underscores only.</div>
        </div>

        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, color:T.muted, letterSpacing:1.5, marginBottom:8 }}>FAVOURITE TEAM <span style={{ opacity:0.5 }}>(optional)</span></div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {TEAMS.map(function(t) {
              return (
                <button key={t} onClick={function(){setFavTeam(favTeam===t?"":t);}}
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

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("matches");
  const [filter, setFilter] = useState("ALL");
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(false);
  const [preds, setPreds] = useState({});
  const [pts, setPts] = useState(0);
  const [banter, setBanter] = useState([
    {username:"FootballGod_GH",avatar:"🇬🇭",time:"2m",msg:"Ghana vs Croatia and Panama. Black Stars going through no debate!",likes:93},
    {username:"MoroccoMagic",avatar:"🌟",time:"8m",msg:"Morocco vs Brazil Group C. Atlas Lions will cause another upset!",likes:61},
    {username:"BantaKing_KE",avatar:"🦁",time:"15m",msg:"England vs Croatia again in Group L. History repeating itself!",likes:134},
    {username:"SenegalOracle",avatar:"🎯",time:"22m",msg:"France and Senegal in Group I is going to be SPICY!",likes:88},
    {username:"ArgentinaFan",avatar:"🇦🇷",time:"30m",msg:"Argentina defending champions in Group J. Nobody stopping us!",likes:112},
  ]);
  const [banterInput, setBanterInput] = useState("");
  const [toast, setToast] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [predictModal, setPredictModal] = useState(null);
  const [teamModal, setTeamModal] = useState(null);

  const GROUPS = ["ALL","A","B","C","D","E","F","G","H","I","J","K","L"];

  function showToast(msg, color) {
    setToast({msg, color:color||T.lime});
    setTimeout(function(){setToast(null);}, 3000);
  }

  useEffect(function() {
    const unsub = onAuthStateChanged(auth, function(fbUser) {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const profile = localStorage.getItem(uKey(fbUser.uid,"profile"));
        if (profile) {
          const p = JSON.parse(profile);
          const fullUser = Object.assign({id:fbUser.uid, email:fbUser.email}, p);
          setUser(fullUser);
          const sp = localStorage.getItem(uKey(fbUser.uid,"pts"));
          const sr = localStorage.getItem(uKey(fbUser.uid,"preds"));
          const loadedPts = sp ? parseInt(sp) : 0;
          const loadedPreds = sr ? JSON.parse(sr) : {};
          setPts(loadedPts);
          setPreds(loadedPreds);
          const board = localStorage.getItem("kq_leaderboard");
          if (board) setLeaderboard(JSON.parse(board));
          updateLeaderboard(fullUser, loadedPts, loadedPreds);
          checkDailyBonus(fbUser.uid, loadedPts, function(newPts) {
            setPts(newPts);
            updateLeaderboard(fullUser, newPts, loadedPreds);
            showToast("🎁 Daily login bonus! +10pts", T.gold);
          });
          setScreen("app");
        } else {
          setScreen("setup");
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setScreen("login");
      }
    });
    return unsub;
  }, []);

  function handleAuthSuccess(fbUser, isNew) {
    setFirebaseUser(fbUser);
    const profile = localStorage.getItem(uKey(fbUser.uid,"profile"));
    if (profile && !isNew) {
      const p = JSON.parse(profile);
      const fullUser = Object.assign({id:fbUser.uid, email:fbUser.email}, p);
      setUser(fullUser);
      const sp = localStorage.getItem(uKey(fbUser.uid,"pts"));
      const sr = localStorage.getItem(uKey(fbUser.uid,"preds"));
      const loadedPts = sp ? parseInt(sp) : 0;
      const loadedPreds = sr ? JSON.parse(sr) : {};
      setPts(loadedPts);
      setPreds(loadedPreds);
      const board = localStorage.getItem("kq_leaderboard");
      if (board) setLeaderboard(JSON.parse(board));
      updateLeaderboard(fullUser, loadedPts, loadedPreds);
      checkDailyBonus(fbUser.uid, loadedPts, function(newPts) {
        setPts(newPts);
        updateLeaderboard(fullUser, newPts, loadedPreds);
        showToast("🎁 Daily login bonus! +10pts", T.gold);
      });
      setScreen("app");
      showToast("Welcome back, @"+p.username+"!", T.gold);
    } else {
      setScreen("setup");
    }
  }

  function handleSetupComplete(profile) {
    if (!firebaseUser) return;
    localStorage.setItem(uKey(firebaseUser.uid,"profile"), JSON.stringify(profile));
    const fullUser = Object.assign({id:firebaseUser.uid, email:firebaseUser.email}, profile);
    setUser(fullUser);
    localStorage.setItem(uKey(firebaseUser.uid,"pts"), "10");
    localStorage.setItem(uKey(firebaseUser.uid,"lastlogin"), new Date().toDateString());
    setPts(10);
    updateLeaderboard(fullUser, 10, {});
    setScreen("app");
    showToast("Welcome to KickQuest, @"+profile.username+"! +10pts signup bonus!", T.gold);
  }

  async function handleLogout() {
    await signOut(auth);
    setUser(null); setPts(0); setPreds({}); setShowProfile(false);
    setScreen("login");
  }

  function updateLeaderboard(u, userPts, userPreds) {
    const stored = localStorage.getItem("kq_leaderboard");
    let board = stored ? JSON.parse(stored) : [];
    const idx = board.findIndex(function(x){return x.id===u.id;});
    const entry = {id:u.id, username:u.username, avatar:u.avatar, favTeam:u.favTeam||"", pts:userPts, preds:Object.keys(userPreds).length};
    if (idx>=0) board[idx]=entry; else board.push(entry);
    board.sort(function(a,b){return b.pts-a.pts;});
    board = board.slice(0,50);
    localStorage.setItem("kq_leaderboard", JSON.stringify(board));
    setLeaderboard(board);
  }

  function addPoints(amount) {
    setPts(function(p) {
      const n = Math.max(0, p+amount);
      if (user) { localStorage.setItem(uKey(user.id,"pts"), String(n)); updateLeaderboard(user, n, preds); }
      return n;
    });
  }

  function savePred(id, pred) {
    setPreds(function(p) {
      const np = Object.assign({},p);
      np[id] = pred;
      if (user) { localStorage.setItem(uKey(user.id,"preds"), JSON.stringify(np)); updateLeaderboard(user, pts, np); }
      return np;
    });
  }

  const loadNews = useCallback(function() {
    if (newsLoading) return;
    setNewsLoading(true); setNewsError(false);
    fetchNews().then(function(n) {
      if (n&&n.length>0) setNews(n); else setNewsError(true);
      setNewsLoading(false);
    });
  }, [newsLoading]);

  useEffect(function(){if(tab==="news") loadNews();}, [tab]);

  const filteredMatches = filter==="ALL" ? WC_FIXTURES : WC_FIXTURES.filter(function(m){return m.group===filter;});
  const predCount = Object.keys(preds).length;
  const myRank = user ? leaderboard.findIndex(function(x){return x.id===user.id;})+1 : 0;
  const liveCount = WC_FIXTURES.filter(function(m){return getStatus(m.date)==="live";}).length;

  if (screen==="loading") return <LoadingScreen />;
  if (screen==="login") return <AuthScreen onSuccess={handleAuthSuccess} />;
  if (screen==="setup") return <SetupProfile firebaseUser={firebaseUser} onComplete={handleSetupComplete} />;

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
        <div onClick={function(){setShowProfile(false);}} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", zIndex:1000 }}>
          <div onClick={function(e){e.stopPropagation();}} style={{ width:"100%", maxWidth:430, margin:"0 auto", background:T.surface, border:"1px solid "+T.border, borderRadius:"22px 22px 0 0", padding:"24px 20px 40px", animation:"slideUp 0.3s ease-out" }}>
            <div style={{ width:36, height:4, background:T.faint, borderRadius:2, margin:"0 auto 20px" }} />
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
              <div style={{ width:60, height:60, borderRadius:"50%", border:"2px solid "+T.gold, background:T.card, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30 }}>{user.avatar}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:18, color:T.white }}>@{user.username}</div>
                <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{user.email}</div>
                {user.favTeam && <div style={{ fontSize:11, color:T.gold, marginTop:3 }}>Supports {user.favTeam}</div>}
                <div style={{ fontSize:10, color:T.lime, marginTop:3 }}>Rank {myRank>0?"#"+myRank:"Unranked"}</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
              {[[pts,"POINTS"],[predCount+"/"+WC_FIXTURES.length,"PREDICTED"],[myRank>0?"#"+myRank:"-","RANK"]].map(function(item,i){
                return (
                  <div key={i} style={{ background:T.card, border:"1px solid "+T.border, borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:T.gold }}>{item[0]}</div>
                    <div style={{ fontSize:8, color:T.muted, letterSpacing:1 }}>{item[1]}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ background:"rgba(245,197,24,0.06)", border:"1px solid rgba(245,197,24,0.2)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
              <div style={{ fontSize:10, color:T.gold, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, marginBottom:6 }}>HOW TO EARN POINTS</div>
              {[["🎁","Daily login","+10/day"],["🎯","Exact score (after result)","+100 pts"],["🏆","Correct winner (after result)","+50 pts"],["💬","Post banter","+5 pts"]].map(function(item,i){
                return (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:T.muted, marginBottom:3 }}>
                    <span>{item[0]} {item[1]}</span>
                    <span style={{ color:T.lime }}>{item[2]}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ background:"rgba(158,255,0,0.06)", border:"1px solid rgba(158,255,0,0.2)", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:11, color:T.muted, textAlign:"center" }}>
              🔒 Predictions are final once locked — no editing
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
            {liveCount>0 && (
              <div style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(255,53,53,0.18)", border:"1px solid rgba(255,53,53,0.45)", borderRadius:16, padding:"4px 10px" }}>
                <Dot /><span style={{ fontSize:10, color:T.red, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1 }}>{liveCount} LIVE</span>
              </div>
            )}
            <div style={{ background:"rgba(245,197,24,0.15)", border:"1px solid rgba(245,197,24,0.38)", borderRadius:18, padding:"5px 10px", display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:11 }}>⚡</span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:14, color:T.gold }}>{pts}</span>
            </div>
            <div onClick={function(){setShowProfile(true);}} style={{ width:36, height:36, borderRadius:"50%", border:"2px solid "+T.gold, background:T.card, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, cursor:"pointer" }}>
              {user.avatar}
            </div>
          </div>
        </div>
        <div style={{ display:"flex" }}>
          <NavTab label="MATCHES" active={tab==="matches"} onClick={function(){setTab("matches");}} />
          <NavTab label="NEWS" active={tab==="news"} onClick={function(){setTab("news");}} />
          <NavTab label="BANTER" active={tab==="banter"} onClick={function(){setTab("banter");}} />
          <NavTab label="LEADERS" active={tab==="leaders"} onClick={function(){setTab("leaders");}} />
          <NavTab label="REWARDS" active={tab==="rewards"} onClick={function(){setTab("rewards");}} />
        </div>
      </div>

      <div style={{ padding:"14px 14px 90px" }}>

        {tab==="matches" && (
          <div>
            <Countdown />
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:9, color:T.muted, letterSpacing:2, marginBottom:8 }}>FILTER BY GROUP</div>
              <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4 }}>
                {GROUPS.map(function(g){
                  return (
                    <button key={g} onClick={function(){setFilter(g);}}
                      style={{ flexShrink:0, padding:"5px 12px", borderRadius:20, border:"1px solid "+(filter===g?T.gold:T.border), background:filter===g?"rgba(245,197,24,0.15)":T.faint, color:filter===g?T.gold:T.muted, fontSize:11, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5, cursor:"pointer" }}>
                      {g==="ALL"?"ALL":"GRP "+g}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ fontSize:9, color:T.muted, letterSpacing:2, marginBottom:10 }}>{filteredMatches.length} MATCHES · {predCount} LOCKED IN</div>
            {filteredMatches.map(function(m){
              return <MatchCard key={m.id} match={m} pred={preds[m.id]} onPredict={setPredictModal} />;
            })}
          </div>
        )}

        {tab==="news" && (
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
            {!newsLoading && !newsError && news.length===0 && (
              <div style={{ textAlign:"center", padding:"40px 0", color:T.muted }}>
                <button onClick={loadNews} style={{ background:T.lime, border:"none", borderRadius:10, padding:"10px 22px", color:"#071008", fontSize:12, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, cursor:"pointer" }}>LOAD NEWS</button>
              </div>
            )}
            {!newsLoading && news.map(function(item,i){
              return (
                <div key={i} style={{ background:T.card, border:"1px solid "+T.border, borderRadius:14, padding:"14px", marginBottom:10, display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div onClick={function(){setTeamModal(item.source);}} style={{ width:42, height:42, borderRadius:12, background:"rgba(158,255,0,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0, cursor:"pointer" }}>{item.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:T.white, lineHeight:1.5, marginBottom:7, fontWeight:500 }}>{item.title}</div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span onClick={function(){setTeamModal(item.source);}} style={{ fontSize:9, color:T.lime, cursor:"pointer", letterSpacing:1, fontWeight:700 }}>{item.source?item.source.toUpperCase():""}</span>
                      <span style={{ fontSize:9, color:T.muted }}>{item.time}</span>
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft:"auto", fontSize:10, color:T.gold, textDecoration:"none", fontWeight:600 }}>Read</a>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="banter" && (
          <div>
            <div style={{ background:T.card, border:"1px solid "+T.border, borderRadius:16, padding:"14px", marginBottom:16 }}>
              <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
                <div style={{ width:34, height:34, borderRadius:"50%", border:"1px solid "+T.border, background:T.surface, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{user.avatar}</div>
                <div style={{ fontSize:12, color:T.gold, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2 }}>@{user.username}</div>
              </div>
              <input value={banterInput} onChange={function(e){setBanterInput(e.target.value);}}
                onKeyDown={function(e){
                  if (e.key==="Enter"&&banterInput.trim()) {
                    setBanter(function(f){return [{username:user.username,avatar:user.avatar,time:"now",msg:banterInput,likes:0}].concat(f);});
                    setBanterInput(""); addPoints(5);
                    showToast("Banter posted! +5pts", T.gold);
                  }
                }}
                placeholder="Who's winning the World Cup?..."
                style={{ width:"100%", background:T.bg, border:"1px solid "+T.border, borderRadius:10, padding:"12px 14px", outline:"none", color:T.white, fontSize:13, fontFamily:"'Outfit',sans-serif", marginBottom:10 }} />
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                {["🔥","😂","💀","👀","🐐","🏆"].map(function(e){
                  return <span key={e} style={{ fontSize:18, cursor:"pointer" }} onClick={function(){setBanterInput(function(v){return v+e;});}}>{e}</span>;
                })}
                <button onClick={function(){
                  if (!banterInput.trim()) return;
                  setBanter(function(f){return [{username:user.username,avatar:user.avatar,time:"now",msg:banterInput,likes:0}].concat(f);});
                  setBanterInput(""); addPoints(5);
                  showToast("Banter posted! +5pts", T.gold);
                }} style={{ marginLeft:"auto", background:"linear-gradient(135deg,"+T.lime+",#6abf00)", border:"none", borderRadius:10, padding:"8px 18px", color:"#071008", fontSize:12, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, cursor:"pointer", fontWeight:700 }}>POST</button>
              </div>
            </div>
            {banter.map(function(b,i){
              return (
                <div key={i} style={{ background:T.card, border:"1px solid "+T.border, borderRadius:14, padding:"14px", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:T.surface, border:"1px solid "+T.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{b.avatar||"⚽"}</div>
                    <span style={{ fontSize:12, fontWeight:700, color:T.gold }}>@{b.username}</span>
                    <span style={{ fontSize:9, color:T.muted, marginLeft:"auto" }}>{b.time}</span>
                  </div>
                  <p style={{ fontSize:13, margin:"0 0 10px", lineHeight:1.55, color:T.white }}>{b.msg}</p>
                  <div style={{ display:"flex", gap:16 }}>
                    <span onClick={function(){setBanter(function(f){return f.map(function(x,j){return j===i?Object.assign({},x,{likes:x.likes+1}):x;});});}} style={{ fontSize:11, color:T.muted, cursor:"pointer" }}>🔥 {b.likes}</span>
                    <span style={{ fontSize:11, color:T.muted, cursor:"pointer" }}>↩ Reply</span>
                    <span style={{ fontSize:11, color:T.muted, cursor:"pointer", marginLeft:"auto" }}>📤</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="leaders" && (
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
                {[[predCount+"/"+WC_FIXTURES.length,"PREDICTED"],[pts>=500?"🏅":"—","BADGE"],[myRank>0?"#"+myRank:"-","RANK"]].map(function(item,i){
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
            {leaderboard.length===0 && (
              <div style={{ background:T.card, border:"1px solid "+T.border, borderRadius:14, padding:"24px", textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:10 }}>🏆</div>
                <div style={{ fontSize:13, color:T.muted }}>No one on the board yet. Make predictions to appear here.</div>
              </div>
            )}
            {leaderboard.map(function(p,i){
              const isMe = user&&p.id===user.id;
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

        {tab==="rewards" && (
          <div>
            <div style={{ background:"linear-gradient(135deg,#1a1500,#0f2010)", border:"1px solid rgba(245,197,24,0.3)", borderRadius:16, padding:"22px 20px", marginBottom:16, textAlign:"center" }}>
              <div style={{ fontSize:9, color:T.muted, letterSpacing:2 }}>YOUR TOTAL POINTS</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:56, color:T.gold, lineHeight:1.1, letterSpacing:3 }}>{pts}</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:4 }}>Points awarded after match results are confirmed</div>
            </div>
            <div style={{ fontSize:9, color:T.muted, letterSpacing:2, marginBottom:10 }}>HOW TO EARN POINTS</div>
            {[
              ["🎁","Daily login bonus","+10 pts"],
              ["🎯","Exact score (after result)","+100 pts"],
              ["🏆","Correct winner (after result)","+50 pts"],
              ["💬","Post banter","+5 pts"],
              ["📤","Share to TikTok or WhatsApp","+20 pts"],
              ["👥","Refer a friend","+200 pts"],
            ].map(function(item,i){
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
              ].map(function(r,i){
                const canAfford = pts>=r.cost;
                return (
                  <button key={i} onClick={function(){
                    if (!canAfford){showToast("Not enough points!",T.red);return;}
                    addPoints(-r.cost);
                    showToast(r.label+" redeemed!",T.gold);
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
        {[{id:"matches",icon:"⚽",label:"Matches"},{id:"news",icon:"📰",label:"News"},{id:"banter",icon:"💬",label:"Banter"},{id:"leaders",icon:"🏆",label:"Leaders"},{id:"rewards",icon:"🎁",label:"Rewards"}].map(function(n){
          return (
            <button key={n.id} onClick={function(){setTab(n.id);}} style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, opacity:tab===n.id?1:0.35, transition:"opacity 0.2s", color:tab===n.id?T.gold:T.white }}>
              <span style={{ fontSize:20 }}>{n.icon}</span>
              <span style={{ fontSize:8, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1.5 }}>{n.label}</span>
            </button>
          );
        })}
      </div>

      {predictModal && (
        <PredictModal
          match={predictModal}
          onClose={function(){setPredictModal(null);}}
          onSubmit={function(id,pred){
            savePred(id,pred);
            showToast("🔒 Locked in! Points awarded after the result.", T.lime);
          }}
        />
      )}
      {teamModal && <TeamModal team={teamModal} onClose={function(){setTeamModal(null);}} />}
    </div>
  );
}
