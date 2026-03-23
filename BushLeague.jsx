bash

cat /home/claude/BushLeague.jsx
Output

import { useState, useMemo } from "react";
import { FRANCHISES, SEASONS, TRADES } from "./data.js";
import { DRAFTS } from "./drafts.js";

// ─────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────
const C = {
  bg:         "#08080d",
  surface:    "#0e0e16",
  card:       "#13131e",
  border:     "#1a1a2e",
  borderHi:   "#2a2a45",
  text:       "#f0eeff",
  muted:      "#5a5775",
  dim:        "#2e2b40",
  gold:       "#ffd166",
  goldDim:    "#ffd16622",
  green:      "#06d6a0",
  greenDim:   "#06d6a018",
  red:        "#ff4d6d",
  redDim:     "#ff4d6d18",
  accent:     "#9b8aff",
  accentDim:  "#9b8aff18",
  orange:     "#ff9f1c",
  orangeDim:  "#ff9f1c18",
};

const sans = "'DM Sans', 'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Fira Mono', monospace";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;900&family=JetBrains+Mono:wght@500;700&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #08080d; }
  ::-webkit-scrollbar-thumb { background: #2a2a45; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #5a5775; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }
  .fade-in { animation: fadeIn 0.2s ease both; }
`;

function GlobalStyles() {
  return <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />;
}

// ─────────────────────────────────────────────
// SHIT TALK — earned, stats-based, permanent record
// ─────────────────────────────────────────────
const ROASTS = {
  "Kam":        { tagline: "3 rings. Still the standard.", burn: "111-89 all-time, three championships, and the commissioner's chair. Whether that last part matters is between you and your conscience." },
  "Biceps Inc": { tagline: "3 rings. Also went 12-2 in 2021 and got bounced in the semis. We don't forget.", burn: "The most rings, the best win rate, the highest floor in the league. Would be the undisputed GOAT conversation if they hadn't folded as the #1 seed in 2021 like a lawn chair. Back-to-back titles in '18 and '19 makes up for a lot. Not all of it." },
  "Magoo":      { tagline: "2 rings. Won as a 2-seed AND a 5-seed. Doesn't care about your regular season.", burn: "54% career win rate, two championships, and an uncanny ability to turn into a completely different team in December. The most dangerous 'just good enough in October' franchise in the league." },
  "Vidz":       { tagline: "1 ring. Also 11-2 in 2011, 10-3 in 2016, 10-4 in 2022. All semifinals exits or worse.", burn: "Four double-digit win seasons. One ring. Went 11-2 in the inaugural season and lost in the semis. Went 10-3 in 2016 as the #1 seed and lost in the finals. Went 10-4 in 2022 and lost in the finals again. The regular season is not the point, Vidz. The regular season is NOT THE POINT." },
  "Salsa Dick": { tagline: "1 ring, 57.5% win rate, and a 12-1 season that ended in 6th place.", burn: "The best career win rate of any active franchise. One championship. Went 12-1 in 2014 and finished dead last in the playoffs. Not 4th. Not 3rd. Sixth. Out of six. Statistically, this is the greatest regular season collapse in Busch League history and it isn't close." },
  "Fritz":      { tagline: "1 ring, barely above .500, and weirdly always in the mix.", burn: "50.3% for his career — basically a coin flip every week — and yet he has a ring and 6 playoff appearances. Went 10-3 in 2013 as the #1 seed, lost in the finals. Won it in 2017 as the 1-seed like he was making a statement. He was." },
  "Boomer":     { tagline: "1 ring. Was 10-3 and the #1 seed in 2020. Finished 4th.", burn: "Went 10-3 in 2020, locked up the bye, got bounced before the championship. Won it all in 2024 as a 1-seed, went 12-2, and did it right. So maybe 2020 was just warmup. Still. 2020 happened and we all saw it." },
  "Devany":     { tagline: "0 rings. 47.1% win rate. 7 playoff appearances. Still waiting.", burn: "Thirteen seasons. Never won. Came closest in 2015 as a 5-seed finalist, which is both impressive and exactly the kind of thing that happens to Devany. Has the points to compete most years and the hardware to show for none of it." },
  "Trust":      { tagline: "1 ring as a 6-seed. Went 12-2 in 2023 and lost in the championship. Do not ask Trust to explain themselves.", burn: "43.7% career win rate and somehow a ring. Won in 2016 as the dead-last seed after finishing 7-6. Then went 12-2 in 2023, led the entire league in scoring, had the #1 seed, and lost the championship game to Tino, a 3-seed. This franchise exists in a different dimension." },
  "Sherlock":   { tagline: "0 rings. 43% win rate. Has been here since day one and has nothing to show for it.", burn: "15 seasons. 5 playoff appearances. Zero rings. Brian Sherlock has watched every single champion hoist a trophy and clapped politely every time. The most loyal winless franchise in the history of organized fantasy football." },
  "DDC":        { tagline: "0 rings. 42% win rate. Made the playoffs twice in 13 years.", burn: "Thirteen seasons of entry fees. Two playoff appearances. Went 2-11 in 2020. Has the second-worst career win rate of any active team. DDC is proof that showing up every year and the scoreboard are two very different things." },
  "Tino":       { tagline: "1 sneaky ring and a 10-3 season that ended in 4th place.", burn: "Had the best record in the league in 2018 as the #1 seed. Finished fourth. Then in 2023 crept in as a 3-seed and won the whole thing. Kyle Sorrentino contains multitudes, none of them predictable." },
};

const TRADE_VERDICTS = {
  "trade_001": "King's Landing gave up Mark Andrews AND Ja'Marr Chase for Caleb Williams. CALEB WILLIAMS. The league vetoed this because apparently some crimes are too obvious to allow. Rightfully condemned.",
  "trade_002": "Jordan Addison — coming off a 1,000-yard season — for Courtland Sutton, who was 29 and playing in Denver. Brian Company handed this one over with a bow on it.",
  "trade_003": "Ja'Marr Chase, one of the three best WRs in football, for Omarion Hampton, a rookie RB with zero NFL snaps. Salsa Hips traded a known commodity for a draft pick wearing cleats. Bold. Possibly deranged.",
  "trade_005": "Bijan Robinson — a legitimate RB1 — for Marvin Harrison Jr. AND Aaron Jones. El Problemo CNDB got two contributors for one elite back. Swoly Moly needed to think longer.",
  "trade_006": "DK Metcalf and Jaylen Warren for Jonathon Brooks and Deebo Samuel. Salsa Hips moved a prime, healthy Metcalf and received a rehabbing Deebo and a guy named Jonathon Brooks. The vibes were off from the start.",
  "trade_007": "DeVonta Smith, a legitimate WR1, for Cade Otton — a backup TE on the Buccaneers. Here Comes the Boom saw a man drowning and threw him a cinder block.",
  "trade_012": "CeeDee Lamb for Breece Hall. One is a generational wide receiver. The other is a running back in the post-RB era of fantasy. Biceps Inc recognized the imbalance and moved accordingly. Brian Company will think about this one for a while.",
  "trade_027": "Derrick Henry, Terry McLaurin, and Patrick Mahomes for AJ Dillon, Ja'Marr Chase, and Joe Burrow. Conor N Da Boyz sent an absurd package and still arguably broke even once Burrow and Chase went nuclear. The most confusing trade outcome in league history.",
  "trade_028": "Kyler Murray + Cordarrelle Patterson + Myles Gaskin + CeeDee Lamb for Ezekiel Elliott + Lamar Jackson + Tony Pollard. Kitty CoVidz received peak CeeDee and a 2020 MVP finalist. Salsa Champ got Lamar, a washed Zeke, and a handcuff. This was not close.",
  "trade_034": "Lamar Jackson — the reigning NFL MVP at the time — for Aaron Rodgers, who was 37 and injured. Inflatable Biceps traded the best fantasy QB in the game for vibes. This deserves a plaque.",
  "trade_042": "Alvin Kamara AND Calvin Ridley for Derrick Henry, TY Hilton, and Marvin Jones. Warlord Vein N Da Boyz traded a top-3 RB and a reliable WR for volume. Biceps Inc got elite. The committee got old.",
  "trade_049": "OBJ and Austin Hooper for Emmanuel Sanders and Tevin Coleman. Warlord Vein N Da Boyz took the famous names. Stairway To Seven took the guys who were actually playing well. The name-value trap claims another victim.",
};

// ─────────────────────────────────────────────
// COMPUTED
// ─────────────────────────────────────────────
function buildFranchiseStats() {
  const stats = {};
  FRANCHISES.forEach(f => {
    stats[f.id] = {
      id: f.id, owner: f.owner,
      wins: 0, losses: 0, ties: 0,
      pf: 0, pa: 0, seasons: 0,
      championships: 0, runnerUp: 0, third: 0,
      playoffApps: 0, finishes: [],
    };
  });
  SEASONS.forEach(s => {
    if (s.champion) { const c = stats[s.champion]; if (c) c.championships++; }
    if (s.runnerUp)  { const r = stats[s.runnerUp];  if (r) r.runnerUp++; }
    if (s.third)     { const t = stats[s.third];     if (t) t.third++; }
    s.standings.forEach((row, i) => {
      const f = stats[row.franchise]; if (!f) return;
      const [w, l, t] = row.rec.split("-").map(Number);
      f.wins += w; f.losses += l; f.ties += (t || 0);
      f.pf += row.pf; f.pa += row.pa; f.seasons++;
      f.finishes.push({ year: s.year, rank: i + 1 });
    });
    s.playoffs?.forEach(p => { const f = stats[p.franchise]; if (f) f.playoffApps++; });
  });
  return Object.values(stats).filter(f => f.seasons > 0);
}

function winPct(f) { const t = f.wins+f.losses+f.ties; return t ? f.wins/t : 0; }
function powerScore(f) {
  const ppg = f.seasons ? f.pf/(f.wins+f.losses+f.ties) : 0;
  return Math.round(f.championships*28 + winPct(f)*40 + (f.seasons?f.playoffApps/f.seasons:0)*18 + f.runnerUp*6 + f.third*3 + ppg*0.05);
}

// ─────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────
function Tag({ children, color = C.muted, bg }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 10, fontWeight: 700, color,
      background: bg || color + "1a", padding: "3px 8px",
      letterSpacing: "0.07em", borderRadius: 2, whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function Bar({ value, max, color = C.accent }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height: 2, background: C.border, width: "100%", borderRadius: 1 }}>
      <div style={{ height: 2, width: `${pct}%`, background: color, borderRadius: 1, transition: "width 0.5s", boxShadow: `0 0 8px ${color}66` }} />
    </div>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ padding: "32px 28px 20px", borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, ${C.surface} 0%, transparent 100%)` }}>
      <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 24, color: C.text, letterSpacing: "-0.03em" }}>{title}</div>
      {sub && <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginTop: 8, lineHeight: 1.6 }}>{sub}</div>}
    </div>
  );
}

