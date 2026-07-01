import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, updateProfile,
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
  bg:"#040d08",
  surface:"#071410",
  card:"#0a1a10",
  cardHover:"#0d2015",
  border:"#162e1c",
  borderGlow:"#1f4a28",
  gold:"#F5C518",
  goldDim:"#b8930f",
  lime:"#7fff00",
  limeGlow:"rgba(127,255,0,0.15)",
  red:"#ff4444",
  white:"#F0EDE6",
  muted:"rgba(240,237,230,0.4)",
  faint:"rgba(240,237,230,0.06)",
  glass:"rgba(10,26,16,0.85)",
  green:"#25D366",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;600;700&display=swap');
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  ::-webkit-scrollbar{width:0;height:0}
  input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}
  input[type=number]{-moz-appearance:textfield}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(1.8)}}
  @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
  @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes slideDown{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes toastIn{from{opacity:0;transform:translateY(14px) translateX(-50%)}to{opacity:1;transform:translateY(0) translateX(-50%)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(245,197,24,0.3)}50%{box-shadow:0 0 40px rgba(245,197,24,0.6)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes liveFlash{0%,100%{background:rgba(255,68,68,0.2)}50%{background:rgba(255,68,68,0.05)}}
`;

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
  {id:72,home:"Ghana",away:"Panama",date:"2026-06-17T23:00:00Z",group:"L",venue:"New York"},
];

const WC_ROUND_OF_32 = [
  {id:101,home:"South Africa",away:"Canada",date:"2026-06-28T19:00:00Z",stage:"R32",venue:"Los Angeles"},
  {id:102,home:"Brazil",away:"Japan",date:"2026-06-29T17:00:00Z",stage:"R32",venue:"Houston"},
  {id:103,home:"Germany",away:"Paraguay",date:"2026-06-29T20:30:00Z",stage:"R32",venue:"Boston"},
  {id:104,home:"Netherlands",away:"Morocco",date:"2026-06-30T01:00:00Z",stage:"R32",venue:"Monterrey"},
  {id:105,home:"Ivory Coast",away:"Norway",date:"2026-06-30T17:00:00Z",stage:"R32",venue:"Dallas"},
  {id:106,home:"France",away:"Sweden",date:"2026-06-30T21:00:00Z",stage:"R32",venue:"New York"},
  {id:107,home:"Mexico",away:"Ecuador",date:"2026-07-01T02:00:00Z",stage:"R32",venue:"Mexico City"},
  {id:108,home:"England",away:"DR Congo",date:"2026-07-01T16:00:00Z",stage:"R32",venue:"Atlanta"},
  {id:109,home:"Belgium",away:"Senegal",date:"2026-07-01T20:00:00Z",stage:"R32",venue:"Seattle"},
  {id:110,home:"USA",away:"Bosnia & Herz.",date:"2026-07-02T00:00:00Z",stage:"R32",venue:"San Francisco"},
  {id:111,home:"Spain",away:"Austria",date:"2026-07-02T19:00:00Z",stage:"R32",venue:"Los Angeles"},
  {id:112,home:"Portugal",away:"Croatia",date:"2026-07-02T23:00:00Z",stage:"R32",venue:"Toronto"},
  {id:113,home:"Switzerland",away:"Algeria",date:"2026-07-03T03:00:00Z",stage:"R32",venue:"Vancouver"},
  {id:114,home:"Australia",away:"Egypt",date:"2026-07-03T18:00:00Z",stage:"R32",venue:"Dallas"},
  {id:115,home:"Argentina",away:"Cape Verde",date:"2026-07-03T22:00:00Z",stage:"R32",venue:"Miami"},
  {id:116,home:"Colombia",away:"Ghana",date:"2026-07-04T01:30:00Z",stage:"R32",venue:"Kansas City"},
];

const ALL_FIXTURES = WC_FIXTURES.concat(WC_ROUND_OF_32);

const BONUS_MATCHES = {
  116: { label:"🇬🇭 GHANA BONUS CHALLENGE!", exactPts:200, winnerPts:100 },
};

function getStatus(dateIso) {
  const now = Date.now();
  const start = new Date(dateIso).getTime();
  const end = start + 105 * 60000;
  if (now < start) return "upcoming";
  if (now <= end) return "live";
  return "finished";
}
function getMatchStatus(match, scores) {
  const sc = scores && scores[match.id];
  if (sc && sc.status) return sc.status;
  return getStatus(match.date);
}
function sortMatches(list, scores) {
  const order = { live:0, upcoming:1, finished:2 };
  return list.slice().sort(function(a,b){
    const sa = order[getMatchStatus(a,scores)];
    const sb = order[getMatchStatus(b,scores)];
    if (sa !== sb) return sa - sb;
    return new Date(a.date) - new Date(b.date);
  });
}
function fmtTime(iso){ return new Date(iso).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}); }
function fmtDate(iso){ return new Date(iso).toLocaleDateString([],{weekday:"short",month:"short",day:"numeric"}); }
function timeAgo(pub){
  if(!pub) return "recently";
  const m=Math.floor((Date.now()-new Date(pub))/60000);
  if(m<1) return "just now";
  if(m<60) return m+"m ago";
  const h=Math.floor(m/60);
  if(h<24) return h+"h ago";
  return Math.floor(h/24)+"d ago";
}
function pickEmoji(t){
  if(!t) return "📰";
  const s=t.toLowerCase();
  if(s.includes("injur")) return "🚑";
  if(s.includes("transfer")||s.includes("sign")) return "💰";
  if(s.includes("world cup")||s.includes("trophy")) return "🏆";
  if(s.includes("goal")||s.includes("win")) return "⚽";
  if(s.includes("squad")||s.includes("lineup")) return "👥";
  if(s.includes("red card")||s.includes("ban")) return "🟥";
  return "📰";
}
function uKey(uid,t){ return "kq_"+t+"_"+uid; }
function checkDailyBonus(uid,currentPts,onAward){
  const today=new Date().toDateString();
  const last=localStorage.getItem(uKey(uid,"lastlogin"));
  if(last!==today){
    localStorage.setItem(uKey(uid,"lastlogin"),today);
    const n=currentPts+10;
    localStorage.setItem(uKey(uid,"pts"),String(n));
    onAward(n);
  }
}

async function fetchNews(){
  const key=import.meta.env.VITE_NEWSDATA_API_KEY||"";
  try{
    const r=await fetch("https://newsdata.io/api/1/news?apikey="+key+"&q=football+world+cup+2026&language=en&category=sports&size=10");
    if(!r.ok) throw new Error();
    const d=await r.json();
    return (d.results||[]).map(function(a){
      return {title:a.title,source:a.source_id||"Football",time:timeAgo(a.pubDate),emoji:pickEmoji(a.title),url:a.link};
    });
  }catch(e){return null;}
}
async function fetchTeamNews(team){
  const key=import.meta.env.VITE_NEWSDATA_API_KEY||"";
  try{
    const r=await fetch("https://newsdata.io/api/1/news?apikey="+key+"&q="+encodeURIComponent(team+" football world cup")+"&language=en&category=sports&size=5");
    if(!r.ok) throw new Error();
    const d=await r.json();
    return d.results||[];
  }catch(e){return [];}
}

const TEAM_ALIASES = {
  "South Korea":["South Korea","Korea Republic"],
  "Czechia":["Czechia","Czech Republic"],
  "Ivory Coast":["Ivory Coast","Côte d'Ivoire","Cote d'Ivoire"],
  "Curacao":["Curacao","Curaçao"],
  "USA":["USA","United States"],
  "Bosnia & Herz.":["Bosnia & Herz.","Bosnia and Herzegovina","Bosnia-Herzegovina"],
  "Turkiye":["Turkiye","Türkiye","Turkey"],
  "DR Congo":["DR Congo","Congo DR"],
};
function teamNameMatches(fixtureName,apiName){
  if(!apiName) return false;
  const aliases=TEAM_ALIASES[fixtureName]||[fixtureName];
  const norm=apiName.toLowerCase().trim();
  return aliases.some(function(a){
    const al=a.toLowerCase().trim();
    return al===norm||norm.includes(al)||al.includes(norm);
  });
}
function mapApiStatus(short){
  if(["FT","AET","PEN"].includes(short)) return "finished";
  if(["1H","HT","2H","ET","BT","P","LIVE","INT"].includes(short)) return "live";
  return "upcoming";
}
function todayISO(offsetDays){
  const d=new Date();
  d.setUTCDate(d.getUTCDate()+(offsetDays||0));
  return d.toISOString().slice(0,10);
}
async function fetchScoresForDate(date,key,map){
  try{
    const r=await fetch("https://v3.football.api-sports.io/fixtures?date="+date,{headers:{"x-apisports-key":key}});
    if(!r.ok) return;
    const d=await r.json();
    (d.response||[]).forEach(function(f){
      if(!f.league||f.league.id!==1) return;
      const homeName=f.teams&&f.teams.home&&f.teams.home.name;
      const awayName=f.teams&&f.teams.away&&f.teams.away.name;
      const status=f.fixture&&f.fixture.status&&f.fixture.status.short;
      const goals=f.goals||{};
      const elapsed=f.fixture&&f.fixture.status&&f.fixture.status.elapsed;
      ALL_FIXTURES.forEach(function(fix){
        if(teamNameMatches(fix.home,homeName)&&teamNameMatches(fix.away,awayName)){
          map[fix.id]={
            home:typeof goals.home==="number"?goals.home:null,
            away:typeof goals.away==="number"?goals.away:null,
            status:mapApiStatus(status),
            elapsed:elapsed||null,
          };
        }
      });
    });
  }catch(e){}
}
async function fetchLiveScores(){
  const key=import.meta.env.VITE_APIFOOTBALL_KEY||"";
  if(!key) return null;
  const map={};
  await Promise.all([
    fetchScoresForDate(todayISO(-1),key,map),
    fetchScoresForDate(todayISO(0),key,map),
    fetchScoresForDate(todayISO(1),key,map),
  ]);
  return map;
}

function computePredictionAwards(scoreMap,preds,alreadyScored){
  const awards=[];
  const newlyScored=[];
  Object.keys(scoreMap||{}).forEach(function(idStr){
    const id=parseInt(idStr,10);
    const sc=scoreMap[id];
    if(sc.status!=="finished") return;
    if(alreadyScored.indexOf(id)!==-1) return;
    if(sc.home===null||sc.away===null) return;
    newlyScored.push(id);
    const pred=preds[id];
    if(!pred) return;
    const ph=parseInt(pred.home,10);
    const pa=parseInt(pred.away,10);
    const bonus=BONUS_MATCHES[id];
    if(ph===sc.home&&pa===sc.away){
      awards.push({id,pts:bonus?bonus.exactPts:100,type:"exact",bonus:!!bonus});
    } else {
      const predO=ph>pa?"home":ph<pa?"away":"draw";
      const actO=sc.home>sc.away?"home":sc.home<sc.away?"away":"draw";
      if(predO===actO) awards.push({id,pts:bonus?bonus.winnerPts:50,type:"winner",bonus:!!bonus});
    }
  });
  return {awards,newlyScored};
}

function readProfileFromUser(fbUser){
  if(fbUser.displayName){
    try{ const p=JSON.parse(fbUser.displayName); if(p&&p.username) return p; }catch(e){}
  }
  return null;
}
async function saveProfileToAccount(fbUser,profile){
  localStorage.setItem(uKey(fbUser.uid,"profile"),JSON.stringify(profile));
  try{ await updateProfile(fbUser,{displayName:JSON.stringify(profile)}); }catch(e){}
}
function Dot(){
  return <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:T.red,boxShadow:"0 0 8px "+T.red,animation:"pulse 1s infinite",marginRight:5}}/>;
}

function Toast({msg,color}){
  return(
    <div style={{position:"fixed",bottom:100,left:"50%",transform:"translateX(-50%)",background:color,color:"#040d08",padding:"10px 22px",borderRadius:30,fontSize:13,fontWeight:700,zIndex:3000,whiteSpace:"nowrap",animation:"toastIn 0.3s ease-out",boxShadow:"0 4px 24px "+color+"80",fontFamily:"Inter,sans-serif",letterSpacing:0.3}}>
      {msg}
    </div>
  );
}

function NavTab({label,icon,active,onClick}){
  return(
    <button onClick={onClick} style={{flex:1,padding:"10px 2px 8px",border:"none",background:"transparent",color:active?T.gold:T.muted,fontSize:9,fontFamily:"Inter,sans-serif",fontWeight:active?700:400,letterSpacing:1,cursor:"pointer",borderBottom:active?"2px solid "+T.gold:"2px solid transparent",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <span style={{fontSize:18}}>{icon}</span>
      {label}
    </button>
  );
}

function StatPill({icon,value,label,color}){
  return(
    <div style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid "+T.border,borderRadius:14,padding:"12px 8px",textAlign:"center",backdropFilter:"blur(10px)"}}>
      <div style={{fontSize:18,marginBottom:4}}>{icon}</div>
      <div style={{fontFamily:"Inter,sans-serif",fontWeight:800,fontSize:18,color:color||T.gold,lineHeight:1}}>{value}</div>
      <div style={{fontSize:8,color:T.muted,letterSpacing:1.2,marginTop:3,fontFamily:"Inter,sans-serif",textTransform:"uppercase"}}>{label}</div>
    </div>
  );
}

function WhatsAppCard(){
  return(
    <a href="https://whatsapp.com/channel/0029VbDZLtsHgZWXYbWmzr0C" target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",display:"block",marginBottom:16}}>
      <div style={{background:"linear-gradient(135deg,#0d2b1a,#081a10)",border:"1px solid #25D36630",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,#25D366,transparent)"}}/>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 80% 50%,rgba(37,211,102,0.06),transparent 60%)"}}/>
        <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#25D366,#1aad54)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 16px rgba(37,211,102,0.4)"}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:13,color:"#25D366",marginBottom:3}}>Join our WhatsApp Channel</div>
          <div style={{fontSize:11,color:T.muted,lineHeight:1.5,fontFamily:"Inter,sans-serif"}}>Match alerts · Bonus challenges · Banter</div>
        </div>
        <div style={{background:"linear-gradient(135deg,#25D366,#1aad54)",borderRadius:20,padding:"7px 16px",flexShrink:0,boxShadow:"0 2px 12px rgba(37,211,102,0.3)"}}>
          <span style={{fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:12,color:"#040d08"}}>JOIN</span>
        </div>
      </div>
    </a>
  );
}

function HeroBanner({user,pts,myRank,predCount,liveCount}){
  const hour=new Date().getHours();
  const g=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
  return(
    <div style={{background:"linear-gradient(160deg,#0d2a15 0%,#071410 60%,#040d08 100%)",borderRadius:20,padding:"22px 20px 20px",marginBottom:16,position:"relative",overflow:"hidden",border:"1px solid "+T.border}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,"+T.gold+",transparent)"}}/>
      <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,197,24,0.08),transparent 70%)"}}/>
      <div style={{position:"absolute",bottom:-30,left:-20,width:120,height:120,borderRadius:"50%",background:"radial-gradient(circle,rgba(127,255,0,0.05),transparent 70%)"}}/>
      <div style={{position:"relative"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontSize:11,color:T.muted,fontFamily:"Inter,sans-serif",marginBottom:4}}>{g}, {user.username} 👋</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,background:"linear-gradient(135deg,"+T.gold+",#e8a800)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>WORLD CUP 2026</div>
            <div style={{fontSize:10,color:T.muted,fontFamily:"Inter,sans-serif",marginTop:2,letterSpacing:1}}>ROUND OF 32 · IN PROGRESS</div>
          </div>
          <div style={{textAlign:"right"}}>
            {liveCount>0&&(
              <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,68,68,0.12)",border:"1px solid rgba(255,68,68,0.3)",borderRadius:20,padding:"5px 12px",marginBottom:8,animation:"liveFlash 2s infinite"}}>
                <Dot/><span style={{fontSize:11,color:T.red,fontFamily:"Inter,sans-serif",fontWeight:700}}>{liveCount} LIVE</span>
              </div>
            )}
            <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end"}}>
              <span style={{fontSize:16}}>⚡</span>
              <span style={{fontFamily:"Inter,sans-serif",fontWeight:800,fontSize:24,color:T.gold}}>{pts}</span>
              <span style={{fontSize:10,color:T.muted,fontFamily:"Inter,sans-serif"}}>pts</span>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <StatPill icon="🎯" value={predCount} label="Predicted" color={T.lime}/>
          <StatPill icon="🏆" value={myRank>0?"#"+myRank:"–"} label="Your Rank" color={T.gold}/>
          <StatPill icon="⚽" value="R32" label="Stage" color="#a78bfa"/>
        </div>
      </div>
    </div>
  );
}

function MatchCard({match,pred,score,onPredict}){
  const status=getMatchStatus(match,score?{[match.id]:score}:null);
  const live=status==="live";
  const done=status==="finished";
  const upcoming=status==="upcoming";
  const hasScore=score&&typeof score.home==="number"&&typeof score.away==="number";
  const bonus=BONUS_MATCHES[match.id];

  let predOutcome=null;
  if(done&&hasScore&&pred){
    const ph=parseInt(pred.home,10),pa=parseInt(pred.away,10);
    if(ph===score.home&&pa===score.away) predOutcome={type:"exact"};
    else{
      const predW=ph>pa?"home":ph<pa?"away":"draw";
      const actW=score.home>score.away?"home":score.home<score.away?"away":"draw";
      predOutcome=predW===actW?{type:"winner"}:{type:"miss"};
    }
  }

  return(
    <div style={{
      background:live?"linear-gradient(135deg,#141200,#0d1a08)":done?"rgba(10,26,16,0.6)":T.card,
      border:"1px solid "+(live?T.gold+"60":bonus&&upcoming?"rgba(245,197,24,0.5)":done?T.border+"80":T.border),
      borderRadius:16,padding:"16px",marginBottom:10,position:"relative",overflow:"hidden",
      opacity:done?0.85:1,
      boxShadow:live?"0 0 30px rgba(245,197,24,0.1)":bonus&&upcoming?"0 0 20px rgba(245,197,24,0.08)":"none",
      transition:"all 0.2s",
    }}>
      {live&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,"+T.gold+",transparent)",animation:"shimmer 2s infinite"}}/>}
      {bonus&&upcoming&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,"+T.gold+",transparent)"}}/>}

      {bonus&&(
        <div style={{background:"linear-gradient(135deg,rgba(245,197,24,0.12),rgba(245,197,24,0.05))",border:"1px solid rgba(245,197,24,0.25)",borderRadius:10,padding:"7px 12px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:11,color:T.gold,fontWeight:700,fontFamily:"Inter,sans-serif"}}>{bonus.label}</span>
          <span style={{fontSize:10,color:T.lime,fontFamily:"Inter,sans-serif",fontWeight:600}}>+{bonus.exactPts}pts exact</span>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:9,color:live?T.gold:T.muted,fontFamily:"Inter,sans-serif",fontWeight:600,background:live?"rgba(245,197,24,0.12)":"rgba(255,255,255,0.05)",border:"1px solid "+(live?T.gold+"40":T.border),padding:"3px 8px",borderRadius:6,letterSpacing:0.5}}>
            {match.stage==="R32"?"R32":"GRP "+match.group}
          </span>
          <span style={{fontSize:10,color:T.muted,fontFamily:"Inter,sans-serif"}}>📍 {match.venue}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          {live&&<Dot/>}
          <span style={{fontSize:11,color:live?T.red:done?"rgba(245,197,24,0.5)":T.lime,fontFamily:"Inter,sans-serif",fontWeight:700}}>
            {live?"LIVE"+(score&&score.elapsed?" "+score.elapsed+"'":""):done?"FT":fmtDate(match.date)+" · "+fmtTime(match.date)}
          </span>
        </div>
      </div>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Inter,sans-serif",fontWeight:800,fontSize:17,color:T.white,letterSpacing:-0.3}}>{match.home}</div>
        </div>
        <div style={{minWidth:80,textAlign:"center",padding:"0 8px"}}>
          {hasScore?(
            <div style={{background:live?"rgba(245,197,24,0.12)":"rgba(255,255,255,0.06)",borderRadius:10,padding:"6px 14px",border:"1px solid "+(live?T.gold+"30":T.border)}}>
              <span style={{fontFamily:"Inter,sans-serif",fontWeight:900,fontSize:22,color:live?T.gold:T.white,letterSpacing:2}}>
                {score.home} – {score.away}
              </span>
            </div>
          ):(
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"6px 14px",border:"1px solid "+T.border}}>
              <span style={{fontFamily:"Inter,sans-serif",fontWeight:600,fontSize:14,color:T.muted}}>VS</span>
            </div>
          )}
        </div>
        <div style={{flex:1,textAlign:"right"}}>
          <div style={{fontFamily:"Inter,sans-serif",fontWeight:800,fontSize:17,color:T.white,letterSpacing:-0.3}}>{match.away}</div>
        </div>
      </div>

      {upcoming&&!pred&&(
        <button onClick={function(){onPredict(match);}} style={{width:"100%",padding:"11px",border:"1px solid rgba(127,255,0,0.3)",borderRadius:12,background:"linear-gradient(135deg,#1a3a08,#0f2a05)",color:T.lime,fontFamily:"Inter,sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:0.3,transition:"all 0.2s"}}>
          ⚡ Predict This Match
        </button>
      )}
      {pred&&(
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+(done?"rgba(245,197,24,0.2)":"rgba(127,255,0,0.2)"),borderRadius:12,padding:"10px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:9,color:done?T.gold:T.lime,fontFamily:"Inter,sans-serif",fontWeight:600,marginBottom:4,letterSpacing:0.5}}>{done?"YOUR PREDICTION":"🔒 LOCKED IN"}</div>
              <div style={{fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:15,color:T.white}}>
                {match.home} <span style={{color:T.gold}}>{pred.home} – {pred.away}</span> {match.away}
              </div>
            </div>
            {done&&predOutcome&&(
              <div style={{textAlign:"right"}}>
                {predOutcome.type==="exact"&&<div style={{background:"rgba(127,255,0,0.15)",border:"1px solid rgba(127,255,0,0.3)",borderRadius:8,padding:"4px 10px",fontSize:11,color:T.lime,fontWeight:700,fontFamily:"Inter,sans-serif"}}>🎯 +{bonus?bonus.exactPts:100}</div>}
                {predOutcome.type==="winner"&&<div style={{background:"rgba(245,197,24,0.15)",border:"1px solid rgba(245,197,24,0.3)",borderRadius:8,padding:"4px 10px",fontSize:11,color:T.gold,fontWeight:700,fontFamily:"Inter,sans-serif"}}>🏆 +{bonus?bonus.winnerPts:50}</div>}
                {predOutcome.type==="miss"&&<div style={{background:"rgba(255,68,68,0.1)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:8,padding:"4px 10px",fontSize:11,color:T.red,fontWeight:700,fontFamily:"Inter,sans-serif"}}>❌ Miss</div>}
              </div>
            )}
            {done&&!hasScore&&<div style={{fontSize:10,color:T.muted,fontFamily:"Inter,sans-serif"}}>Pending</div>}
          </div>
          {!done&&<div style={{fontSize:9,color:T.muted,marginTop:6,fontFamily:"Inter,sans-serif"}}>Predictions locked — no editing allowed</div>}
        </div>
      )}
      {live&&!pred&&(
        <div style={{background:"rgba(255,68,68,0.06)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:12,padding:"9px 14px",textAlign:"center"}}>
          <span style={{fontSize:12,color:T.red,fontFamily:"Inter,sans-serif",fontWeight:600}}>Match in progress — predictions closed</span>
        </div>
      )}
      {done&&!pred&&(
        <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"9px 14px",textAlign:"center"}}>
          <span style={{fontSize:11,color:T.muted,fontFamily:"Inter,sans-serif"}}>No prediction made</span>
        </div>
      )}
    </div>
  );
}

function PredictModal({match,onClose,onSubmit}){
  const [h,setH]=useState("");
  const [a,setA]=useState("");
  const ok=h!==""&&a!=="";
  const bonus=BONUS_MATCHES[match.id];
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",zIndex:1000}}>
      <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:430,margin:"0 auto",background:"linear-gradient(180deg,#0d2015,#071410)",border:"1px solid "+T.border,borderRadius:"24px 24px 0 0",padding:"24px 20px 44px",animation:"slideUp 0.3s ease-out"}}>
        <div style={{width:40,height:4,background:T.border,borderRadius:2,margin:"0 auto 22px"}}/>
        <div style={{fontFamily:"Inter,sans-serif",fontWeight:800,fontSize:20,color:T.white,marginBottom:4}}>Predict Score</div>
        <div style={{fontSize:12,color:T.muted,fontFamily:"Inter,sans-serif",marginBottom:16}}>{match.stage==="R32"?"Round of 32":"Group "+match.group} · {fmtDate(match.date)}</div>
        {bonus&&(
          <div style={{background:"linear-gradient(135deg,rgba(245,197,24,0.12),rgba(245,197,24,0.05))",border:"1px solid rgba(245,197,24,0.3)",borderRadius:12,padding:"10px 14px",marginBottom:14,textAlign:"center"}}>
            <div style={{fontSize:13,color:T.gold,fontWeight:700,fontFamily:"Inter,sans-serif",marginBottom:2}}>{bonus.label}</div>
            <div style={{fontSize:11,color:T.lime,fontFamily:"Inter,sans-serif"}}>Exact score = {bonus.exactPts} pts · Correct result = {bonus.winnerPts} pts</div>
          </div>
        )}
        <div style={{background:"rgba(255,68,68,0.06)",border:"1px solid rgba(255,68,68,0.15)",borderRadius:10,padding:"8px 14px",marginBottom:20}}>
          <span style={{fontSize:11,color:T.red,fontFamily:"Inter,sans-serif"}}>⚠️ Once locked, predictions cannot be changed</span>
        </div>
        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:24}}>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:13,color:T.white,fontWeight:700,fontFamily:"Inter,sans-serif",marginBottom:12}}>{match.home}</div>
            <input type="number" min="0" max="20" value={h} onChange={function(e){setH(e.target.value);}} placeholder="0"
              style={{width:"100%",padding:"16px",borderRadius:14,border:"2px solid "+(h!==""?T.gold:T.border),background:"rgba(255,255,255,0.05)",color:T.white,fontSize:36,fontFamily:"Inter,sans-serif",fontWeight:900,textAlign:"center",boxSizing:"border-box",outline:"none",transition:"border-color 0.2s"}}/>
          </div>
          <div style={{paddingTop:28,fontSize:20,color:T.muted,fontWeight:300}}>–</div>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:13,color:T.white,fontWeight:700,fontFamily:"Inter,sans-serif",marginBottom:12}}>{match.away}</div>
            <input type="number" min="0" max="20" value={a} onChange={function(e){setA(e.target.value);}} placeholder="0"
              style={{width:"100%",padding:"16px",borderRadius:14,border:"2px solid "+(a!==""?T.gold:T.border),background:"rgba(255,255,255,0.05)",color:T.white,fontSize:36,fontFamily:"Inter,sans-serif",fontWeight:900,textAlign:"center",boxSizing:"border-box",outline:"none",transition:"border-color 0.2s"}}/>
          </div>
        </div>
        <button disabled={!ok} onClick={function(){onSubmit(match.id,{home:h,away:a});onClose();}}
          style={{width:"100%",padding:16,borderRadius:14,border:ok?"1px solid rgba(127,255,0,0.4)":"1px solid "+T.border,background:ok?"linear-gradient(135deg,#1f4a08,#0f2a05)":"rgba(255,255,255,0.05)",color:ok?T.lime:T.muted,fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:16,cursor:ok?"pointer":"default",letterSpacing:0.3,transition:"all 0.2s"}}>
          {ok?"⚡ Lock In Prediction":"Enter both scores to predict"}
        </button>
      </div>
    </div>
  );
}

function TeamModal({team,onClose}){
  const [articles,setArticles]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(function(){fetchTeamNews(team).then(function(a){setArticles(a);setLoading(false);});},[team]);
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
      <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:390,background:"linear-gradient(180deg,#0d2015,#071410)",border:"1px solid "+T.border,borderRadius:20,padding:22,maxHeight:"80vh",overflowY:"auto",animation:"slideUp 0.3s ease-out"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontFamily:"Inter,sans-serif",fontWeight:800,fontSize:16,color:T.white}}>{team} — Latest News</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",color:T.white,fontSize:18,cursor:"pointer",width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {loading&&<div style={{textAlign:"center",padding:"28
      export default function App(){
  const [screen,setScreen]=useState("loading");
  const [firebaseUser,setFirebaseUser]=useState(null);
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("home");
  const [filter,setFilter]=useState("ALL");
  const [stageView,setStageView]=useState("R32");
  const [news,setNews]=useState([]);
  const [newsLoading,setNewsLoading]=useState(false);
  const [newsError,setNewsError]=useState(false);
  const [preds,setPreds]=useState({});
  const [pts,setPts]=useState(0);
  const [scores,setScores]=useState({});
  const [banter,setBanter]=useState([
    {username:"FootballGod_GH",avatar:"🇬🇭",time:"2m",msg:"Ghana vs Colombia tonight! Black Stars are hungry 🇬🇭🔥",likes:93},
    {username:"MoroccoMagic",avatar:"🌟",time:"8m",msg:"Netherlands vs Morocco was 🔥 Atlas Lions put up a fight!",likes:61},
    {username:"BantaKing_KE",avatar:"🦁",time:"15m",msg:"England looking shaky vs DR Congo. Not convincing at all!",likes:134},
    {username:"SenegalOracle",avatar:"🎯",time:"22m",msg:"France vs Sweden was a statement. Les Bleus are SERIOUS this year",likes:88},
    {username:"ArgentinaFan",avatar:"🇦🇷",time:"30m",msg:"Argentina vs Cape Verde should be easy. Eyes on the QF!",likes:112},
  ]);
  const [banterInput,setBanterInput]=useState("");
  const [toast,setToast]=useState(null);
  const [showProfile,setShowProfile]=useState(false);
  const [leaderboard,setLeaderboard]=useState([]);
  const [predictModal,setPredictModal]=useState(null);
  const [teamModal,setTeamModal]=useState(null);

  const GROUPS=["ALL","A","B","C","D","E","F","G","H","I","J","K","L"];

  function showToast(msg,color){
    setToast({msg,color:color||T.lime});
    setTimeout(function(){setToast(null);},3000);
  }

  async function loadUserSession(fbUser){
    let p=readProfileFromUser(fbUser);
    if(!p){
      const local=localStorage.getItem(uKey(fbUser.uid,"profile"));
      if(local){p=JSON.parse(local);saveProfileToAccount(fbUser,p);}
    } else {
      localStorage.setItem(uKey(fbUser.uid,"profile"),JSON.stringify(p));
    }
    if(!p){setScreen("setup");return;}
    const fullUser=Object.assign({id:fbUser.uid,email:fbUser.email},p);
    setUser(fullUser);
    const sp=localStorage.getItem(uKey(fbUser.uid,"pts"));
    const sr=localStorage.getItem(uKey(fbUser.uid,"preds"));
    const loadedPts=sp?parseInt(sp):0;
    const loadedPreds=sr?JSON.parse(sr):{};
    setPts(loadedPts);
    setPreds(loadedPreds);
    const board=localStorage.getItem("kq_leaderboard");
    if(board) setLeaderboard(JSON.parse(board));
    updateLeaderboard(fullUser,loadedPts,loadedPreds);
    checkDailyBonus(fbUser.uid,loadedPts,function(newPts){
      setPts(newPts);
      updateLeaderboard(fullUser,newPts,loadedPreds);
      showToast("🎁 Daily login bonus! +10pts",T.gold);
    });
    setScreen("app");
  }

  useEffect(function(){
    const unsub=onAuthStateChanged(auth,function(fbUser){
      if(fbUser){setFirebaseUser(fbUser);loadUserSession(fbUser);}
      else{setFirebaseUser(null);setUser(null);setScreen("login");}
    });
    return unsub;
  },[]);

  function handleAuthSuccess(fbUser,isNew){
    setFirebaseUser(fbUser);
    if(isNew){setScreen("setup");return;}
    const p=readProfileFromUser(fbUser)||JSON.parse(localStorage.getItem(uKey(fbUser.uid,"profile"))||"null");
    if(p){loadUserSession(fbUser);showToast("Welcome back, @"+p.username+"!",T.gold);}
    else setScreen("setup");
  }

  async function handleSetupComplete(profile){
    if(!firebaseUser) return;
    await saveProfileToAccount(firebaseUser,profile);
    const fullUser=Object.assign({id:firebaseUser.uid,email:firebaseUser.email},profile);
    setUser(fullUser);
    localStorage.setItem(uKey(firebaseUser.uid,"pts"),"10");
    localStorage.setItem(uKey(firebaseUser.uid,"lastlogin"),new Date().toDateString());
    setPts(10);setPreds({});
    updateLeaderboard(fullUser,10,{});
    setScreen("app");
    showToast("Welcome to KickQuest, @"+profile.username+"! +10pts",T.gold);
  }

  async function handleLogout(){
    await signOut(auth);
    setUser(null);setPts(0);setPreds({});setShowProfile(false);setScreen("login");
  }

  function updateLeaderboard(u,userPts,userPreds){
    const stored=localStorage.getItem("kq_leaderboard");
    let board=stored?JSON.parse(stored):[];
    const idx=board.findIndex(function(x){return x.id===u.id;});
    const entry={id:u.id,username:u.username,avatar:u.avatar,favTeam:u.favTeam||"",pts:userPts,preds:Object.keys(userPreds).length};
    if(idx>=0) board[idx]=entry; else board.push(entry);
    board.sort(function(a,b){return b.pts-a.pts;});
    board=board.slice(0,50);
    localStorage.setItem("kq_leaderboard",JSON.stringify(board));
    setLeaderboard(board);
  }

  function addPoints(amount){
    setPts(function(p){
      const n=Math.max(0,p+amount);
      if(user){localStorage.setItem(uKey(user.id,"pts"),String(n));updateLeaderboard(user,n,preds);}
      return n;
    });
  }

  function savePred(id,pred){
    setPreds(function(p){
      const np=Object.assign({},p);
      np[id]=pred;
      if(user){localStorage.setItem(uKey(user.id,"preds"),JSON.stringify(np));updateLeaderboard(user,pts,np);}
      return np;
    });
  }

  const loadNews=useCallback(function(){
    if(newsLoading) return;
    setNewsLoading(true);setNewsError(false);
    fetchNews().then(function(n){
      if(n&&n.length>0) setNews(n); else setNewsError(true);
      setNewsLoading(false);
    });
  },[newsLoading]);

  useEffect(function(){if(tab==="news") loadNews();},[tab]);
  useEffect(function(){loadNews();},[]);

  const loadScores=useCallback(function(){
    fetchLiveScores().then(function(map){if(!map) return;setScores(map);});
  },[]);

  useEffect(function(){
    loadScores();
    const hasMatchToday=ALL_FIXTURES.some(function(m){
      return new Date(m.date).toDateString()===new Date().toDateString();
    });
    const interval=hasMatchToday?3*60000:15*60000;
    const t=setInterval(loadScores,interval);
    return function(){clearInterval(t);};
  },[loadScores]);

  useEffect(function(){
    if(!user) return;
    if(!scores||Object.keys(scores).length===0) return;
    const scoredKey=uKey(user.id,"scored");
    const stored=localStorage.getItem(scoredKey);
    const alreadyScored=stored?JSON.parse(stored):[];
    const {awards,newlyScored}=computePredictionAwards(scores,preds,alreadyScored);
    if(newlyScored.length===0) return;
    localStorage.setItem(scoredKey,JSON.stringify(alreadyScored.concat(newlyScored)));
    if(awards.length>0){
      let total=0;
      awards.forEach(function(a){total+=a.pts;});
      addPoints(total);
      const exactCount=awards.filter(function(a){return a.type==="exact";}).length;
      const winnerCount=awards.filter(function(a){return a.type==="winner";}).length;
      const bonusCount=awards.filter(function(a){return a.bonus;}).length;
      let msg="🎉 Results in! +"+total+" pts";
      if(exactCount) msg+=" (🎯 "+exactCount+" exact)";
      if(winnerCount) msg+=" (🏆 "+winnerCount+" correct)";
      if(bonusCount) msg+=" 🔥 BONUS!";
      showToast(msg,T.gold);
    }
  },[scores,user]);

  const predCount=Object.keys(preds).length;
  const myRank=user?leaderboard.findIndex(function(x){return x.id===user.id;})+1:0;
  const liveCount=ALL_FIXTURES.filter(function(m){return getMatchStatus(m,scores)==="live";}).length;

  const groupedMatches=stageView==="R32"
    ? sortMatches(WC_ROUND_OF_32,scores)
    : sortMatches(filter==="ALL"?WC_FIXTURES:WC_FIXTURES.filter(function(m){return m.group===filter;}),scores);

  const liveAndUpcomingR32=WC_ROUND_OF_32.filter(function(m){
    const s=getMatchStatus(m,scores);
    return s==="live"||s==="upcoming";
  }).slice(0,3);

  if(screen==="loading") return <LoadingScreen/>;
  if(screen==="login") return <AuthScreen onSuccess={handleAuthSuccess}/>;
  if(screen==="setup") return <SetupProfile firebaseUser={firebaseUser} onComplete={handleSetupComplete}/>;

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.white,fontFamily:"Inter,sans-serif",maxWidth:430,margin:"0 auto",position:"relative"}}>
      <style>{CSS}</style>
      {toast&&<Toast msg={toast.msg} color={toast.color}/>}

      {showProfile&&(
        <div onClick={function(){setShowProfile(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",zIndex:1000}}>
          <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:430,margin:"0 auto",background:"linear-gradient(180deg,#0d2015,#071410)",border:"1px solid "+T.border,borderTop:"1px solid "+T.borderGlow,borderRadius:"24px 24px 0 0",padding:"24px 20px 44px",animation:"slideUp 0.3s ease-out"}}>
            <div style={{width:40,height:4,background:T.border,borderRadius:2,margin:"0 auto 24px"}}/>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
              <div style={{width:64,height:64,borderRadius:"50%",border:"2px solid "+T.gold,background:"rgba(245,197,24,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,boxShadow:"0 0 24px rgba(245,197,24,0.2)"}}>{user.avatar}</div>
              <div>
                <div style={{fontWeight:800,fontSize:18,color:T.white,fontFamily:"Inter,sans-serif"}}>@{user.username}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:2,fontFamily:"Inter,sans-serif"}}>{user.email}</div>
                {user.favTeam&&<div style={{fontSize:11,color:T.gold,marginTop:3,fontFamily:"Inter,sans-serif"}}>Supports {user.favTeam}</div>}
                <div style={{fontSize:10,color:T.lime,marginTop:3,fontFamily:"Inter,sans-serif",fontWeight:600}}>{myRank>0?"Rank #"+myRank:"Unranked"}</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
              {[[pts,"POINTS"],[predCount+"/"+ALL_FIXTURES.length,"PREDICTED"],[myRank>0?"#"+myRank:"–","RANK"]].map(function(item,i){
                return(
                  <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+T.border,borderRadius:14,padding:"14px 8px",textAlign:"center"}}>
                    <div style={{fontWeight:800,fontSize:20,color:T.gold,fontFamily:"Inter,sans-serif"}}>{item[0]}</div>
                    <div style={{fontSize:8,color:T.muted,letterSpacing:1.2,marginTop:3,fontFamily:"Inter,sans-serif"}}>{item[1]}</div>
                  </div>
                );
              })}
            </div>
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+T.border,borderRadius:14,padding:"14px 16px",marginBottom:16}}>
              <div style={{fontSize:11,color:T.gold,fontWeight:700,marginBottom:10,letterSpacing:0.5,fontFamily:"Inter,sans-serif"}}>HOW TO EARN POINTS</div>
              {[["🎁","Daily login","+10/day"],["🎯","Exact score","+100 pts"],["🏆","Correct result","+50 pts"],["💬","Post banter","+5 pts"],["🔥","Bonus challenge","+200 pts"]].map(function(item,i){
                return(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.muted,marginBottom:6,fontFamily:"Inter,sans-serif"}}>
                    <span>{item[0]} {item[1]}</span>
                    <span style={{color:T.lime,fontWeight:600}}>{item[2]}</span>
                  </div>
                );
              })}
            </div>
            <a href="https://whatsapp.com/channel/0029VbDZLtsHgZWXYbWmzr0C" target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",display:"block",marginBottom:12}}>
              <div style={{background:"linear-gradient(135deg,#25D366,#1aad54)",borderRadius:14,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(37,211,102,0.3)"}}>
                <span style={{fontSize:16}}>💬</span>
                <span style={{fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:14,color:"#040d08"}}>Join WhatsApp Channel</span>
              </div>
            </a>
            <button onClick={handleLogout} style={{width:"100%",padding:14,background:"rgba(255,68,68,0.08)",border:"1px solid rgba(255,68,68,0.2)",borderRadius:14,color:T.red,fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>
              Sign Out
            </button>
          </div>
        </div>
      )}

      <div style={{background:"rgba(4,13,8,0.95)",backdropFilter:"blur(20px)",padding:"14px 16px 0",borderBottom:"1px solid "+T.border,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src={LOGO} alt="KickQuest" style={{width:40,height:40,objectFit:"contain",borderRadius:10}}/>
            <div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:3,background:"linear-gradient(135deg,"+T.gold+",#e8a800)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>KickQuest</div>
              <div style={{fontSize:7,color:T.muted,letterSpacing:2,marginTop:1,fontFamily:"Inter,sans-serif"}}>PREDICT · PLAY · WIN</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {liveCount>0&&(
              <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,68,68,0.12)",border:"1px solid rgba(255,68,68,0.25)",borderRadius:16,padding:"4px 10px"}}>
                <Dot/><span style={{fontSize:10,color:T.red,fontFamily:"Inter,sans-serif",fontWeight:700}}>{liveCount}</span>
              </div>
            )}
            <div style={{background:"rgba(245,197,24,0.1)",border:"1px solid rgba(245,197,24,0.25)",borderRadius:16,padding:"5px 12px",display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:10}}>⚡</span>
              <span style={{fontFamily:"Inter,sans-serif",fontWeight:800,fontSize:15,color:T.gold}}>{pts}</span>
            </div>
            <div onClick={function(){setShowProfile(true);}} style={{width:36,height:36,borderRadius:"50%",border:"2px solid "+T.gold,background:"rgba(245,197,24,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",boxShadow:"0 0 12px rgba(245,197,24,0.15)"}}>
              {user.avatar}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:0}}>
          <NavTab label="Home" icon="🏠" active={tab==="home"} onClick={function(){setTab("home");}}/>
          <NavTab label="Matches" icon="⚽" active={tab==="matches"} onClick={function(){setTab("matches");}}/>
          <NavTab label="News" icon="📰" active={tab==="news"} onClick={function(){setTab("news");}}/>
          <NavTab label="Banter" icon="💬" active={tab==="banter"} onClick={function(){setTab("banter");}}/>
          <NavTab label="Leaders" icon="🏆" active={tab==="leaders"} onClick={function(){setTab("leaders");}}/>
        </div>
      </div>

      <div style={{padding:"16px 16px 100px"}}>

        {tab==="home"&&(
          <div style={{animation:"fadeIn 0.3s ease-out"}}>
            <HeroBanner user={user} pts={pts} myRank={myRank} predCount={predCount} liveCount={liveCount}/>
            <WhatsAppCard/>
            <div style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontWeight:700,fontSize:14,color:T.white,fontFamily:"Inter,sans-serif"}}>
                  {liveCount>0?"🔴 Live Now":"⚡ Upcoming Matches"}
                </div>
                <button onClick={function(){setTab("matches");setStageView("R32");}} style={{background:"none",border:"none",color:T.lime,fontSize:12,fontFamily:"Inter,sans-serif",fontWeight:600,cursor:"pointer"}}>See all →</button>
              </div>
              {liveAndUpcomingR32.length===0?(
                <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+T.border,borderRadius:16,padding:"24px",textAlign:"center"}}>
                  <div style={{fontSize:32,marginBottom:8}}>🏆</div>
                  <div style={{fontSize:13,color:T.muted,fontFamily:"Inter,sans-serif"}}>All Round of 32 matches completed!</div>
                </div>
              ):(
                liveAndUpcomingR32.map(function(m){
                  return <MatchCard key={m.id} match={m} pred={preds[m.id]} score={scores[m.id]} onPredict={setPredictModal}/>;
                })
              )}
            </div>
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+T.border,borderRadius:16,padding:"16px",marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:13,color:T.white,fontFamily:"Inter,sans-serif",marginBottom:14}}>📊 Your Stats</div>
              <div style={{display:"flex",gap:10}}>
                <StatPill icon="🎯" value={predCount} label="Predictions" color={T.lime}/>
                <StatPill icon="⚡" value={pts} label="Points" color={T.gold}/>
                <StatPill icon="📈" value={myRank>0?"#"+myRank:"–"} label="Global Rank" color="#a78bfa"/>
              </div>
            </div>
            {leaderboard.length>0&&(
              <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid "+T.border,borderRadius:16,padding:"16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{fontWeight:700,fontSize:13,color:T.white,fontFamily:"Inter,sans-serif"}}>🏆 Leaderboard</div>
                  <button onClick={function(){setTab("leaders");}} style={{background:"none",border:"none",color:T.lime,fontSize:12,fontFamily:"Inter,sans-serif",fontWeight:600,cursor:"pointer"}}>Full board →</button>
                </div>
                {leaderboard.slice(0,3).map(function(p,i){
                  const isMe=user&&p.id===user.id;
                  return(
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<2?"1px solid "+T.border:"none"}}>
                      <span style={{fontWeight:800,fontSize:16,color:i===0?T.gold:i===1?"#C0C0C0":"#CD7F32",minWidth:24,fontFamily:"Inter,sans-serif"}}>#{i+1}</span>
                      <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.06)",border:"1px solid "+(isMe?T.lime:T.border),display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{p.avatar||"⚽"}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:isMe?T.lime:T.white,fontFamily:"Inter,sans-serif"}}>@{p.username}{isMe?" (You)":""}</div>
                      </div>
                      <div style={{fontWeight:800,fontSize:15,color:isMe?T.lime:T.gold,fontFamily:"Inter,sans-serif"}}>{p.pts}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab==="matches"&&(
          <div style={{animation:"fadeIn 0.3s ease-out"}}>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              <button onClick={function(){setStageView("R32");}}
                style={{flex:1,padding:"11px 6px",borderRadius:12,border:"1px solid "+(stageView==="R32"?T.gold:T.border),background:stageView==="R32"?"rgba(245,197,24,0.12)":"rgba(255,255,255,0.04)",color:stageView==="R32"?T.gold:T.muted,fontFamily:"Inter,sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>
                🔥 Round of 32
              </button>
              <button onClick={function(){setStageView("GROUP");}}
                style={{flex:1,padding:"11px 6px",borderRadius:12,border:"1px solid "+(stageView==="GROUP"?T.gold:T.border),background:stageView==="GROUP"?"rgba(245,197,24,0
