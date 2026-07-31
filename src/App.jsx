import { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, collection,
  onSnapshot, query, orderBy, limit, serverTimestamp, addDoc,
  increment, writeBatch, getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const LOGO = "https://i.imgur.com/JJtXoXJ.png";

const C = {
  bg:"#0a0a0a",
  surface:"#111111",
  elevated:"#181818",
  border:"#242424",
  borderBright:"#333333",
  gold:"#c9a227",
  goldBright:"#f0c040",
  goldGlow:"rgba(201,162,39,0.15)",
  goldDim:"rgba(201,162,39,0.08)",
  cyan:"#c9a227",
  cyanGlow:"rgba(201,162,39,0.15)",
  green:"#22c55e",
  greenDim:"rgba(34,197,94,0.12)",
  red:"#ef4444", redDim:"rgba(239,68,68,0.12)",
  purple:"#a78bfa", purpleGlow:"rgba(167,139,250,0.12)",
  white:"#ffffff",
  silver:"#c0c0c0",
  muted:"rgba(255,255,255,0.4)",
  faint:"rgba(255,255,255,0.05)",
  wa:"#25D366",
  coin:"#c9a227",
  accent:"#c9a227",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
  ::-webkit-scrollbar{width:0;height:0}
  input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}
  input[type=number]{-moz-appearance:textfield}
  body{background:#0a0a0a}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.25;transform:scale(2)}}
  @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
  @keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
  @keyframes toastIn{from{opacity:0;transform:translateY(12px) translateX(-50%)}to{opacity:1;transform:translateY(0) translateX(-50%)}}
  @keyframes liveGlow{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)}50%{box-shadow:0 0 0 6px rgba(34,197,94,0)}}
  @keyframes aiTyping{0%,100%{opacity:0.3}50%{opacity:1}}
  @keyframes goldShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
`;

const LEAGUES = {
  EPL:  { id:39,  name:"Premier League",       flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", country:"England",  season:2025 },
  UCL:  { id:2,   name:"Champions League",     flag:"⭐", country:"Europe",   season:2025 },
  LIGA: { id:140, name:"La Liga",              flag:"🇪🇸", country:"Spain",    season:2025 },
  BUN:  { id:78,  name:"Bundesliga",           flag:"🇩🇪", country:"Germany",  season:2025 },
  SA:   { id:135, name:"Serie A",              flag:"🇮🇹", country:"Italy",    season:2025 },
  GPL:  { id:169, name:"Ghana Premier League", flag:"🇬🇭", country:"Ghana",    season:2025 },
  NPFL: { id:332, name:"NPFL Nigeria",         flag:"🇳🇬", country:"Nigeria",  season:2025 },
};

const COIN_PACKAGES = [
  { id:"starter", coins:50,  price:"GHS 5 / NGN 500",    label:"Starter",     bonus:"" },
  { id:"popular", coins:150, price:"GHS 12 / NGN 1,200",  label:"Popular 🔥",  bonus:"+20 bonus" },
  { id:"value",   coins:500, price:"GHS 35 / NGN 3,500",  label:"Best Value",  bonus:"+100 bonus" },
];

const ANALYSIS_COSTS = { single:10, pass3:30, pass7:80 };

function todayISO(offset){
  const d=new Date(); d.setUTCDate(d.getUTCDate()+(offset||0));
  return d.toISOString().slice(0,10);
}

async function fetchFixturesByDate(date){
  const key=import.meta.env.VITE_APIFOOTBALL_KEY||"";
  if(!key) return [];
  try{
    const r=await fetch("https://v3.football.api-sports.io/fixtures?date="+date,{headers:{"x-apisports-key":key}});
    if(!r.ok) return [];
    const d=await r.json();
    return d.response||[];
  }catch(e){return [];}
}

async function fetchStandingsFree(leagueCode){
  const FD_KEY=import.meta.env.VITE_FOOTBALLDATA_KEY||"";
  const codeMap={EPL:"PL",UCL:"CL",LIGA:"PD",BUN:"BL1",SA:"SA"};
  const code=codeMap[leagueCode];
  if(!code) return [];
  try{
    const headers=FD_KEY?{"X-Auth-Token":FD_KEY}:{};
    const r=await fetch("https://api.football-data.org/v4/competitions/"+code+"/standings",{headers});
    if(!r.ok) return [];
    const d=await r.json();
    const table=d.standings&&d.standings[0]&&d.standings[0].table;
    if(!table) return [];
    return table.map(function(row){
      return {
        rank:row.position,
        team:{name:row.team.name,logo:row.team.crest,id:row.team.id},
        all:{played:row.playedGames,win:row.won,draw:row.draw,lose:row.lost},
        points:row.points,
        goalsDiff:row.goalDifference,
      };
    });
  }catch(e){return [];}
}

async function fetchNews(){
  const key=import.meta.env.VITE_NEWSDATA_API_KEY||"";
  if(!key) return [];
  try{
    const r=await fetch("https://newsdata.io/api/1/news?apikey="+key+"&q=football+premier+league&language=en&category=sports&size=15");
    if(!r.ok) return [];
    const d=await r.json();
    return (d.results||[]).map(function(a){
      return {title:a.title,source:a.source_id||"Sport",time:timeAgo(a.pubDate),url:a.link,image:a.image_url};
    });
  }catch(e){return [];}
}

async function generateMatchAnalysis(homeTeam,awayTeam,leagueName,kickoff){
  const prompt=`You are KickQuest AI, a professional football analyst. Analyze this upcoming match and give a detailed pre-match breakdown.

Match: ${homeTeam} vs ${awayTeam}
League: ${leagueName}
Kickoff: ${kickoff}