function StatPill({ label, value, color = C.text }) {
  return (
    <div style={{ textAlign: "center", padding: "10px 16px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 4 }}>
      <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 18, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, fontWeight: 700, marginTop: 4, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function Btn({ active, onClick, children, activeColor = C.accent }) {
  return (
    <button onClick={onClick} style={{
      background: active ? activeColor + "1e" : "none",
      border: `1px solid ${active ? activeColor : C.border}`,
      color: active ? activeColor : C.muted,
      fontFamily: mono, fontSize: 10, fontWeight: 700,
      padding: "5px 12px", cursor: "pointer",
      letterSpacing: "0.07em", textTransform: "uppercase",
      borderRadius: 2, whiteSpace: "nowrap", transition: "all 0.15s",
    }}>{children}</button>
  );
}

// ─────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "power", label: "Power" }, { id: "seasons", label: "Seasons" },
  { id: "standings", label: "Standings" }, { id: "playoffs", label: "Playoffs" },
  { id: "trades", label: "Trades" }, { id: "draft", label: "Draft" },
  { id: "franchises", label: "Franchises" },
];

function Nav({ active, setActive }) {
  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 24px #00000055" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", display: "flex", alignItems: "stretch", overflowX: "auto" }}>
        <div style={{ padding: "0 24px", display: "flex", alignItems: "center", gap: 10, borderRight: `1px solid ${C.border}`, flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>🏈</span>
          <div>
            <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 13, color: C.gold, letterSpacing: "0.08em", lineHeight: 1 }}>BUSCH LG</div>
            <div style={{ fontFamily: mono, fontSize: 8, color: C.muted, letterSpacing: "0.1em", marginTop: 2 }}>2011–PRESENT</div>
          </div>
        </div>
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => setActive(n.id)} style={{
            background: "none", border: "none",
            borderBottom: `2px solid ${active === n.id ? C.accent : "transparent"}`,
            borderTop: "2px solid transparent",
            color: active === n.id ? C.text : C.muted,
            fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            padding: "16px 15px", cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.15s",
          }}>{n.label.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// POWER RANKINGS
// ─────────────────────────────────────────────
function PowerRankings() {
  const all = useMemo(() => buildFranchiseStats(), []);
  const ranked = [...all].sort((a, b) => powerScore(b) - powerScore(a));
  const maxScore = powerScore(ranked[0]);
  const medals = ["🥇","🥈","🥉"];

  return (
    <div className="fade-in">
      <SectionHeader title="Power Rankings" sub={`All-time greatness, objectively quantified. Champs ×28 · Win% ×40 · Playoff rate ×18 · Runner-up ×6 · 3rd place ×3 · ${SEASONS.length} seasons of receipts.`} />
      {ranked.map((f, i) => {
        const score = powerScore(f);
        const pct = (winPct(f) * 100).toFixed(1);
        const color = i === 0 ? C.gold : i === 1 ? "#c0c0d0" : i === 2 ? C.orange : i < 6 ? C.accent : C.muted;
        return (
          <div key={f.id} style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 28px", background: i === 0 ? `linear-gradient(90deg, ${C.goldDim} 0%, transparent 60%)` : "transparent" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ width: 42, flexShrink: 0, textAlign: "center" }}>
                {i < 3 ? <span style={{ fontSize: 22 }}>{medals[i]}</span>
                        : <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: C.dim }}>{i+1}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 16, color: i === 0 ? C.gold : C.text }}>{f.id}</span>
                  <span style={{ fontFamily: mono, fontSize: 10, color: C.muted }}>{f.owner.split("/")[0].trim()}</span>
                </div>
                <div style={{ marginTop: 8 }}><Bar value={score} max={maxScore + 2} color={color} /></div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {f.championships > 0 && <Tag color={C.gold}>{"🏆".repeat(f.championships)} {f.championships}× champ</Tag>}
                <Tag color={parseFloat(pct) >= 50 ? C.green : C.muted}>{pct}%</Tag>
                <Tag color={C.muted}>{f.playoffApps} playoffs</Tag>
                <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 20, color, minWidth: 44, textAlign: "right" }}>{score}</div>
              </div>
            </div>
            {ROASTS[f.id] && (
              <div style={{ marginTop: 8, marginLeft: 58, fontFamily: mono, fontSize: 11, color: C.muted, lineHeight: 1.6, fontStyle: "italic" }}>
                "{ROASTS[f.id].tagline}"
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// SEASONS
// ─────────────────────────────────────────────
function Seasons() {
  const [expanded, setExpanded] = useState(null);
  return (
    <div className="fade-in">
      <SectionHeader title="Season History" sub="Year-by-year champions and standings. Click to expand." />
      {[...SEASONS].sort((a, b) => b.year - a.year).map(s => {
        const isOpen = expanded === s.year;
        const champ = FRANCHISES.find(f => f.id === s.champion);
        return (
          <div key={s.year} style={{ borderBottom: `1px solid ${C.border}` }}>
            <div onClick={() => setExpanded(isOpen ? null : s.year)} style={{
              padding: "14px 28px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
              background: isOpen ? C.card : "transparent", transition: "background 0.15s",
            }}>
              <div style={{ fontFamily: mono, fontWeight: 700, fontSize: 18, color: C.gold, width: 52, flexShrink: 0 }}>{s.year}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Tag color={C.gold} bg={C.goldDim}>🏆 CHAMPION</Tag>
                  <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 14, color: C.text }}>{s.champion}</span>
                  {champ && <span style={{ fontFamily: mono, fontSize: 10, color: C.muted }}>{champ.owner.split("/")[0].trim()}</span>}
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 5 }}>
                  Runner-up: <span style={{ color: C.orange }}>{s.runnerUp}</span>{" · "}3rd: <span style={{ color: C.accent }}>{s.third}</span>
                  {s.note && <span style={{ color: C.dim }}> · {s.note}</span>}
                </div>
              </div>
              <span style={{ fontFamily: mono, fontSize: 10, color: C.dim }}>{isOpen ? "▲" : "▼"}</span>
            </div>
            {isOpen && (
              <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: "16px 28px" }} className="fade-in">
                <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 80px 80px", gap: "0 8px", marginBottom: 8 }}>
                  {["#","TEAM","REC","PF","PA"].map(h => (
                    <div key={h} style={{ fontFamily: mono, fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: "0.1em", textAlign: h==="TEAM"||h==="#"?"left":"right", paddingBottom: 6, borderBottom: `1px solid ${C.border}` }}>{h}</div>
                  ))}
                </div>
                {s.standings.map((row, i) => (
                  <div key={row.franchise} style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 80px 80px", gap: "0 8px", padding: "6px 0", borderBottom: `1px solid ${C.border}88`, alignItems: "center" }}>
                    <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: i===0?C.gold:i<3?C.accent:C.dim }}>{i+1}</div>
                    <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 13, color: C.text }}>{row.franchise}</div>
                    <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, textAlign: "right" }}>{row.rec}</div>
                    <div style={{ fontFamily: mono, fontSize: 11, color: C.green, textAlign: "right" }}>{row.pf.toFixed(1)}</div>
                    <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, textAlign: "right" }}>{row.pa.toFixed(1)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// ALL-TIME STANDINGS
// ─────────────────────────────────────────────
function AllTimeStandings() {
  const [sort, setSort] = useState("wins");
  const all = useMemo(() => buildFranchiseStats(), []);
  const sorted = [...all].sort((a, b) => {
    if (sort === "wins")   return b.wins - a.wins || winPct(b) - winPct(a);
    if (sort === "winpct") return winPct(b) - winPct(a);
    if (sort === "pf")     return b.pf - a.pf;
    if (sort === "ppg")    return (b.pf/(b.wins+b.losses+b.ties||1)) - (a.pf/(a.wins+a.losses+a.ties||1));
    if (sort === "champs") return b.championships - a.championships || winPct(b) - winPct(a);
    return 0;
  });
  const Th = ({ c, right }) => (
    <th style={{ fontFamily: mono, fontSize: 9, color: C.muted, fontWeight: 700, padding: "10px 12px", textAlign: right?"right":"left", letterSpacing: "0.1em", whiteSpace: "nowrap", borderBottom: `1px solid ${C.border}`, background: C.card }}>{c}</th>
  );
  return (
    <div className="fade-in">
      <SectionHeader title="All-Time Standings" sub={`Cumulative records across all ${SEASONS.length} seasons.`} />
      <div style={{ padding: "12px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginRight: 4 }}>SORT</span>
        {[["wins","Wins"],["winpct","Win%"],["pf","PF"],["ppg","PPG"],["champs","Rings"]].map(([id,label]) => (
          <Btn key={id} active={sort===id} onClick={() => setSort(id)}>{label}</Btn>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
          <thead>
            <tr>
              <Th c="#" right /><Th c="Team" /><Th c="Owner" />
              <Th c="W" right /><Th c="L" right /><Th c="T" right /><Th c="Win%" right />
              <Th c="PF" right /><Th c="PA" right /><Th c="PPG" right />
              <Th c="🏆" right /><Th c="R-Up" right /><Th c="Playoffs" right /><Th c="Yrs" right />
            </tr>
          </thead>
          <tbody>
            {sorted.map((f, i) => {
              const tot = f.wins+f.losses+f.ties;
              const ppg = tot ? (f.pf/tot).toFixed(1) : "—";
              const pct = (winPct(f)*100).toFixed(1);
              return (
                <tr key={f.id} style={{ borderBottom: `1px solid ${C.border}`, background: i%2===0?"transparent":C.surface+"88" }}>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.dim, padding: "10px 12px", textAlign: "right" }}>{i+1}</td>
                  <td style={{ fontFamily: sans, fontWeight: 900, fontSize: 13, color: f.championships>0?C.gold:C.text, padding: "10px 12px", whiteSpace: "nowrap" }}>{f.id}</td>
                  <td style={{ fontFamily: mono, fontSize: 10, color: C.muted, padding: "10px 12px", whiteSpace: "nowrap" }}>{f.owner.split("/")[0].trim()}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.green,  padding: "10px 12px", textAlign: "right" }}>{f.wins}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.red,    padding: "10px 12px", textAlign: "right" }}>{f.losses}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.muted,  padding: "10px 12px", textAlign: "right" }}>{f.ties||"—"}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: parseFloat(pct)>=50?C.green:C.muted, padding: "10px 12px", textAlign: "right", fontWeight: 700 }}>{pct}%</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.text,   padding: "10px 12px", textAlign: "right" }}>{f.pf.toFixed(0)}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.muted,  padding: "10px 12px", textAlign: "right" }}>{f.pa.toFixed(0)}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.text,   padding: "10px 12px", textAlign: "right" }}>{ppg}</td>
                  <td style={{ fontFamily: mono, fontSize: 13, color: f.championships>0?C.gold:C.dim, padding: "10px 12px", textAlign: "right", fontWeight: 900 }}>{f.championships||"—"}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: f.runnerUp>0?C.orange:C.dim, padding: "10px 12px", textAlign: "right" }}>{f.runnerUp||"—"}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.text,   padding: "10px 12px", textAlign: "right" }}>{f.playoffApps}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.muted,  padding: "10px 12px", textAlign: "right" }}>{f.seasons}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PLAYOFF HISTORY
// ─────────────────────────────────────────────
function PlayoffHistory() {
  const all = useMemo(() => buildFranchiseStats(), []);
  const [view, setView] = useState("table");
  const teamPlayoffs = all.map(f => {
    const appearances = [];
    SEASONS.forEach(s => {
      const p = s.playoffs?.find(x => x.franchise === f.id);
      if (p) appearances.push({ year: s.year, seed: p.seed, finish: p.finish, champion: s.champion === f.id, runnerUp: s.runnerUp === f.id });
    });
    return { ...f, appearances, champCount: appearances.filter(a => a.champion).length };
  }).filter(f => f.appearances.length > 0)
    .sort((a, b) => b.champCount - a.champCount || b.appearances.length - a.appearances.length);

  const fs = (finish, champ, ru) => {
    if (champ)      return { color: C.gold,   bg: C.goldDim,   label: "🏆 CHAMP" };
    if (ru)         return { color: C.orange,  bg: C.orangeDim, label: "2nd" };
    if (finish===3) return { color: C.accent,  bg: C.accentDim, label: "3rd" };
    return { color: C.muted, bg: "transparent", label: `${finish}th` };
  };

  return (
    <div className="fade-in">
      <SectionHeader title="Playoff History" sub="All-time playoff appearances, seeds, and finishes." />
      <div style={{ padding: "12px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 6 }}>
        <Btn active={view==="table"}   onClick={() => setView("table")}>By Team</Btn>
        <Btn active={view==="bracket"} onClick={() => setView("bracket")}>By Year</Btn>
      </div>

      {view === "table" && (
        <div className="fade-in">
          {teamPlayoffs.map(f => {
            const champs = f.appearances.filter(a => a.champion).length;
            const ru     = f.appearances.filter(a => a.runnerUp).length;
            return (
              <div key={f.id} style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 15, color: champs>0?C.gold:C.text }}>{f.id}</span>
                    <span style={{ fontFamily: mono, fontSize: 10, color: C.muted }}>{f.owner.split("/")[0].trim()}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {champs > 0 && <Tag color={C.gold}>🏆 {champs}× champ</Tag>}
                    {ru > 0     && <Tag color={C.orange}>{ru}× runner-up</Tag>}
                    <Tag color={C.muted}>{f.appearances.length} apps</Tag>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {f.appearances.sort((a, b) => b.year - a.year).map(a => {
                    const s = fs(a.finish, a.champion, a.runnerUp);
                    return (
                      <div key={a.year} style={{ padding: "6px 10px", background: s.bg, border: `1px solid ${s.color}44`, borderRadius: 2 }}>
                        <div style={{ fontFamily: mono, fontSize: 9, color: s.color, fontWeight: 700 }}>{a.year}</div>
                        <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 12, color: s.color, marginTop: 1 }}>{s.label}</div>
                        <div style={{ fontFamily: mono, fontSize: 9, color: C.dim }}>S{a.seed}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "bracket" && (
        <div className="fade-in">
          {[...SEASONS].sort((a, b) => b.year - a.year).map(s => (
            <div key={s.year} style={{ borderBottom: `1px solid ${C.border}`, display: "flex" }}>
              <div style={{ width: 64, padding: "16px 0 16px 28px", flexShrink: 0, fontFamily: mono, fontWeight: 700, fontSize: 16, color: C.gold, paddingTop: 18 }}>{s.year}</div>
              <div style={{ flex: 1, padding: "14px 28px 14px 16px", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {s.playoffs?.sort((a, b) => a.finish - b.finish).map(p => {
                  const col = p.finish===1?C.gold:p.finish===2?C.orange:p.finish===3?C.accent:C.muted;
                  return (
                    <div key={p.franchise} style={{ padding: "7px 12px", background: p.finish===1?C.goldDim:C.card, border: `1px solid ${col}44`, borderRadius: 2 }}>
                      <div style={{ fontFamily: mono, fontSize: 9, color: col, fontWeight: 700, letterSpacing: "0.08em" }}>
                        {p.finish===1?"CHAMPION":p.finish===2?"RUNNER-UP":p.finish===3?"3RD":`${p.finish}TH`}
                      </div>
                      <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 13, color: p.finish===1?C.gold:C.text }}>{p.franchise}</div>
                      <div style={{ fontFamily: mono, fontSize: 9, color: C.dim }}>Seed {p.seed}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TRADE HISTORY
// ─────────────────────────────────────────────
function TradeHistory() {
  const [filter, setFilter] = useState("all");
  const years = [...new Set(TRADES.map(t => t.year))].sort((a, b) => b - a);
  const filtered = filter === "all"   ? TRADES
                 : filter === "shame" ? TRADES.filter(t => t.shame)
                 : TRADES.filter(t => t.year === parseInt(filter));
  const sorted = [...filtered].sort((a, b) => b.year - a.year || b.week - a.week);

  return (
    <div className="fade-in">
      <SectionHeader title="Trade History" sub="A permanent record of every deal, fleece job, and act of desperation this league has ever produced. Some of these people shook hands on this." />
      <div style={{ padding: "12px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
        <Btn active={filter==="all"}   onClick={() => setFilter("all")}>All</Btn>
        <Btn active={filter==="shame"} onClick={() => setFilter("shame")} activeColor={C.red}>🚨 Shame</Btn>
        {years.map(y => <Btn key={y} active={filter===String(y)} onClick={() => setFilter(String(y))}>{y}</Btn>)}
      </div>

      {sorted.map(t => {
        const winnerSide = t.winner===t.sideA.franchise?"A":t.winner===t.sideB.franchise?"B":null;
        return (
          <div key={t.id} style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 28px" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
              <Tag color={C.muted}>{t.year} · WK {t.week}</Tag>
              {t.shame && <Tag color={C.red} bg={C.redDim}>🚨 SHAME TRADE</Tag>}
              {t.winner==="push" && <Tag color={C.orange} bg={C.orangeDim}>PUSH</Tag>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr", gap: 10, alignItems: "start" }}>
              {[{side:t.sideA, w:winnerSide==="A"}, null, {side:t.sideB, w:winnerSide==="B"}].map((item, idx) => {
                if (!item) return (
                  <div key="mid" style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 16 }}>
                    <span style={{ fontFamily: sans, fontSize: 18, color: C.dim }}>⇄</span>
                  </div>
                );
                const { side, w } = item;
                return (
                  <div key={idx} style={{ padding: "12px 14px", borderRadius: 3, background: w?C.greenDim:C.card, border: `1px solid ${w?C.green:C.border}` }}>
                    <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 13, color: w?C.green:C.text, marginBottom: 8 }}>{side.franchise}{w && " ✓"}</div>
                    <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.1em", marginBottom: 4 }}>GAVE</div>
                    {side.gave.map(p => <div key={p} style={{ fontFamily: sans, fontSize: 12, color: C.red, fontWeight: 700, marginBottom: 2 }}>↑ {p}</div>)}
                    <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.1em", marginTop: 8, marginBottom: 4 }}>RECEIVED</div>
                    {side.received.map(p => <div key={p} style={{ fontFamily: sans, fontSize: 12, color: C.green, fontWeight: 700, marginBottom: 2 }}>↓ {p}</div>)}
                  </div>
                );
              })}
            </div>
            {(t.verdict || TRADE_VERDICTS[t.id]) && (
              <div style={{ marginTop: 10, fontFamily: mono, fontSize: 12, color: "#c0bdd4", lineHeight: 1.7, padding: "10px 14px", borderLeft: `3px solid ${t.shame?C.red:t.winner==="push"?C.orange:C.accent}`, background: C.bg, borderRadius: "0 2px 2px 0" }}>
                <span style={{ fontFamily: mono, fontSize: 9, color: C.accent, fontWeight: 700, letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>VERDICT</span>
                {t.verdict || TRADE_VERDICTS[t.id]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// DRAFT ANALYSIS — scroll fixed
// ─────────────────────────────────────────────
function DraftAnalysis() {
  const [year, setYear] = useState(DRAFTS[DRAFTS.length - 1]?.year);
  const [view, setView] = useState("board");
  const draft = DRAFTS.find(d => d.year === year);
  const posColor = { RB: C.green, WR: C.accent, QB: C.gold, TE: C.orange, K: C.muted, DEF: C.muted };

  if (!draft) return <div style={{ padding: 24, color: C.muted }}>No draft data available.</div>;

  const rounds     = draft.rounds || Math.max(...draft.picks.map(p => p.round));
  const franchises = [...new Set(draft.picks.map(p => p.franchise))].sort();
  const grid = {};
  draft.picks.forEach(p => { if (!grid[p.round]) grid[p.round] = {}; grid[p.round][p.franchise] = p; });

  return (
    <div className="fade-in">
      <SectionHeader title="Draft Board" sub="Pick-by-pick draft history." />

      <div style={{ padding: "12px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontFamily: mono, fontSize: 9, color: C.dim, fontWeight: 700, marginRight: 2 }}>YEAR</span>
        {DRAFTS.map(d => (
          <Btn key={d.year} active={year===d.year} onClick={() => setYear(d.year)} activeColor={C.gold}>
            {d.year}{d.status==="incomplete"?"*":""}
          </Btn>
        ))}
        <span style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginLeft: 4 }}>* incomplete</span>
      </div>

      <div style={{ padding: "8px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 6 }}>
        <Btn active={view==="board"} onClick={() => setView("board")}>Board</Btn>
        <Btn active={view==="list"}  onClick={() => setView("list")}>List</Btn>
      </div>

      {/* BOARD — fix: explicit minWidth on the inner div forces horizontal scroll */}
      {view === "board" && (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ padding: "16px 28px", minWidth: Math.max(600, franchises.length * 114 + 60) }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ fontFamily: mono, fontSize: 9, color: C.muted, fontWeight: 700, padding: "6px 12px 10px 0", textAlign: "left", whiteSpace: "nowrap", minWidth: 44, borderBottom: `1px solid ${C.border}` }}>RND</th>
                  {franchises.map(f => (
                    <th key={f} style={{ fontFamily: mono, fontSize: 9, color: C.muted, fontWeight: 700, padding: "6px 6px 10px", textAlign: "center", whiteSpace: "nowrap", minWidth: 108, borderBottom: `1px solid ${C.border}` }}>{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rounds }, (_, ri) => ri + 1).map(r => (
                  <tr key={r} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ fontFamily: mono, fontSize: 11, color: C.dim, padding: "5px 12px 5px 0", fontWeight: 700, verticalAlign: "top", whiteSpace: "nowrap" }}>R{r}</td>
                    {franchises.map(f => {
                      const p = grid[r]?.[f];
                      if (!p) return <td key={f} style={{ padding: "3px 6px" }} />;
                      const col = posColor[p.pos] || C.muted;
                      return (
                        <td key={f} style={{ padding: "3px 6px", verticalAlign: "top" }}>
                          <div style={{ padding: "6px 8px", borderRadius: 3, background: p.keeper?C.goldDim:C.card, border: `1px solid ${p.keeper?C.gold+"44":C.border}` }}>
                            <div style={{ fontFamily: mono, fontSize: 9, color: col, fontWeight: 700, marginBottom: 2, display: "flex", alignItems: "center", gap: 3 }}>
                              <span style={{ background: col+"22", padding: "1px 4px", borderRadius: 2 }}>{p.pos}</span>
                              {p.keeper && <span style={{ color: C.gold, fontSize: 8 }}>K</span>}
                            </div>
                            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 11, color: C.text, lineHeight: 1.3 }}>{p.player.replace(/\(K\)/g,"").trim()}</div>
                            <div style={{ fontFamily: mono, fontSize: 8, color: C.dim, marginTop: 2 }}>#{p.overall}</div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="fade-in">
          {draft.picks.map((p, i) => {
            const col = posColor[p.pos] || C.muted;
            return (
              <div key={p.overall} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 28px", borderBottom: `1px solid ${C.border}`, background: i%2===0?"transparent":C.surface+"66" }}>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.dim, width: 36, textAlign: "right" }}>#{p.overall}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, width: 28 }}>R{p.round}</div>
                <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: col, background: col+"1a", padding: "2px 7px", borderRadius: 2, width: 38, textAlign: "center" }}>{p.pos}</span>
                <div style={{ flex: 1, fontFamily: sans, fontWeight: 700, fontSize: 13, color: C.text }}>
                  {p.player.replace(/\(K\)/g,"").trim()}
                  {p.keeper && <span style={{ marginLeft: 8, fontFamily: mono, fontSize: 9, color: C.gold }}>KEEPER</span>}
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{p.franchise}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// FRANCHISES
// ─────────────────────────────────────────────
function FranchisesView() {
  const all = useMemo(() => buildFranchiseStats(), []);
  const [sort, setSort] = useState("power");
  const sorted = [...all].sort((a, b) => {
    if (sort==="power") return powerScore(b)-powerScore(a);
    if (sort==="rings") return b.championships-a.championships||powerScore(b)-powerScore(a);
    if (sort==="wins")  return b.wins-a.wins;
    if (sort==="ppg")   return (b.pf/(b.wins+b.losses+b.ties||1))-(a.pf/(a.wins+a.losses+a.ties||1));
    return 0;
  });
  const maxScore = powerScore(sorted[0]);

  return (
    <div className="fade-in">
      <SectionHeader title="Franchises" sub="Every franchise, their numbers, and an honest assessment of what those numbers mean." />
      <div style={{ padding: "12px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["power","rings","wins","ppg"].map(s => <Btn key={s} active={sort===s} onClick={() => setSort(s)}>{s}</Btn>)}
      </div>

      {sorted.map((f, i) => {
        const tot = f.wins+f.losses+f.ties;
        const pct = tot?(f.wins/tot*100).toFixed(1):"0.0";
        const ppg = tot?(f.pf/tot).toFixed(1):"—";
        const score = powerScore(f);
        const champYears = SEASONS.filter(s => s.champion===f.id).map(s => s.year);
        const isTop = i === 0;
        return (
          <div key={f.id} style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 28px", background: isTop?`linear-gradient(90deg, ${C.goldDim} 0%, transparent 60%)`:"transparent" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                  <span style={{ fontFamily: mono, fontSize: 12, color: C.dim, fontWeight: 700 }}>#{i+1}</span>
                  <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 18, color: f.championships>0?C.gold:C.text }}>{f.id}</span>
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginBottom: 10 }}>{f.owner}</div>
                <div style={{ marginBottom: 10 }}><Bar value={score} max={maxScore+2} color={isTop?C.gold:C.accent} /></div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  <Tag color={C.muted}>{f.wins}-{f.losses}-{f.ties}</Tag>
                  <Tag color={parseFloat(pct)>=50?C.green:C.muted}>{pct}%</Tag>
                  <Tag color={C.muted}>{f.seasons} seasons</Tag>
                  <Tag color={C.muted}>{f.playoffApps} playoffs</Tag>
                  <Tag color={C.muted}>{ppg} PPG</Tag>
                  {f.runnerUp>0 && <Tag color={C.orange}>{f.runnerUp}× 2nd</Tag>}
                </div>
                {champYears.length>0 && <div style={{ marginTop: 10, fontFamily: mono, fontSize: 10, color: C.gold }}>🏆 {champYears.join(", ")}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 36, color: f.championships>0?C.gold:C.dim, lineHeight: 1 }}>{score}</div>
                <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, fontWeight: 700, marginTop: 3, letterSpacing: "0.1em" }}>POWER SCORE</div>
                {f.championships>0 && <div style={{ marginTop: 8, fontSize: 20 }}>{"🏆".repeat(f.championships)}</div>}
              </div>
            </div>
            {ROASTS[f.id] && (
              <div style={{
                marginTop: 14, padding: "12px 16px",
                borderLeft: `3px solid ${f.championships > 0 ? C.gold + "88" : C.borderHi}`,
                background: C.bg, borderRadius: "0 3px 3px 0",
              }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: f.championships > 0 ? C.gold : C.accent, fontWeight: 700, marginBottom: 5, letterSpacing: "0.08em" }}>
                  THE VERDICT
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: "#a09ac0", lineHeight: 1.7 }}>
                  {ROASTS[f.id].burn}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("power");
  const views = {
    power: <PowerRankings />, seasons: <Seasons />, standings: <AllTimeStandings />,
    playoffs: <PlayoffHistory />, trades: <TradeHistory />, draft: <DraftAnalysis />,
    franchises: <FranchisesView />,
  };
  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", color: C.text, fontFamily: sans }}>
      <GlobalStyles />
      <Nav active={active} setActive={setActive} />
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        {views[active] || null}
      </div>
    </div>
  );
}
Done