Provide a JSON response with EXACTLY this structure (no markdown, pure JSON):
{
  "verdict": "Home Win" or "Draw" or "Away Win",
  "confidence": 65,
  "predictedScore": "2-1",
  "summary": "2-3 sentence sharp analysis summary",
  "homeForm": "Brief form analysis for ${homeTeam}",
  "awayForm": "Brief form analysis for ${awayTeam}",
  "keyFactor": "The single most important factor in this match",
  "h2h": "Recent head-to-head insight",
  "btts": true or false,
  "over25": true or false,
  "keyPlayer": "Name and why they are key",
  "riskLevel": "Low" or "Medium" or "High"
}`;
  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content:prompt}]}),
    });
    const d=await r.json();
    const text=d.content&&d.content[0]&&d.content[0].text||"";
    const clean=text.replace(/```json|```/g,"").trim();
    return JSON.parse(clean);
  }catch(e){
    return {verdict:"Home Win",confidence:60,predictedScore:"1-0",summary:"Analysis temporarily unavailable. Please try again.",homeForm:"Form data loading...",awayForm:"Form data loading...",keyFactor:"Match competitiveness",h2h:"Records being fetched",btts:false,over25:true,keyPlayer:"TBC",riskLevel:"Medium"};
  }
}

function userRef(uid){ return doc(db,"users",uid); }
function predRef(uid,id){ return doc(db,"users",uid,"predictions",String(id)); }

async function loadUserDoc(uid){
  const s=await getDoc(userRef(uid)); return s.exists()?s.data():null;
}
async function createUserDoc(uid,profile){
  const data={uid,...profile,pts:10,coins:20,createdAt:serverTimestamp(),lastLoginDate:new Date().toDateString(),lastFreeAnalysis:"",analysisPass:null};
  await setDoc(userRef(uid),data,{merge:true}); return data;
}
async function updateLastLogin(uid,currentPts,currentCoins){
  const today=new Date().toDateString();
  const s=await getDoc(userRef(uid));
  if(!s.exists()) return {pts:currentPts,coins:currentCoins};
  const data=s.data();
  if(data.lastLoginDate===today) return {pts:data.pts||currentPts,coins:data.coins||currentCoins};
  const newPts=(data.pts||0)+10, newCoins=(data.coins||0)+5;
  await updateDoc(userRef(uid),{pts:newPts,coins:newCoins,lastLoginDate:today,lastLogin:serverTimestamp()});
  return {pts:newPts,coins:newCoins};
}
async function loadPredsFS(uid){
  const s=await getDocs(collection(db,"users",uid,"predictions"));
  const r={}; s.forEach(function(d){ r[d.data().matchId]=d.data(); }); return r;
}
async function savePredFS(uid,matchId,pred){
  await setDoc(predRef(uid,matchId),{matchId,home:pred.home,away:pred.away,savedAt:serverTimestamp(),scored:false});
}
async function markPredScored(uid,matchId,awardPts){
  const batch=writeBatch(db);
  batch.update(predRef(uid,matchId),{scored:true,ptsAwarded:awardPts});
  batch.update(userRef(uid),{pts:increment(awardPts),coins:increment(awardPts===100?10:0)});
  await batch.commit();
}

function timeAgo(pub){
  if(!pub) return "";
  const ts=pub&&pub.toDate?pub.toDate():new Date(pub);
  const m=Math.floor((Date.now()-ts)/60000);
  if(m<1) return "just now"; if(m<60) return m+"m ago";
  const h=Math.floor(m/60); if(h<24) return h+"h ago";
  return Math.floor(h/24)+"d ago";
}
function fmtTime(iso){ return new Date(iso).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}); }
function fmtDate(iso){ return new Date(iso).toLocaleDateString([],{weekday:"short",month:"short",day:"numeric"}); }
function mapApiStatus(s){
  if(["FT","AET","PEN","AWD","WO"].includes(s)) return "finished";
  if(["1H","HT","2H","ET","BT","P","LIVE","INT","BREAK"].includes(s)) return "live";
  return "upcoming";
}
function groupByLeague(fixtures){
  const map={};
  fixtures.forEach(function(f){
    const lid=f.league&&f.league.id; if(!lid) return;
    if(!map[lid]) map[lid]={leagueId:lid,leagueName:f.league.name,leagueCountry:f.league.country,leagueLogo:f.league.logo,leagueFlag:f.league.flag,matches:[]};
    map[lid].matches.push(f);
  });
  return Object.values(map).sort(function(a,b){
    const k=[39,2,140,78,135,169,332];
    const ai=k.indexOf(a.leagueId),bi=k.indexOf(b.leagueId);
    if(ai!==-1&&bi===-1) return -1; if(ai===-1&&bi!==-1) return 1;
    if(ai!==-1&&bi!==-1) return ai-bi;
    return a.leagueName.localeCompare(b.leagueName);
  });
}
function readProfileFromAuth(fbUser){
  if(fbUser.displayName){ try{ const p=JSON.parse(fbUser.displayName); if(p&&p.username) return p; }catch(e){} } return null;
}
async function saveProfileToAuth(fbUser,profile){
  try{ await updateProfile(fbUser,{displayName:JSON.stringify(profile)}); }catch(e){}
}

const AVATARS=["⚽","🦁","👑","🔥","🎯","🌟","🇬🇭","🇳🇬","🇰🇪","🇲🇦","🇧🇷","🇫🇷","🇦🇷","🇩🇪","🇪🇸","🏆","💀","🐐","👀","🫡"];
const FAV_TEAMS=["Arsenal","Chelsea","Man City","Man United","Liverpool","Real Madrid","Barcelona","Bayern Munich","PSG","Juventus","AC Milan","Inter Milan","Dortmund","Ghana","Nigeria","Tottenham","Atletico Madrid"];

function LiveDot(){
  return <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:C.green,boxShadow:"0 0 6px "+C.green,animation:"liveGlow 1.5s infinite",marginRight:5,flexShrink:0}}/>;
}

function Toast({msg,color}){
  return <div style={{position:"fixed",bottom:96,left:"50%",transform:"translateX(-50%)",background:color,color:"#0a0a0a",padding:"10px 20px",borderRadius:24,fontSize:13,fontWeight:700,zIndex:3000,whiteSpace:"nowrap",animation:"toastIn 0.3s ease-out",fontFamily:"Barlow,sans-serif"}}>{msg}</div>;
}

function Spinner(){
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0"}}>
    <div style={{width:32,height:32,border:"3px solid "+C.border,borderTop:"3px solid "+C.gold,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
  </div>;
}

function KQTitle({size}){
  const s=size||28;
  return(
    <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:s,letterSpacing:3,lineHeight:1,display:"inline-flex",alignItems:"baseline",gap:0}}>
      <span style={{color:C.white}}>Kick</span>
      <span style={{color:C.gold}}>Quest</span>
    </div>
  );
}

function ScorePill({home,away,status,elapsed}){
  const live=status==="live",done=status==="finished";
  const has=typeof home==="number"&&typeof away==="number";
  if(live&&has) return <div style={{minWidth:60,textAlign:"center"}}><div style={{fontFamily:"DM Mono,monospace",fontWeight:500,fontSize:15,color:C.green,letterSpacing:1}}>{home}–{away}</div>{elapsed&&<div style={{fontSize:9,color:C.green,fontWeight:600,marginTop:1}}>{elapsed}'</div>}</div>;
  if(done&&has) return <div style={{minWidth:60,textAlign:"center"}}><div style={{fontFamily:"DM Mono,monospace",fontWeight:500,fontSize:15,color:C.white,letterSpacing:1}}>{home}–{away}</div><div style={{fontSize:9,color:C.muted,marginTop:1}}>FT</div></div>;
  return <div style={{minWidth:60,textAlign:"center",color:C.muted,fontSize:12,fontFamily:"DM Mono,monospace"}}>–</div>;
}

function MatchRow({fixture,pred,onPredict,showPredict,onAnalyse}){
  const home=fixture.teams&&fixture.teams.home, away=fixture.teams&&fixture.teams.away;
  const goals=fixture.goals||{}, status=fixture.fixture&&fixture.fixture.status;
  const matchStatus=mapApiStatus(status&&status.short);
  const live=matchStatus==="live",done=matchStatus==="finished",upcoming=matchStatus==="upcoming";
  const kickoff=fixture.fixture&&fixture.fixture.date;
  const fid=fixture.fixture&&fixture.fixture.id;
  return(
    <div style={{borderBottom:"1px solid "+C.border,background:live?"rgba(34,197,94,0.05)":"transparent",position:"relative"}}>
      <div style={{display:"flex",alignItems:"center",padding:"11px 14px",cursor:showPredict&&upcoming&&!pred?"pointer":"default"}}
        onClick={showPredict&&upcoming&&!pred?function(){onPredict&&onPredict(fixture);}:undefined}>
        {live&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:C.green,borderRadius:"0 2px 2px 0"}}/>}
        <div style={{width:46,flexShrink:0,textAlign:"center"}}>
          {live&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><LiveDot/><span style={{fontSize:9,color:C.green,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{status&&status.elapsed?status.elapsed+"'":"LIVE"}</span></div>}
          {done&&<div style={{fontSize:10,color:C.muted,fontFamily:"DM Mono,monospace"}}>FT</div>}
          {upcoming&&<div style={{fontSize:11,color:C.muted,fontFamily:"DM Mono,monospace"}}>{kickoff?fmtTime(kickoff):"TBD"}</div>}
        </div>
        <div style={{flex:1,padding:"0 10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
            {home&&home.logo&&<img src={home.logo} style={{width:18,height:18,objectFit:"contain"}} alt=""/>}
            <span style={{fontSize:13,fontFamily:"Barlow,sans-serif",fontWeight:600,color:C.white}}>{home&&home.name}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            {away&&away.logo&&<img src={away.logo} style={{width:18,height:18,objectFit:"contain"}} alt=""/>}
            <span style={{fontSize:13,fontFamily:"Barlow,sans-serif",fontWeight:600,color:C.white}}>{away&&away.name}</span>
          </div>
        </div>
        <ScorePill home={goals.home} away={goals.away} status={matchStatus} elapsed={status&&status.elapsed}/>
        {showPredict&&upcoming&&!pred&&<div style={{marginLeft:8,background:C.goldDim,border:"1px solid "+C.gold+"60",borderRadius:6,padding:"4px 9px",fontSize:10,color:C.gold,fontWeight:700,fontFamily:"Barlow,sans-serif",flexShrink:0,letterSpacing:0.5}}>PREDICT</div>}
        {showPredict&&pred&&<div style={{marginLeft:8,background:"rgba(201,162,39,0.1)",border:"1px solid "+C.gold+"40",borderRadius:6,padding:"4px 9px",fontSize:10,color:C.gold,fontWeight:700,fontFamily:"DM Mono,monospace",flexShrink:0}}>{pred.home}–{pred.away}</div>}
      </div>
      {onAnalyse&&upcoming&&(
        <div style={{padding:"0 14px 10px",paddingLeft:60}}>
          <button onClick={function(){onAnalyse(fixture);}} style={{background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.25)",borderRadius:8,padding:"5px 12px",color:C.purple,fontSize:11,fontFamily:"Barlow,sans-serif",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
            <span>🤖</span> AI Analysis <span style={{fontSize:9,color:C.muted}}>(10🪙 or free daily)</span>
          </button>
        </div>
      )}
    </div>
  );
}

function LeagueGroup({group,preds,onPredict,showPredict,dateFilter,onAnalyse}){
  const [expanded,setExpanded]=useState(true);
  const filtered=group.matches.filter(function(f){
    if(dateFilter==="live") return mapApiStatus(f.fixture&&f.fixture.status&&f.fixture.status.short)==="live";
    if(dateFilter==="finished") return mapApiStatus(f.fixture&&f.fixture.status&&f.fixture.status.short)==="finished";
    if(dateFilter==="upcoming") return mapApiStatus(f.fixture&&f.fixture.status&&f.fixture.status.short)==="upcoming";
    return true;
  });
  if(filtered.length===0) return null;
  const liveCount=filtered.filter(function(f){return mapApiStatus(f.fixture&&f.fixture.status&&f.fixture.status.short)==="live";}).length;
  return(
    <div style={{background:C.surface,borderRadius:12,marginBottom:10,overflow:"hidden",border:"1px solid "+C.border}}>
      <div onClick={function(){setExpanded(function(e){return !e;});}} style={{display:"flex",alignItems:"center",padding:"10px 14px",cursor:"pointer",background:C.elevated,borderBottom:expanded?"1px solid "+C.border:"none"}}>
        {group.leagueLogo?<img src={group.leagueLogo} style={{width:22,height:22,objectFit:"contain",marginRight:10}} alt=""/>:<span style={{marginRight:10,fontSize:16}}>{group.leagueFlag||"⚽"}</span>}
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:700,color:C.white,fontFamily:"Barlow,sans-serif",letterSpacing:0.3}}>{group.leagueName}</div>
          <div style={{fontSize:10,color:C.muted,fontFamily:"Barlow,sans-serif"}}>{group.leagueCountry}</div>
        </div>
        {liveCount>0&&<div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:10,padding:"2px 8px",marginRight:8}}><LiveDot/><span style={{fontSize:10,color:C.green,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{liveCount}</span></div>}
        <div style={{fontSize:10,color:C.muted,fontFamily:"DM Mono,monospace",marginRight:8}}>{filtered.length}</div>
        <span style={{color:C.muted,fontSize:12}}>{expanded?"▾":"▸"}</span>
      </div>
      {expanded&&filtered.map(function(f){
        const fid=f.fixture&&f.fixture.id;
        return <MatchRow key={fid} fixture={f} pred={preds&&preds[fid]} onPredict={onPredict} showPredict={showPredict} onAnalyse={onAnalyse}/>;
      })}
    </div>
  );
}

function AnalysisModal({fixture,onClose,userCoins,lastFreeAnalysis,onSpendCoins,onUseFree}){
  const [analysis,setAnalysis]=useState(null);
  const [loading,setLoading]=useState(false);
  const [unlocked,setUnlocked]=useState(false);
  const [error,setError]=useState("");
  const home=fixture.teams&&fixture.teams.home, away=fixture.teams&&fixture.teams.away;
  const kickoff=fixture.fixture&&fixture.fixture.date, leagueName=fixture.league&&fixture.league.name||"";
  const today=new Date().toDateString();
  const hasFreeToday=lastFreeAnalysis!==today;
  const canAfford=userCoins>=ANALYSIS_COSTS.single;

  async function doAnalysis(useFree){
    setLoading(true); setError("");
    try{
      const result=await generateMatchAnalysis(home&&home.name||"Home",away&&away.name||"Away",leagueName,kickoff?fmtDate(kickoff)+" "+fmtTime(kickoff):"TBD");
      setAnalysis(result); setUnlocked(true);
      if(useFree) onUseFree(); else onSpendCoins(ANALYSIS_COSTS.single);
    }catch(e){setError("Analysis failed. Try again.");}
    setLoading(false);
  }
  function handleUnlock(){
    if(hasFreeToday){doAnalysis(true);return;}
    if(canAfford){doAnalysis(false);return;}
    setError("Not enough coins. Buy more coins to unlock analysis.");
  }
  const verdictColor=analysis?analysis.verdict==="Home Win"?C.green:analysis.verdict==="Away Win"?C.red:C.gold:C.white;

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",zIndex:2000}}>
      <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:430,margin:"0 auto",background:"linear-gradient(180deg,#1a1500,#111111)",border:"1px solid "+C.gold+"30",borderRadius:"20px 20px 0 0",padding:"24px 20px 48px",animation:"slideUp 0.3s ease-out",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:C.border,borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <div style={{width:38,height:38,borderRadius:10,background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🤖</div>
          <div>
            <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:20,color:C.white,letterSpacing:2}}>KQ AI Analysis</div>
            <div style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif"}}>{home&&home.name} vs {away&&away.name}</div>
          </div>
          <div style={{marginLeft:"auto",background:C.goldDim,border:"1px solid "+C.gold+"50",borderRadius:12,padding:"4px 10px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:11}}>🪙</span>
            <span style={{fontFamily:"DM Mono,monospace",fontWeight:500,fontSize:13,color:C.gold}}>{userCoins}</span>
          </div>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+C.border,borderRadius:12,padding:"12px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {home&&home.logo&&<img src={home.logo} style={{width:24,height:24,objectFit:"contain"}} alt=""/>}
            <span style={{fontFamily:"Barlow,sans-serif",fontWeight:700,fontSize:13,color:C.white}}>{home&&home.name}</span>
          </div>
          <span style={{fontFamily:"DM Mono,monospace",fontSize:11,color:C.muted}}>vs</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:"Barlow,sans-serif",fontWeight:700,fontSize:13,color:C.white}}>{away&&away.name}</span>
            {away&&away.logo&&<img src={away.logo} style={{width:24,height:24,objectFit:"contain"}} alt=""/>}
          </div>
        </div>

        {!unlocked&&!loading&&(
          <div>
            <div style={{background:"rgba(167,139,250,0.08)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:12,padding:"14px",marginBottom:16}}>
              <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:16,color:C.purple,marginBottom:8,letterSpacing:1}}>WHAT YOU GET</div>
              {["📊 Team form & stats","⚔️ Head-to-head breakdown","🔑 Key player to watch","🎯 Predicted scoreline + confidence %","📈 Over 2.5 & BTTS prediction","⚠️ Risk level assessment"].map(function(item,i){
                return <div key={i} style={{fontSize:12,color:C.muted,fontFamily:"Barlow,sans-serif",marginBottom:5}}>{item}</div>;
              })}
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+C.border,borderRadius:12,padding:"14px",marginBottom:16}}>
              {hasFreeToday?(
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:24}}>🎁</span>
                  <div>
                    <div style={{fontFamily:"Barlow,sans-serif",fontWeight:700,fontSize:13,color:C.green}}>Free analysis available!</div>
                    <div style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif"}}>1 free per day — resets at midnight</div>
                  </div>
                </div>
              ):(
                <div>
                  <div style={{fontFamily:"Barlow,sans-serif",fontWeight:700,fontSize:13,color:C.white,marginBottom:4}}>Free analysis used today</div>
                  <div style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif",marginBottom:4}}>Cost: <span style={{color:C.gold,fontWeight:700}}>10 🪙</span> · You have <span style={{color:canAfford?C.gold:C.red,fontWeight:700}}>{userCoins} coins</span></div>
                  {!canAfford&&<div style={{fontSize:11,color:C.red,fontFamily:"Barlow,sans-serif"}}>Not enough coins. Go to Profile → Buy Coins.</div>}
                </div>
              )}
            </div>
            {error&&<div style={{fontSize:12,color:C.red,marginBottom:12,padding:"10px",background:C.redDim,borderRadius:8,fontFamily:"Barlow,sans-serif"}}>{error}</div>}
            <button onClick={handleUnlock} disabled={!hasFreeToday&&!canAfford}
              style={{width:"100%",padding:14,borderRadius:12,border:"1px solid rgba(167,139,250,0.4)",background:hasFreeToday||canAfford?"rgba(167,139,250,0.12)":"rgba(255,255,255,0.03)",color:hasFreeToday||canAfford?C.purple:C.muted,fontFamily:"Bebas Neue,sans-serif",fontSize:18,letterSpacing:2,cursor:hasFreeToday||canAfford?"pointer":"default"}}>
              {hasFreeToday?"GET FREE ANALYSIS":"SPEND 10 COINS"}
            </button>
          </div>
        )}

        {loading&&(
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:32,marginBottom:16,animation:"spin 1s linear infinite",display:"inline-block"}}>🤖</div>
            <div style={{fontFamily:"Barlow,sans-serif",fontSize:13,color:C.purple,marginBottom:8}}>Analysing match data...</div>
            <div style={{display:"flex",justifyContent:"center",gap:4}}>
              {[0,1,2].map(function(i){ return <div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.purple,animation:"aiTyping 1.2s ease-in-out "+(i*0.4)+"s infinite"}}/>; })}
            </div>
          </div>
        )}

        {unlocked&&analysis&&(
          <div style={{animation:"fadeIn 0.4s ease-out"}}>
            <div style={{background:"linear-gradient(135deg,rgba(201,162,39,0.12),rgba(201,162,39,0.04))",border:"1px solid "+C.gold+"30",borderRadius:14,padding:"18px",marginBottom:14,textAlign:"center"}}>
              <div style={{fontSize:10,color:C.muted,fontFamily:"Barlow,sans-serif",marginBottom:6,letterSpacing:1.5}}>AI VERDICT</div>
              <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:26,color:verdictColor,marginBottom:4,letterSpacing:2}}>{analysis.verdict}</div>
              <div style={{fontFamily:"DM Mono,monospace",fontSize:32,color:C.gold,fontWeight:500,marginBottom:10}}>{analysis.predictedScore}</div>
              <div style={{display:"flex",justifyContent:"center",gap:8}}>
                <div style={{background:"rgba(255,255,255,0.06)",borderRadius:20,padding:"4px 12px"}}><span style={{fontSize:11,color:C.muted}}>Confidence: </span><span style={{fontSize:11,color:C.gold,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{analysis.confidence}%</span></div>
                <div style={{background:analysis.riskLevel==="Low"?C.greenDim:analysis.riskLevel==="High"?C.redDim:C.goldDim,borderRadius:20,padding:"4px 12px"}}><span style={{fontSize:11,color:analysis.riskLevel==="Low"?C.green:analysis.riskLevel==="High"?C.red:C.gold,fontWeight:700}}>⚠️ {analysis.riskLevel} Risk</span></div>
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+C.border,borderRadius:12,padding:"14px",marginBottom:10}}>
              <div style={{fontSize:10,color:C.gold,fontWeight:700,fontFamily:"Barlow,sans-serif",marginBottom:6,letterSpacing:1}}>ANALYSIS</div>
              <div style={{fontSize:13,color:C.white,fontFamily:"Barlow,sans-serif",lineHeight:1.6}}>{analysis.summary}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              {[[home&&home.name,analysis.homeForm],[away&&away.name,analysis.awayForm]].map(function(item,i){
                return(<div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+C.border,borderRadius:10,padding:"12px"}}>
                  <div style={{fontSize:10,color:C.gold,fontWeight:700,fontFamily:"Barlow,sans-serif",marginBottom:5}}>{item[0]}</div>
                  <div style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif",lineHeight:1.5}}>{item[1]}</div>
                </div>);
              })}
            </div>
            {[["🔑","Key Factor",analysis.keyFactor],["⚔️","H2H",analysis.h2h],["⭐","Key Player",analysis.keyPlayer]].map(function(item,i){
              return(<div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8,display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18,flexShrink:0}}>{item[0]}</span>
                <div><div style={{fontSize:10,color:C.gold,fontWeight:700,fontFamily:"Barlow,sans-serif",marginBottom:3}}>{item[1]}</div><div style={{fontSize:12,color:C.white,fontFamily:"Barlow,sans-serif",lineHeight:1.5}}>{item[2]}</div></div>
              </div>);
            })}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {[["Over 2.5 Goals",analysis.over25],["Both Teams Score",analysis.btts]].map(function(item,i){
                return(<div key={i} style={{background:item[1]?C.greenDim:C.redDim,border:"1px solid "+(item[1]?C.green:C.red)+"30",borderRadius:10,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:10,color:C.muted,fontFamily:"Barlow,sans-serif",marginBottom:4}}>{item[0]}</div>
                  <div style={{fontSize:16,fontWeight:700,color:item[1]?C.green:C.red}}>{item[1]?"YES ✓":"NO ✗"}</div>
                </div>);
              })}
            </div>
            <div style={{fontSize:10,color:C.muted,textAlign:"center",fontFamily:"Barlow,sans-serif",padding:"8px",background:"rgba(255,255,255,0.03)",borderRadius:8}}>🤖 AI analysis is for entertainment. Always gamble responsibly.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function CoinStoreModal({onClose,coins}){
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",zIndex:2000}}>
      <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:430,margin:"0 auto",background:"linear-gradient(180deg,#1a1500,#111111)",border:"1px solid "+C.gold+"40",borderRadius:"20px 20px 0 0",padding:"24px 20px 48px",animation:"slideUp 0.3s ease-out"}}>
        <div style={{width:36,height:4,background:C.border,borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:8}}>🪙</div>
          <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:26,color:C.gold,letterSpacing:3}}>KQ COIN STORE</div>
          <div style={{fontSize:12,color:C.muted,fontFamily:"Barlow,sans-serif",marginTop:4}}>You have <span style={{color:C.gold,fontWeight:700}}>{coins} coins</span></div>
        </div>
        <div style={{background:C.goldDim,border:"1px solid "+C.gold+"30",borderRadius:12,padding:"14px",marginBottom:14}}>
          <div style={{fontSize:11,color:C.gold,fontWeight:700,marginBottom:8,fontFamily:"Barlow,sans-serif",letterSpacing:0.5}}>WHAT COINS UNLOCK</div>
          {[["🤖","Single match AI analysis","10 🪙"],["📅","3-day full analysis pass","30 🪙"],["🗓","7-day full analysis pass","80 🪙"]].map(function(item,i){
            return(<div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.muted,marginBottom:6,fontFamily:"Barlow,sans-serif"}}><span>{item[0]} {item[1]}</span><span style={{color:C.gold,fontWeight:700}}>{item[2]}</span></div>);
          })}
        </div>
        <div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:12,padding:"14px",marginBottom:14}}>
          <div style={{fontSize:11,color:C.green,fontWeight:700,marginBottom:8,fontFamily:"Barlow,sans-serif",letterSpacing:0.5}}>EARN FREE COINS</div>
          {[["🎁","Daily login","+5 🪙"],["🎯","Exact score prediction","+10 🪙"],["📅","Daily free analysis","1 per day"]].map(function(item,i){
            return(<div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.muted,marginBottom:6,fontFamily:"Barlow,sans-serif"}}><span>{item[0]} {item[1]}</span><span style={{color:C.green,fontWeight:700}}>{item[2]}</span></div>);
          })}
        </div>
        <div style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif",marginBottom:10,fontWeight:600,letterSpacing:0.5}}>BUY COINS</div>
        {COIN_PACKAGES.map(function(pkg){
          return(<div key={pkg.id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+C.border,borderRadius:12,padding:"14px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:28}}>🪙</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:18,color:C.gold,letterSpacing:1}}>{pkg.coins} COINS <span style={{fontSize:13,color:C.green,fontFamily:"Barlow,sans-serif"}}>{pkg.bonus}</span></div>
              <div style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif"}}>{pkg.price}</div>
            </div>
            <div style={{background:C.goldDim,border:"1px solid "+C.gold+"40",borderRadius:20,padding:"8px 16px"}}>
              <div style={{fontFamily:"Barlow,sans-serif",fontWeight:700,fontSize:12,color:C.gold}}>Coming Soon</div>
            </div>
          </div>);
        })}
        <div style={{textAlign:"center",marginTop:10}}>
          <div style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif"}}>Payment via Paystack launching soon 🚀</div>
          <div style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif",marginTop:2}}>Ghana Mobile Money · Nigeria Bank Transfer</div>
        </div>
      </div>
    </div>
  );
}

function PredictModal({fixture,onClose,onSubmit}){
  const [h,setH]=useState(""), [a,setA]=useState("");
  const ok=h!==""&&a!=="";
  const home=fixture.teams&&fixture.teams.home, away=fixture.teams&&fixture.teams.away;
  const kickoff=fixture.fixture&&fixture.fixture.date;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",zIndex:2000}}>
      <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:430,margin:"0 auto",background:"linear-gradient(180deg,#1a1800,#111111)",border:"1px solid "+C.gold+"40",borderRadius:"20px 20px 0 0",padding:"24px 20px 48px",animation:"slideUp 0.3s ease-out"}}>
        <div style={{width:36,height:4,background:C.border,borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:24,color:C.white,letterSpacing:3,marginBottom:4}}>PREDICT SCORE</div>
        <div style={{fontSize:12,color:C.muted,fontFamily:"Barlow,sans-serif",marginBottom:20}}>{kickoff?fmtDate(kickoff)+" · "+fmtTime(kickoff):""}</div>
        <div style={{background:C.goldDim,border:"1px solid "+C.gold+"30",borderRadius:10,padding:"9px 14px",marginBottom:20}}>
          <span style={{fontSize:12,color:C.gold,fontFamily:"Barlow,sans-serif",fontWeight:600}}>🏆 Exact score = 100pts · Correct result = 50pts</span>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:24}}>
          <div style={{flex:1,textAlign:"center"}}>
            {home&&home.logo&&<img src={home.logo} style={{width:44,height:44,objectFit:"contain",marginBottom:8}} alt=""/>}
            <div style={{fontSize:12,color:C.white,fontWeight:600,fontFamily:"Barlow,sans-serif",marginBottom:10}}>{home&&home.name}</div>
            <input type="number" min="0" max="20" value={h} onChange={function(e){setH(e.target.value);}} placeholder="0"
              style={{width:"100%",padding:"14px",borderRadius:10,border:"2px solid "+(h!==""?C.gold:C.border),background:"rgba(255,255,255,0.04)",color:C.white,fontSize:36,fontFamily:"DM Mono,monospace",fontWeight:500,textAlign:"center",outline:"none",transition:"border-color 0.2s"}}/>
          </div>
          <div style={{fontSize:20,color:C.muted,paddingTop:54}}>–</div>
          <div style={{flex:1,textAlign:"center"}}>
            {away&&away.logo&&<img src={away.logo} style={{width:44,height:44,objectFit:"contain",marginBottom:8}} alt=""/>}
            <div style={{fontSize:12,color:C.white,fontWeight:600,fontFamily:"Barlow,sans-serif",marginBottom:10}}>{away&&away.name}</div>
            <input type="number" min="0" max="20" value={a} onChange={function(e){setA(e.target.value);}} placeholder="0"
              style={{width:"100%",padding:"14px",borderRadius:10,border:"2px solid "+(a!==""?C.gold:C.border),background:"rgba(255,255,255,0.04)",color:C.white,fontSize:36,fontFamily:"DM Mono,monospace",fontWeight:500,textAlign:"center",outline:"none",transition:"border-color 0.2s"}}/>
          </div>
        </div>
        <div style={{fontSize:10,color:C.muted,textAlign:"center",marginBottom:16,fontFamily:"Barlow,sans-serif"}}>⚠️ Predictions cannot be changed once locked</div>
        <button disabled={!ok} onClick={function(){onSubmit(fixture.fixture&&fixture.fixture.id,{home:h,away:a});onClose();}}
          style={{width:"100%",padding:15,borderRadius:12,border:ok?"1px solid "+C.gold+"70":"1px solid "+C.border,background:ok?"linear-gradient(135deg,#2a1e00,#1a1200)":"rgba(255,255,255,0.03)",color:ok?C.gold:C.muted,fontFamily:"Bebas Neue,sans-serif",fontSize:20,letterSpacing:2,cursor:ok?"pointer":"default",transition:"all 0.2s"}}>
          {ok?"⚡ LOCK IN PREDICTION":"ENTER BOTH SCORES"}
        </button>
      </div>
    </div>
  );
}

function LoadingScreen(){
  return(
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <style>{CSS}</style>
      <img src={LOGO} style={{width:100,height:100,objectFit:"contain",animation:"bounce 1.2s ease-in-out infinite"}} alt="KickQuest"/>
    </div>
  );
}

function AuthScreen({onSuccess}){
  const [mode,setMode]=useState("signin");
  const [email,setEmail]=useState(""), [password,setPassword]=useState(""), [confirm,setConfirm]=useState("");
  const [loading,setLoading]=useState(false), [error,setError]=useState("");
  function parseError(err){
    const c=err.code||"";
    if(c.includes("email-already")) return "Email already registered.";
    if(c.includes("wrong-password")||c.includes("invalid-credential")) return "Incorrect email or password.";
    if(c.includes("user-not-found")) return "No account with this email.";
    if(c.includes("weak-password")) return "Password needs 6+ characters.";
    if(c.includes("invalid-email")) return "Enter a valid email.";
    if(c.includes("popup-closed")) return "";
    return "Something went wrong. Try again.";
  }
  async function handleEmail(){
    setError("");
    if(!email.trim()||!password.trim()){setError("Fill in all fields.");return;}
    if(mode==="signup"&&password!==confirm){setError("Passwords don't match.");return;}
    if(mode==="signup"&&password.length<6){setError("Password needs 6+ characters.");return;}
    setLoading(true);
    try{
      if(mode==="signup"){const c=await createUserWithEmailAndPassword(auth,email.trim(),password);onSuccess(c.user,true);}
      else{const c=await signInWithEmailAndPassword(auth,email.trim(),password);onSuccess(c.user,false);}
    }catch(err){setLoading(false);setError(parseError(err));}
  }
  async function handleGoogle(){
    setError("");setLoading(true);
    try{
      const c=await signInWithPopup(auth,googleProvider);
      const isNew=!!(c._tokenResponse&&c._tokenResponse.isNewUser);
      onSuccess(c.user,isNew);
    }catch(err){setLoading(false);const e=parseError(err);if(e)setError(e);}
  }
  const inp={width:"100%",padding:"13px 16px",borderRadius:10,border:"1px solid "+C.border,background:"rgba(255,255,255,0.05)",color:C.white,fontSize:15,fontFamily:"Barlow,sans-serif",outline:"none",marginBottom:12};
  return(
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      <style>{CSS}</style>
      <div style={{position:"absolute",top:"15%",right:"-5%",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,162,39,0.06),transparent 70%)"}}/>
      <div style={{position:"absolute",bottom:"10%",left:"-5%",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,162,39,0.04),transparent 70%)"}}/>
      <div style={{position:"relative",width:"100%",maxWidth:360}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <img src={LOGO} style={{width:90,height:90,objectFit:"contain",marginBottom:20,animation:"bounce 1.2s ease-in-out infinite"}} alt="KickQuest"/>
          <KQTitle size={42}/>
          <div style={{fontSize:11,color:C.muted,letterSpacing:2,fontFamily:"Barlow,sans-serif",fontWeight:500,marginTop:6}}>SCORES · STATS · PREDICT · WIN</div>
        </div>
        <div style={{background:"#111111",border:"1px solid "+C.border,borderRadius:16,padding:"24px 20px"}}>
          <div style={{display:"flex",background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3,marginBottom:22,gap:3}}>
            {[{id:"signin",label:"Sign In"},{id:"signup",label:"Create Account"}].map(function(m){
              return(<button key={m.id} onClick={function(){setMode(m.id);setError("");setEmail("");setPassword("");setConfirm("");}}
                style={{flex:1,padding:"10px 6px",borderRadius:8,border:"none",background:mode===m.id?C.gold:"transparent",color:mode===m.id?"#0a0a0a":C.muted,fontFamily:"Barlow,sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.2s"}}>{m.label}</button>);
            })}
          </div>
          <button onClick={handleGoogle} disabled={loading} style={{width:"100%",padding:"12px",borderRadius:10,border:"1px solid "+C.border,background:"rgba(255,255,255,0.04)",color:C.white,fontSize:14,fontFamily:"Barlow,sans-serif",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:18,fontWeight:600,opacity:loading?0.7:1}}>
            <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.5 26.7 36 24 36c-5.2 0-9.7-3.3-11.3-8H6.1C9.5 35.7 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.2C37 39 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
            Continue with Google
          </button>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}><div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif"}}>or email</span><div style={{flex:1,height:1,background:C.border}}/></div>
          <input value={email} onChange={function(e){setEmail(e.target.value);setError("");}} placeholder="Email address" type="email" style={inp}/>
          <input value={password} onChange={function(e){setPassword(e.target.value);setError("");}} placeholder="Password" type="password" style={{...inp,marginBottom:mode==="signup"?12:20}}/>
          {mode==="signup"&&<input value={confirm} onChange={function(e){setConfirm(e.target.value);setError("");}} placeholder="Confirm password" type="password" style={{...inp,marginBottom:20}}/>}
          {error&&<div style={{fontSize:12,color:C.red,marginBottom:14,padding:"10px 14px",background:C.redDim,borderRadius:8,fontFamily:"Barlow,sans-serif"}}>{error}</div>}
          <button onClick={handleEmail} disabled={loading}
            style={{width:"100%",padding:14,borderRadius:10,border:"1px solid "+C.gold+"50",background:"linear-gradient(135deg,rgba(201,162,39,0.15),rgba(201,162,39,0.05))",color:C.gold,fontFamily:"Bebas Neue,sans-serif",fontSize:20,letterSpacing:2,cursor:"pointer",opacity:loading?0.7:1}}>
            {loading?"LOADING...":mode==="signin"?"SIGN IN →":"CREATE ACCOUNT →"}
          </button>
          {mode==="signup"&&<div style={{fontSize:11,color:C.muted,textAlign:"center",marginTop:12,fontFamily:"Barlow,sans-serif"}}>🎁 +10 points + 20🪙 coins on signup</div>}
        </div>
      </div>
    </div>
  );
}

function SetupProfile({firebaseUser,onComplete}){
  const [username,setUsername]=useState(""), [avatar,setAvatar]=useState("⚽"), [favTeam,setFavTeam]=useState(""), [error,setError]=useState("");
  function handleDone(){
    const u=username.trim();
    if(u.length<3){setError("Username needs at least 3 characters");return;}
    if(u.length>20){setError("Max 20 characters");return;}
    if(!/^[a-zA-Z0-9_]+$/.test(u)){setError("Letters, numbers and underscores only");return;}
    onComplete({username:u,avatar,favTeam:favTeam.trim()});
  }
  return(
    <div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto"}}>
      <style>{CSS}</style>
      <img src={LOGO} style={{width:64,height:64,objectFit:"contain",marginBottom:12}} alt=""/>
      <KQTitle size={30}/>
      <div style={{fontSize:12,color:C.muted,marginBottom:24,textAlign:"center",fontFamily:"Barlow,sans-serif",marginTop:6}}>Set up your profile to start predicting</div>
      <div style={{width:"100%",maxWidth:360}}>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:C.muted,letterSpacing:1.5,marginBottom:10,fontWeight:600,fontFamily:"Barlow,sans-serif"}}>PICK AVATAR</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>{AVATARS.map(function(em){ return(<button key={em} onClick={function(){setAvatar(em);}} style={{width:44,height:44,borderRadius:10,border:"2px solid "+(avatar===em?C.gold:C.border),background:avatar===em?C.goldDim:"rgba(255,255,255,0.04)",fontSize:20,cursor:"pointer"}}>{em}</button>); })}</div>
          <div style={{textAlign:"center"}}><div style={{width:56,height:56,borderRadius:"50%",border:"2px solid "+C.gold,background:C.goldDim,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{avatar}</div></div>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,color:C.muted,letterSpacing:1.5,marginBottom:8,fontWeight:600,fontFamily:"Barlow,sans-serif"}}>USERNAME</div>
          <input value={username} onChange={function(e){setUsername(e.target.value);setError("");}} placeholder="e.g. FootballKing_GH" maxLength={20}
            style={{width:"100%",padding:"13px 16px",borderRadius:10,border:"1px solid "+(error?C.red:C.border),background:"rgba(255,255,255,0.05)",color:C.white,fontSize:15,fontFamily:"Barlow,sans-serif",outline:"none"}}/>
          {error&&<div style={{fontSize:11,color:C.red,marginTop:5,fontFamily:"Barlow,sans-serif"}}>{error}</div>}
        </div>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:11,color:C.muted,letterSpacing:1.5,marginBottom:8,fontWeight:600,fontFamily:"Barlow,sans-serif"}}>FAVOURITE TEAM <span style={{opacity:0.5}}>(optional)</span></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{FAV_TEAMS.map(function(t){ return(<button key={t} onClick={function(){setFavTeam(favTeam===t?"":t);}} style={{padding:"5px 12px",borderRadius:16,border:"1px solid "+(favTeam===t?C.gold:C.border),background:favTeam===t?C.goldDim:"rgba(255,255,255,0.04)",color:favTeam===t?C.gold:C.muted,fontSize:11,fontFamily:"Barlow,sans-serif",cursor:"pointer"}}>{t}</button>); })}</div>
        </div>
        <button onClick={handleDone}
          style={{width:"100%",padding:14,borderRadius:12,border:"1px solid "+C.gold+"50",background:"linear-gradient(135deg,rgba(201,162,39,0.15),rgba(201,162,39,0.05))",color:C.gold,fontFamily:"Bebas Neue,sans-serif",fontSize:20,letterSpacing:2,cursor:"pointer"}}>
          LET'S GO ⚡
        </button>
      </div>
    </div>
  );
}

function StandingsTable({rows,leagueName}){
  if(!rows||rows.length===0) return(
    <div style={{textAlign:"center",padding:"40px 20px",background:C.surface,border:"1px solid "+C.border,borderRadius:12}}>
      <div style={{fontSize:32,marginBottom:12}}>📊</div>
      <div style={{color:C.muted,fontFamily:"Barlow,sans-serif",fontSize:13,marginBottom:8}}>Fetching standings...</div>
      <div style={{color:C.gold,fontFamily:"Barlow,sans-serif",fontSize:11}}>Powered by football-data.org (free)</div>
    </div>
  );
  return(
    <div style={{background:C.surface,borderRadius:12,overflow:"hidden",border:"1px solid "+C.border}}>
      <div style={{padding:"12px 14px",background:C.elevated,borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:16,color:C.white,letterSpacing:1}}>{leagueName}</div>
        <div style={{fontSize:10,color:C.muted,fontFamily:"Barlow,sans-serif"}}>2025/26 Season</div>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"Barlow,sans-serif",fontSize:12}}>
          <thead><tr style={{borderBottom:"1px solid "+C.border}}>
            <th style={{padding:"8px 14px",textAlign:"left",color:C.muted,fontWeight:600,width:28}}>#</th>
            <th style={{padding:"8px 8px",textAlign:"left",color:C.muted,fontWeight:600}}>Team</th>
            <th style={{padding:"8px 6px",textAlign:"center",color:C.muted,fontWeight:600}}>P</th>
            <th style={{padding:"8px 6px",textAlign:"center",color:C.muted,fontWeight:600}}>W</th>
            <th style={{padding:"8px 6px",textAlign:"center",color:C.muted,fontWeight:600}}>D</th>
            <th style={{padding:"8px 6px",textAlign:"center",color:C.muted,fontWeight:600}}>L</th>
            <th style={{padding:"8px 6px",textAlign:"center",color:C.muted,fontWeight:600}}>GD</th>
            <th style={{padding:"8px 10px",textAlign:"center",color:C.gold,fontWeight:700}}>Pts</th>
          </tr></thead>
          <tbody>
            {rows.map(function(row,i){
              const team=row.team,all=row.all,pts=row.points,gd=row.goalsDiff;
              const inCL=i<4,inRel=i>=rows.length-3;
              return(<tr key={team&&team.id||i} style={{borderBottom:"1px solid "+C.border+"60",background:inCL?"rgba(201,162,39,0.05)":inRel?C.redDim:"transparent"}}>
                <td style={{padding:"9px 14px",color:inCL?C.gold:inRel?C.red:C.muted,fontWeight:600,fontFamily:"DM Mono,monospace"}}>{row.rank}</td>
                <td style={{padding:"9px 8px"}}><div style={{display:"flex",alignItems:"center",gap:7}}>{team&&team.logo&&<img src={team.logo} style={{width:18,height:18,objectFit:"contain"}} alt=""/>}<span style={{color:C.white,fontWeight:600}}>{team&&team.name}</span></div></td>
                <td style={{padding:"9px 6px",textAlign:"center",color:C.muted}}>{all&&all.played}</td>
                <td style={{padding:"9px 6px",textAlign:"center",color:C.muted}}>{all&&all.win}</td>
                <td style={{padding:"9px 6px",textAlign:"center",color:C.muted}}>{all&&all.draw}</td>
                <td style={{padding:"9px 6px",textAlign:"center",color:C.muted}}>{all&&all.lose}</td>
                <td style={{padding:"9px 6px",textAlign:"center",color:gd>0?C.green:gd<0?C.red:C.muted,fontFamily:"DM Mono,monospace"}}>{gd>0?"+":""}{gd}</td>
                <td style={{padding:"9px 10px",textAlign:"center",color:C.gold,fontWeight:700,fontFamily:"DM Mono,monospace"}}>{pts}</td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
      <div style={{padding:"8px 14px",display:"flex",gap:16,borderTop:"1px solid "+C.border}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:C.gold}}/><span style={{fontSize:10,color:C.muted,fontFamily:"Barlow,sans-serif"}}>Champions League</span></div>
        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:C.red}}/><span style={{fontSize:10,color:C.muted,fontFamily:"Barlow,sans-serif"}}>Relegation</span></div>
      </div>
    </div>
  );
}
export default function App(){
  const [screen,setScreen]=useState("loading");
  const [firebaseUser,setFirebaseUser]=useState(null);
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("scores");
  const [dateOffset,setDateOffset]=useState(0);
  const [dateFilter,setDateFilter]=useState("all");
  const [fixtures,setFixtures]=useState([]);
  const [fixturesLoading,setFixturesLoading]=useState(false);
  const [standings,setStandings]=useState({});
  const [standingsLeague,setStandingsLeague]=useState("EPL");
  const [standingsLoading,setStandingsLoading]=useState(false);
  const [news,setNews]=useState([]);
  const [newsLoading,setNewsLoading]=useState(false);
  const [preds,setPreds]=useState({});
  const [pts,setPts]=useState(0);
  const [coins,setCoins]=useState(0);
  const [lastFreeAnalysis,setLastFreeAnalysis]=useState("");
  const [leaderboard,setLeaderboard]=useState([]);
  const [banter,setBanter]=useState([]);
  const [banterInput,setBanterInput]=useState("");
  const [toast,setToast]=useState(null);
  const [showProfile,setShowProfile]=useState(false);
  const [showCoinStore,setShowCoinStore]=useState(false);
  const [predictModal,setPredictModal]=useState(null);
  const [analysisModal,setAnalysisModal]=useState(null);
  const scoredRef=useRef({});

  function showToast(msg,color){ setToast({msg,color:color||C.gold}); setTimeout(function(){setToast(null);},3500); }

  const displayDate=new Date(); displayDate.setDate(displayDate.getDate()+dateOffset);
  const displayDateStr=dateOffset===0?"Today":dateOffset===-1?"Yesterday":dateOffset===1?"Tomorrow":fmtDate(displayDate.toISOString());

  useEffect(function(){
    const q=query(collection(db,"users"),orderBy("pts","desc"),limit(50));
    return onSnapshot(q,function(snap){ const b=[]; snap.forEach(function(d){b.push(d.data());}); setLeaderboard(b); });
  },[]);

  useEffect(function(){
    const q=query(collection(db,"banter"),orderBy("createdAt","desc"),limit(40));
    return onSnapshot(q,function(snap){ const b=[]; snap.forEach(function(d){b.push({id:d.id,...d.data()});}); setBanter(b); });
  },[]);

  useEffect(function(){
    return onAuthStateChanged(auth,async function(fbUser){
      if(fbUser){ setFirebaseUser(fbUser); await loadSession(fbUser); }
      else{ setFirebaseUser(null); setUser(null); setScreen("login"); }
    });
  },[]);

  async function loadSession(fbUser){
    let userData=await loadUserDoc(fbUser.uid);
    if(!userData){
      const authProfile=readProfileFromAuth(fbUser);
      if(authProfile){ userData=await createUserDoc(fbUser.uid,authProfile); }
      else{ setScreen("setup"); return; }
    }
    const updated=await updateLastLogin(fbUser.uid,userData.pts||0,userData.coins||0);
    if(updated.pts>(userData.pts||0)) showToast("🎁 Daily bonus! +10pts +5🪙",C.gold);
    const fullUser={id:fbUser.uid,email:fbUser.email,...userData,pts:updated.pts,coins:updated.coins};
    setUser(fullUser); setPts(updated.pts); setCoins(updated.coins||0);
    setLastFreeAnalysis(userData.lastFreeAnalysis||"");
    const loadedPreds=await loadPredsFS(fbUser.uid);
    setPreds(loadedPreds);
    setScreen("app");
  }

  function handleAuthSuccess(fbUser,isNew){
    setFirebaseUser(fbUser);
    if(isNew){ setScreen("setup"); return; }
    loadSession(fbUser);
  }

  async function handleSetupComplete(profile){
    if(!firebaseUser) return;
    const userData=await createUserDoc(firebaseUser.uid,profile);
    await saveProfileToAuth(firebaseUser,profile);
    setUser({id:firebaseUser.uid,email:firebaseUser.email,...userData});
    setPts(10); setCoins(20); setPreds({});
    setScreen("app");
    showToast("Welcome! +10pts & 20🪙 coins!",C.gold);
  }

  async function handleLogout(){
    await signOut(auth);
    setUser(null);setPts(0);setCoins(0);setPreds({});setShowProfile(false);setScreen("login");
  }

  useEffect(function(){
    setFixturesLoading(true);
    fetchFixturesByDate(todayISO(dateOffset)).then(function(data){
      setFixtures(data); setFixturesLoading(false);
    });
  },[dateOffset]);

  useEffect(function(){
    if(tab!=="leagues") return;
    if(standings[standingsLeague]) return;
    setStandingsLoading(true);
    fetchStandingsFree(standingsLeague).then(function(rows){
      setStandings(function(s){ return {...s,[standingsLeague]:rows}; });
      setStandingsLoading(false);
    });
  },[tab,standingsLeague]);

  useEffect(function(){
    if(tab!=="news"||news.length>0) return;
    setNewsLoading(true);
    fetchNews().then(function(data){ setNews(data||[]); setNewsLoading(false); });
  },[tab]);

  async function handlePredict(matchId,pred){
    if(!user) return;
    await savePredFS(user.id,matchId,pred);
    setPreds(function(p){ return {...p,[matchId]:pred}; });
    showToast("🔒 Prediction locked!",C.gold);
  }

  async function handleUseFreeAnalysis(){
    const today=new Date().toDateString();
    setLastFreeAnalysis(today);
    if(user) await updateDoc(userRef(user.id),{lastFreeAnalysis:today});
  }
  async function handleSpendCoins(amount){
    const newCoins=Math.max(0,coins-amount);
    setCoins(newCoins);
    if(user) await updateDoc(userRef(user.id),{coins:increment(-amount)});
  }

  useEffect(function(){
    if(!user||!fixtures.length) return;
    fixtures.forEach(async function(f){
      const fid=f.fixture&&f.fixture.id;
      const statusShort=f.fixture&&f.fixture.status&&f.fixture.status.short;
      if(mapApiStatus(statusShort)!=="finished") return;
      const goals=f.goals||{};
      if(goals.home===null||goals.home===undefined||goals.away===null||goals.away===undefined) return;
      if(scoredRef.current[fid]) return;
      const predSnap=await getDoc(predRef(user.id,fid));
      if(!predSnap.exists()) return;
      const predData=predSnap.data();
      if(predData.scored) return;
      scoredRef.current[fid]=true;
      const ph=parseInt(predData.home,10), pa=parseInt(predData.away,10);
      let award=0;
      if(ph===goals.home&&pa===goals.away){
        award=100; showToast("🎯 Exact score! +100pts +10🪙",C.green);
      } else {
        const predO=ph>pa?"home":ph<pa?"away":"draw";
        const actO=goals.home>goals.away?"home":goals.home<goals.away?"away":"draw";
        if(predO===actO){ award=50; showToast("🏆 Correct result! +50pts",C.gold); }
        else{ await updateDoc(predRef(user.id,fid),{scored:true,ptsAwarded:0}); return; }
      }
      if(award>0){
        await markPredScored(user.id,fid,award);
        setPts(function(p){return p+award;});
        if(award===100) setCoins(function(c){return c+10;});
      }
    });
  },[fixtures,user]);

  async function handleBanter(){
    if(!banterInput.trim()||!user) return;
    await addDoc(collection(db,"banter"),{username:user.username,avatar:user.avatar,msg:banterInput.trim(),likes:0,createdAt:serverTimestamp()});
    await updateDoc(userRef(user.id),{pts:increment(5)});
    setPts(function(p){return p+5;});
    setBanterInput(""); showToast("+5pts for posting banter!",C.gold);
  }

  const myRank=user?leaderboard.findIndex(function(x){return x.uid===user.id;})+1:0;
  const predCount=Object.keys(preds).length;
  const grouped=groupByLeague(fixtures);
  const liveTotal=fixtures.filter(function(f){
    return mapApiStatus(f.fixture&&f.fixture.status&&f.fixture.status.short)==="live";
  }).length;

  if(screen==="loading") return <LoadingScreen/>;
  if(screen==="login") return <AuthScreen onSuccess={handleAuthSuccess}/>;
  if(screen==="setup") return <SetupProfile firebaseUser={firebaseUser} onComplete={handleSetupComplete}/>;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.white,fontFamily:"Barlow,sans-serif",maxWidth:430,margin:"0 auto",position:"relative"}}>
      <style>{CSS}</style>
      {toast&&<Toast msg={toast.msg} color={toast.color}/>}

      {/* Profile Sheet */}
      {showProfile&&(
        <div onClick={function(){setShowProfile(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",zIndex:1000}}>
          <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:430,margin:"0 auto",background:"linear-gradient(180deg,#1a1800,#111111)",border:"1px solid "+C.gold+"40",borderRadius:"20px 20px 0 0",padding:"24px 20px 44px",animation:"slideUp 0.3s ease-out"}}>
            <div style={{width:36,height:4,background:C.border,borderRadius:2,margin:"0 auto 22px"}}/>

            {/* Profile card */}
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20,padding:"16px",background:C.goldDim,border:"1px solid "+C.gold+"30",borderRadius:14}}>
              <div style={{width:56,height:56,borderRadius:"50%",border:"2px solid "+C.gold,background:"rgba(201,162,39,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{user.avatar}</div>
              <div>
                <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:20,color:C.white,letterSpacing:1}}>@{user.username}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2,fontFamily:"Barlow,sans-serif"}}>{user.email}</div>
                {user.favTeam&&<div style={{fontSize:11,color:C.gold,marginTop:3,fontFamily:"Barlow,sans-serif",fontWeight:600}}>Supports {user.favTeam}</div>}
              </div>
              <div style={{marginLeft:"auto",textAlign:"right"}}>
                <div style={{fontFamily:"DM Mono,monospace",fontWeight:500,fontSize:28,color:C.gold}}>{pts}</div>
                <div style={{fontSize:9,color:C.muted,letterSpacing:1,fontFamily:"Barlow,sans-serif"}}>POINTS</div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
              {[[predCount,"🎯","Predicted"],[myRank>0?"#"+myRank:"–","📈","Rank"],[coins+"🪙","🪙","Coins"]].map(function(item,i){
                return(<div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+C.border,borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                  <div style={{fontSize:16,marginBottom:4}}>{item[1]}</div>
                  <div style={{fontFamily:"DM Mono,monospace",fontWeight:500,fontSize:15,color:i===2?C.gold:C.gold}}>{item[0]}</div>
                  <div style={{fontSize:9,color:C.muted,marginTop:3,fontFamily:"Barlow,sans-serif"}}>{item[2]}</div>
                </div>);
              })}
            </div>

            <button onClick={function(){setShowProfile(false);setShowCoinStore(true);}} style={{width:"100%",padding:13,background:C.goldDim,border:"1px solid "+C.gold+"40",borderRadius:12,color:C.gold,fontFamily:"Bebas Neue,sans-serif",fontWeight:700,fontSize:18,letterSpacing:2,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              🪙 BUY KQ COINS · AI ANALYSIS STORE
            </button>

            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+C.border,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
              <div style={{fontSize:11,color:C.gold,fontWeight:700,marginBottom:8,letterSpacing:1,fontFamily:"Barlow,sans-serif"}}>POINTS SYSTEM</div>
              {[["🎯","Exact score","+100pts +10🪙"],["🏆","Correct result","+50pts"],["🎁","Daily login","+10pts +5🪙"],["💬","Post banter","+5pts"]].map(function(r,i){
                return(<div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.muted,marginBottom:5,fontFamily:"Barlow,sans-serif"}}>
                  <span>{r[0]} {r[1]}</span><span style={{color:C.green,fontWeight:600}}>{r[2]}</span>
                </div>);
              })}
            </div>

            <a href="https://whatsapp.com/channel/0029VbDZLtsHgZWXYbWmzr0C" target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",display:"block",marginBottom:10}}>
              <div style={{background:"rgba(37,211,102,0.08)",border:"1px solid "+C.wa+"40",borderRadius:12,padding:"12px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span style={{fontSize:15}}>💬</span>
                <span style={{fontFamily:"Barlow,sans-serif",fontWeight:700,fontSize:13,color:C.wa}}>Join KickQuest WhatsApp Channel</span>
              </div>
            </a>
            <button onClick={handleLogout} style={{width:"100%",padding:13,background:C.redDim,border:"1px solid "+C.red+"30",borderRadius:12,color:C.red,fontFamily:"Barlow,sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>Sign Out</button>
          </div>
        </div>
      )}

      {showCoinStore&&<CoinStoreModal onClose={function(){setShowCoinStore(false);}} coins={coins}/>}

      {/* Header */}
      <div style={{background:"rgba(10,10,10,0.97)",backdropFilter:"blur(20px)",padding:"12px 16px",borderBottom:"1px solid "+C.border,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src={LOGO} style={{width:36,height:36,objectFit:"contain",borderRadius:8}} alt="KickQuest"/>
            <div>
              <KQTitle size={22}/>
              <div style={{fontSize:7,color:C.muted,letterSpacing:2,marginTop:1,fontFamily:"Barlow,sans-serif"}}>SCORES · STATS · PREDICT</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {liveTotal>0&&(
              <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:12,padding:"4px 8px"}}>
                <LiveDot/><span style={{fontSize:10,color:C.green,fontFamily:"DM Mono,monospace",fontWeight:500}}>{liveTotal}</span>
              </div>
            )}
            <div onClick={function(){setShowCoinStore(true);}} style={{background:C.goldDim,border:"1px solid "+C.gold+"50",borderRadius:12,padding:"4px 10px",display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}>
              <span style={{fontSize:11}}>🪙</span>
              <span style={{fontFamily:"DM Mono,monospace",fontWeight:500,fontSize:13,color:C.gold}}>{coins}</span>
            </div>
            <div style={{background:C.goldDim,border:"1px solid "+C.gold+"40",borderRadius:12,padding:"4px 10px",display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:9}}>⚡</span>
              <span style={{fontFamily:"DM Mono,monospace",fontWeight:500,fontSize:13,color:C.gold}}>{pts}</span>
            </div>
            <div onClick={function(){setShowProfile(true);}} style={{width:34,height:34,borderRadius:"50%",border:"2px solid "+C.gold+"60",background:C.goldDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,cursor:"pointer"}}>{user.avatar}</div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(10,10,10,0.98)",backdropFilter:"blur(20px)",borderTop:"1px solid "+C.border,display:"flex",padding:"8px 0 20px",zIndex:100}}>
        {[
          {id:"scores",icon:"📊",label:"Scores"},
          {id:"predict",icon:"⚡",label:"Predict"},
          {id:"leagues",icon:"🏆",label:"Leagues"},
          {id:"news",icon:"📰",label:"News"},
          {id:"community",icon:"💬",label:"Community"},
        ].map(function(n){
          return(<button key={n.id} onClick={function(){setTab(n.id);}} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 0"}}>
            <span style={{fontSize:19,filter:tab===n.id?"none":"grayscale(0.7) opacity(0.5)",transition:"all 0.2s"}}>{n.icon}</span>
            <span style={{fontSize:8.5,fontFamily:"Barlow,sans-serif",fontWeight:tab===n.id?700:400,color:tab===n.id?C.gold:C.muted,letterSpacing:0.5,transition:"all 0.2s"}}>{n.label}</span>
            {tab===n.id&&<div style={{width:20,height:2,borderRadius:1,background:C.gold,marginTop:-1}}/>}
          </button>);
        })}
      </div>

      {/* Content */}
      <div style={{padding:"14px 12px 96px",animation:"fadeIn 0.2s ease-out"}}>

        {/* SCORES */}
        {tab==="scores"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <button onClick={function(){setDateOffset(function(d){return d-1;});}} style={{width:36,height:36,borderRadius:10,background:C.surface,border:"1px solid "+C.border,color:C.white,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <div style={{textAlign:"center"}}>
                <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:20,color:C.white,letterSpacing:2}}>{displayDateStr}</div>
                <div style={{fontSize:10,color:C.muted,fontFamily:"Barlow,sans-serif"}}>{displayDate.toLocaleDateString([],{weekday:"long",month:"long",day:"numeric"})}</div>
              </div>
              <button onClick={function(){setDateOffset(function(d){return d+1;});}} style={{width:36,height:36,borderRadius:10,background:C.surface,border:"1px solid "+C.border,color:C.white,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
            </div>

            <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
              {[{id:"all",label:"All"},{id:"live",label:"🔴 Live"+(liveTotal>0?" ("+liveTotal+")":"")},{id:"upcoming",label:"Upcoming"},{id:"finished",label:"Finished"}].map(function(f){
                return(<button key={f.id} onClick={function(){setDateFilter(f.id);}} style={{flexShrink:0,padding:"6px 14px",borderRadius:16,border:"1px solid "+(dateFilter===f.id?C.gold:C.border),background:dateFilter===f.id?C.goldDim:"rgba(255,255,255,0.04)",color:dateFilter===f.id?C.gold:C.muted,fontSize:11,fontFamily:"Barlow,sans-serif",fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>{f.label}</button>);
              })}
            </div>

            {fixturesLoading&&<Spinner/>}
            {!fixturesLoading&&fixtures.length===0&&(
              <div style={{textAlign:"center",padding:"48px 0"}}>
                <div style={{fontSize:40,marginBottom:12}}>📅</div>
                <div style={{color:C.muted,fontFamily:"Barlow,sans-serif",fontSize:13}}>No matches found. Try a different date.</div>
              </div>
            )}
            {!fixturesLoading&&grouped.map(function(g){
              return <LeagueGroup key={g.leagueId} group={g} preds={null} onPredict={null} showPredict={false} dateFilter={dateFilter} onAnalyse={null}/>;
            })}
          </div>
        )}

        {/* PREDICT */}
        {tab==="predict"&&(
          <div>
            <div style={{background:C.surface,border:"1px solid "+C.border,borderRadius:14,padding:"16px",marginBottom:16,display:"flex"}}>
              {[[pts,"⚡","Points",C.gold],[predCount,"🎯","Predicted",C.gold],[coins+"🪙","🪙","Coins",C.gold]].map(function(item,i){
                return(<div key={i} style={{flex:1,textAlign:"center",borderRight:i<2?"1px solid "+C.border:"none",padding:"0 8px"}}>
                  <div style={{fontSize:9,marginBottom:4}}>{item[1]}</div>
                  <div style={{fontFamily:"DM Mono,monospace",fontWeight:500,fontSize:18,color:item[3]}}>{item[0]}</div>
                  <div style={{fontSize:9,color:C.muted,marginTop:2,fontFamily:"Barlow,sans-serif"}}>{item[2]}</div>
                </div>);
              })}
            </div>

             <div onClick={function(){setShowCoinStore(true);}} style={{background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:14,padding:"14px",marginBottom:16,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:12,background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🤖</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:16,color:C.purple,letterSpacing:1,marginBottom:2}}>KQ AI MATCH ANALYSIS</div>
                <div style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif"}}>1 free analysis/day · Tap a match below to analyse</div>
              </div>
              <div style={{background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:8,padding:"4px 10px"}}>
                <span style={{fontSize:11,color:C.purple,fontWeight:700,fontFamily:"Barlow,sans-serif"}}>{lastFreeAnalysis===new Date().toDateString()?"Used":"FREE"}</span>
              </div>
            </div>

            <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:18,color:C.white,letterSpacing:2,marginBottom:4}}>TODAY'S MATCHES</div>
            <div style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif",marginBottom:14}}>Tap to predict · 🤖 for AI analysis</div>

            {fixturesLoading&&<Spinner/>}
            {!fixturesLoading&&(function(){
              const hasUp=grouped.some(function(g){
                return g.matches.some(function(f){return mapApiStatus(f.fixture&&f.fixture.status&&f.fixture.status.short)==="upcoming";});
              });
              if(!hasUp) return(
                <div style={{textAlign:"center",padding:"48px 0"}}>
                  <div style={{fontSize:40,marginBottom:12}}>⚡</div>
                  <div style={{color:C.muted,fontFamily:"Barlow,sans-serif",fontSize:13,marginBottom:12}}>No upcoming matches today</div>
                  <button onClick={function(){setDateOffset(1);}} style={{padding:"8px 20px",borderRadius:10,background:C.goldDim,border:"1px solid "+C.gold+"40",color:C.gold,fontFamily:"Barlow,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>Check Tomorrow →</button>
                </div>
              );
              return grouped.map(function(g){
                const hasUp=g.matches.some(function(f){return mapApiStatus(f.fixture&&f.fixture.status&&f.fixture.status.short)==="upcoming";});
                if(!hasUp) return null;
                return <LeagueGroup key={g.leagueId} group={g} preds={preds} onPredict={setPredictModal} showPredict={true} dateFilter="upcoming" onAnalyse={setAnalysisModal}/>;
              });
            })()}

            {Object.keys(preds).length>0&&(
              <div style={{marginTop:24}}>
                <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:18,color:C.white,letterSpacing:2,marginBottom:12}}>YOUR PREDICTIONS</div>
                {Object.values(preds).slice(0,10).map(function(pred,i){
                  return(<div key={i} style={{background:C.surface,border:"1px solid "+C.border,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:10,color:C.muted,fontFamily:"Barlow,sans-serif",marginBottom:3}}>Match #{pred.matchId}</div>
                      <div style={{fontFamily:"DM Mono,monospace",fontSize:15,color:C.white,fontWeight:500}}>{pred.home} – {pred.away}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      {pred.scored
                        ?<div style={{fontSize:12,color:pred.ptsAwarded>0?C.green:C.red,fontWeight:700,fontFamily:"Barlow,sans-serif"}}>{pred.ptsAwarded>0?"+"+pred.ptsAwarded+" pts":"Miss ❌"}</div>
                        :<div style={{fontSize:10,color:C.muted,fontFamily:"Barlow,sans-serif"}}>Awaiting result</div>
                      }
                    </div>
                  </div>);
                })}
              </div>
            )}
          </div>
        )}

        {/* LEAGUES */}
        {tab==="leagues"&&(
          <div>
            <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:22,color:C.white,letterSpacing:2,marginBottom:4}}>LEAGUE TABLES</div>
            <div style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif",marginBottom:16}}>Powered by football-data.org (free)</div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:16}}>
              {Object.entries(LEAGUES).map(function(entry){
                const key=entry[0],lg=entry[1];
                return(<button key={key} onClick={function(){setStandingsLeague(key);}} style={{flexShrink:0,padding:"7px 14px",borderRadius:20,border:"1px solid "+(standingsLeague===key?C.gold:C.border),background:standingsLeague===key?C.goldDim:"rgba(255,255,255,0.04)",color:standingsLeague===key?C.gold:C.muted,fontSize:11,fontFamily:"Barlow,sans-serif",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all 0.2s"}}>
                  <span style={{fontSize:13}}>{lg.flag}</span>{lg.name}
                </button>);
              })}
            </div>
            {standingsLoading&&<Spinner/>}
            {!standingsLoading&&<StandingsTable rows={standings[standingsLeague]} leagueName={LEAGUES[standingsLeague]&&LEAGUES[standingsLeague].name}/>}
          </div>
        )}

        {/* NEWS */}
        {tab==="news"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:22,color:C.white,letterSpacing:2}}>FOOTBALL NEWS</div>
                <div style={{fontSize:10,color:C.muted,fontFamily:"Barlow,sans-serif",marginTop:2}}>Latest from around the world</div>
              </div>
              <button onClick={function(){setNews([]);setNewsLoading(true);fetchNews().then(function(d){setNews(d||[]);setNewsLoading(false);});}} style={{background:"rgba(255,255,255,0.04)",border:"1px solid "+C.border,borderRadius:16,padding:"6px 14px",color:newsLoading?C.muted:C.gold,fontSize:11,fontFamily:"Barlow,sans-serif",fontWeight:600,cursor:"pointer"}}>{newsLoading?"...":"↻ Refresh"}</button>
            </div>
            {newsLoading&&<Spinner/>}
            {!newsLoading&&news.length===0&&(
              <div style={{textAlign:"center",padding:"48px 0"}}>
                <div style={{fontSize:40,marginBottom:12}}>📰</div>
                <div style={{color:C.muted,fontFamily:"Barlow,sans-serif",fontSize:13,marginBottom:12}}>No news loaded</div>
                <button onClick={function(){setNewsLoading(true);fetchNews().then(function(d){setNews(d||[]);setNewsLoading(false);});}} style={{padding:"8px 20px",borderRadius:10,background:C.goldDim,border:"1px solid "+C.gold+"40",color:C.gold,fontFamily:"Barlow,sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>Load News</button>
              </div>
            )}
            {!newsLoading&&news.map(function(item,i){
              return(<a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",display:"block",marginBottom:12}}>
                <div style={{background:C.surface,border:"1px solid "+C.border,borderRadius:14,overflow:"hidden"}}>
                  {item.image&&<img src={item.image} style={{width:"100%",height:160,objectFit:"cover",display:"block"}} alt="" onError={function(e){e.target.style.display="none";}}/>}
                  <div style={{padding:"12px 14px"}}>
                    <div style={{fontSize:13,color:C.white,lineHeight:1.6,fontWeight:500,fontFamily:"Barlow,sans-serif",marginBottom:8}}>{item.title}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:10,color:C.gold,fontWeight:700,fontFamily:"Barlow,sans-serif"}}>{item.source&&item.source.toUpperCase()}</span>
                      <span style={{fontSize:10,color:C.muted,fontFamily:"Barlow,sans-serif"}}>{item.time}</span>
                    </div>
                  </div>
                </div>
              </a>);
            })}
          </div>
        )}

        {/* COMMUNITY */}
        {tab==="community"&&(
          <div>
            <a href="https://whatsapp.com/channel/0029VbDZLtsHgZWXYbWmzr0C" target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",display:"block",marginBottom:16}}>
              <div style={{background:"rgba(37,211,102,0.06)",border:"1px solid "+C.wa+"40",borderRadius:14,padding:"14px",display:"flex",alignItems:"center",gap:12,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,"+C.wa+",transparent)"}}/>
                <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,"+C.wa+",#1aad54)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"Barlow,sans-serif",fontWeight:700,fontSize:13,color:C.wa,marginBottom:2}}>KickQuest WhatsApp Channel</div>
                  <div style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif"}}>Match alerts · AI tips · Banter</div>
                </div>
                <div style={{background:C.wa,borderRadius:16,padding:"6px 14px",flexShrink:0}}><span style={{fontFamily:"Barlow,sans-serif",fontWeight:700,fontSize:12,color:"#0a0a0a"}}>JOIN</span></div>
              </div>
            </a>

            {/* Leaderboard */}
            <div style={{background:C.surface,border:"1px solid "+C.border,borderRadius:14,padding:"16px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div>
                  <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:18,color:C.white,letterSpacing:2}}>🌍 GLOBAL LEADERBOARD</div>
                  <div style={{fontSize:10,color:C.muted,fontFamily:"Barlow,sans-serif",marginTop:2}}>Live · Real-time via Firestore</div>
                </div>
                {myRank>0&&<div style={{background:C.goldDim,border:"1px solid "+C.gold+"40",borderRadius:10,padding:"4px 10px"}}><span style={{fontFamily:"DM Mono,monospace",fontSize:12,color:C.gold,fontWeight:500}}>You: #{myRank}</span></div>}
              </div>
              {leaderboard.length===0&&<div style={{textAlign:"center",padding:"24px",color:C.muted,fontFamily:"Barlow,sans-serif",fontSize:13}}>Make predictions to appear here</div>}
              {leaderboard.map(function(p,i){
                const isMe=user&&p.uid===user.id;
                const medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":null;
                return(<div key={p.uid||i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<leaderboard.length-1?"1px solid "+C.border+"40":"none",background:isMe?C.goldDim:"transparent",borderRadius:isMe?8:0,paddingLeft:isMe?8:0,paddingRight:isMe?8:0}}>
                  <div style={{width:24,textAlign:"center"}}>{medal?<span style={{fontSize:16}}>{medal}</span>:<span style={{fontFamily:"DM Mono,monospace",fontSize:12,color:C.muted}}>#{i+1}</span>}</div>
                  <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,0.06)",border:"1px solid "+(isMe?C.gold:C.border),display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{p.avatar||"⚽"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:isMe?C.gold:C.white,fontFamily:"Barlow,sans-serif"}}>@{p.username}{isMe?" (You)":""}</div>
                    {p.favTeam&&<div style={{fontSize:10,color:C.muted,fontFamily:"Barlow,sans-serif",marginTop:1}}>{p.favTeam}</div>}
                  </div>
                  <div style={{fontFamily:"DM Mono,monospace",fontWeight:500,fontSize:16,color:isMe?C.gold:C.silver}}>{p.pts||0}</div>
                </div>);
              })}
            </div>

            {/* Banter */}
            <div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:18,color:C.white,letterSpacing:2,marginBottom:12}}>💬 MATCH BANTER</div>
            <div style={{background:C.surface,border:"1px solid "+C.border,borderRadius:14,padding:"14px",marginBottom:14}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.06)",border:"1px solid "+C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{user.avatar}</div>
                <span style={{fontSize:12,color:C.gold,fontWeight:700,fontFamily:"Barlow,sans-serif"}}>@{user.username}</span>
              </div>
              <input value={banterInput} onChange={function(e){setBanterInput(e.target.value);}}
                onKeyDown={function(e){if(e.key==="Enter"&&banterInput.trim()) handleBanter();}}
                placeholder="Who's winning this weekend?..."
                style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid "+C.border,borderRadius:10,padding:"11px 14px",outline:"none",color:C.white,fontSize:13,fontFamily:"Barlow,sans-serif",marginBottom:10}}/>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {["🔥","😂","💀","👀","🐐","🏆","⚽","🎯"].map(function(e){ return <span key={e} style={{fontSize:18,cursor:"pointer"}} onClick={function(){setBanterInput(function(v){return v+e;});}}>{e}</span>; })}
                <button onClick={handleBanter} style={{marginLeft:"auto",background:C.goldDim,border:"1px solid "+C.gold+"40",borderRadius:8,padding:"7px 16px",color:C.gold,fontSize:12,fontFamily:"Barlow,sans-serif",fontWeight:700,cursor:"pointer"}}>Post</button>
              </div>
            </div>

            {banter.length===0&&<div style={{textAlign:"center",padding:"24px",color:C.muted,fontFamily:"Barlow,sans-serif",fontSize:13}}>No banter yet. Start the conversation 🔥</div>}
            {banter.map(function(b){
              return(<div key={b.id} style={{background:C.surface,border:"1px solid "+C.border,borderRadius:14,padding:"13px",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,255,255,0.06)",border:"1px solid "+C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{b.avatar||"⚽"}</div>
                  <span style={{fontSize:12,fontWeight:700,color:C.gold,fontFamily:"Barlow,sans-serif"}}>@{b.username}</span>
                  <span style={{fontSize:10,color:C.muted,marginLeft:"auto",fontFamily:"Barlow,sans-serif"}}>{timeAgo(b.createdAt)}</span>
                </div>
                <p style={{fontSize:13,margin:"0 0 10px",lineHeight:1.6,color:C.white,fontFamily:"Barlow,sans-serif"}}>{b.msg}</p>
                <div style={{display:"flex",gap:14}}>
                  <span style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif"}}>🔥 {b.likes||0}</span>
                  <span style={{fontSize:11,color:C.muted,fontFamily:"Barlow,sans-serif"}}>↩ Reply</span>
                  <span style={{fontSize:11,color:C.muted,marginLeft:"auto",fontFamily:"Barlow,sans-serif"}}>📤</span>
                </div>
              </div>);
            })}
          </div>
        )}
      </div>

      {predictModal&&<PredictModal fixture={predictModal} onClose={function(){setPredictModal(null);}} onSubmit={handlePredict}/>}
      {analysisModal&&<AnalysisModal fixture={analysisModal} onClose={function(){setAnalysisModal(null);}} userCoins={coins} lastFreeAnalysis={lastFreeAnalysis} onSpendCoins={handleSpendCoins} onUseFree={handleUseFreeAnalysis}/>}
    </div>
  );
}
