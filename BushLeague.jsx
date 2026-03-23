import { useState, useMemo } from "react";
import { FRANCHISES, SEASONS, TRADES } from "./data.js";
import { DRAFTS } from "./drafts.js";

// ─────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────
const C = {
  bg:          "#0a0a0f",
  surface:     "#111118",
  card:        "#16161f",
  border:      "#1e1e2e",
  borderBright:"#2e2e44",
  text:        "#e8e6f0",
  muted:       "#6b6880",
  dim:         "#3d3a52",
  gold:        "#f5c842",
  green:       "#3ddc84",
  red:         "#ff4d6d",
  accent:      "#7c6cfc",
  orange:      "#ff8c42",
};

const sans = "'DM Sans', 'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', 'Fira Mono', monospace";

// ─────────────────────────────────────────────
// COMPUTED — all-time franchise stats
// ─────────────────────────────────────────────
function buildFranchiseStats() {
  const stats = {};
  FRANCHISES.forEach(f => {
    stats[f.id] = {
      id: f.id, owner: f.owner,
      wins: 0, losses: 0, ties: 0,
      pf: 0, pa: 0, seasons: 0,
      championships: 0, runnerUp: 0, third: 0,
      playoffApps: 0, playoffWins: 0,
      finishes: [],
    };
  });

  SEASONS.forEach(s => {
    if (s.champion) {
      const c = stats[s.champion]; if (c) c.championships++;
    }
    if (s.runnerUp) {
      const r = stats[s.runnerUp]; if (r) r.runnerUp++;
    }
    if (s.third) {
      const t = stats[s.third]; if (t) t.third++;
    }

    s.standings.forEach((row, i) => {
      const f = stats[row.franchise];
      if (!f) return;
      const [w, l, t] = row.rec.split("-").map(Number);
      f.wins += w; f.losses += l; f.ties += (t||0);
      f.pf += row.pf; f.pa += row.pa;
      f.seasons++;
      f.finishes.push({ year: s.year, rank: i + 1 });
    });

    s.playoffs?.forEach(p => {
      const f = stats[p.franchise];
      if (!f) return;
      f.playoffApps++;
    });
  });

  return Object.values(stats).filter(f => f.seasons > 0);
}

function winPct(f) {
  const tot = f.wins + f.losses + f.ties;
  return tot ? f.wins / tot : 0;
}

function powerScore(f) {
  const ppg = f.seasons ? f.pf / (f.wins + f.losses + f.ties) : 0;
  return Math.round(
    f.championships * 28 +
    winPct(f) * 40 +
    (f.seasons ? f.playoffApps / f.seasons : 0) * 18 +
    f.runnerUp * 6 +
    f.third * 3 +
    ppg * 0.05
  );
}

function avgFinish(f) {
  if (!f.finishes.length) return 0;
  return f.finishes.reduce((s, x) => s + x.rank, 0) / f.finishes.length;
}

// ─────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────
function Tag({ children, color = C.muted }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 10, fontWeight: 700,
      color, border: `1px solid ${color}44`,
      padding: "2px 8px", letterSpacing: "0.08em",
    }}>{children}</span>
  );
}

function Bar({ value, max, color = C.accent }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height: 3, backgroundColor: C.border, width: "100%" }}>
      <div style={{ height: 3, width: `${pct}%`, backgroundColor: color, transition: "width 0.4s" }} />
    </div>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ padding: "32px 24px 20px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 22, color: C.text, letterSpacing: "-0.02em" }}>
        {title}
      </div>
      {sub && <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginTop: 6, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function StatPill({ label, value, color = C.text }) {
  return (
    <div style={{ textAlign: "center", padding: "10px 16px", backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
      <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 18, color }}>{value}</div>
      <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, fontWeight: 700, marginTop: 2, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "power",     label: "Power Rankings" },
  { id: "seasons",   label: "Seasons"        },
  { id: "standings", label: "Standings"      },
  { id: "playoffs",  label: "Playoffs"       },
  { id: "trades",    label: "Trades"         },
  { id: "draft",     label: "Draft"          },
  { id: "franchises",label: "Franchises"     },
];

function Nav({ active, setActive }) {
  return (
    <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
        <div style={{ padding: "14px 24px", fontFamily: sans, fontWeight: 900, fontSize: 14, color: C.gold, letterSpacing: "0.05em", whiteSpace: "nowrap", borderRight: `1px solid ${C.border}` }}>
          🏈 BUSH LG
        </div>
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => setActive(n.id)} style={{
            background: "none", border: "none", borderBottom: `2px solid ${active === n.id ? C.accent : "transparent"}`,
            color: active === n.id ? C.text : C.muted,
            fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            padding: "14px 16px", cursor: "pointer", whiteSpace: "nowrap",
            transition: "color 0.15s",
          }}>{n.label}</button>
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

  return (
    <div>
      <SectionHeader title="Power Rankings"
        sub={`All-time. Weighted: championships (28 pts), win rate (40 pts), playoff rate (18 pts), runner-up (6 pts), 3rd place (3 pts). ${SEASONS.length} seasons of data.`} />
      {ranked.map((f, i) => {
        const score = powerScore(f);
        const pct = (winPct(f) * 100).toFixed(1);
        const rankColor = i === 0 ? C.gold : i < 3 ? C.accent : i < 6 ? C.text : C.muted;
        return (
          <div key={f.id} style={{ borderBottom: `1px solid ${C.border}`, padding: "18px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 28, color: i < 3 ? rankColor : C.dim, width: 36, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 15, color: C.text }}>{f.id}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, fontWeight: 600, marginTop: 2 }}>{f.owner.split("/")[0].trim()}</div>
                <div style={{ marginTop: 8 }}><Bar value={score} max={maxScore + 5} color={rankColor} /></div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <StatPill label="rings"    value={`${f.championships}×`} color={f.championships > 0 ? C.gold : C.dim} />
                <StatPill label="win%"     value={`${pct}%`} color={parseFloat(pct) >= 50 ? C.green : C.muted} />
                <StatPill label="playoffs" value={f.playoffApps} />
                <StatPill label="score"    value={score} color={rankColor} />
              </div>
            </div>
            {f.championships > 0 && (
              <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {Array.from({length: f.championships}).map((_, ci) => (
                  <Tag key={ci} color={C.gold}>CHAMP</Tag>
                ))}
                {f.runnerUp > 0 && <Tag color={C.orange}>{f.runnerUp}× Runner-Up</Tag>}
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
    <div>
      <SectionHeader title="Season History" sub="Year-by-year results, champions, and final standings." />
      {[...SEASONS].sort((a, b) => b.year - a.year).map(s => {
        const isOpen = expanded === s.year;
        const champ = FRANCHISES.find(f => f.id === s.champion);
        return (
          <div key={s.year} style={{ borderBottom: `1px solid ${C.border}` }}>
            <div onClick={() => setExpanded(isOpen ? null : s.year)}
              style={{ padding: "16px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 20, color: C.gold, width: 52 }}>{s.year}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: mono, fontSize: 10, color: C.gold, fontWeight: 700 }}>CHAMPION</span>
                  <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 14, color: C.text }}>{s.champion}</span>
                  {champ && <span style={{ fontFamily: mono, fontSize: 10, color: C.muted }}>({champ.owner.split("/")[0].trim()})</span>}
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 4 }}>
                  Runner-up: {s.runnerUp} · 3rd: {s.third}
                  {s.note && ` · ${s.note}`}
                </div>
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>{isOpen ? "▲" : "▼"}</div>
            </div>
            {isOpen && (
              <div style={{ backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, padding: "16px 24px" }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 10, letterSpacing: "0.1em" }}>
                  FINAL STANDINGS
                </div>
                {s.standings.map((row, i) => (
                  <div key={row.franchise} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "7px 0", borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{ width: 24, fontFamily: mono, fontSize: 12, fontWeight: 700,
                      color: i === 0 ? C.gold : i < 3 ? C.accent : C.dim }}>{i+1}</div>
                    <div style={{ flex: 1, fontFamily: sans, fontWeight: 700, fontSize: 13, color: C.text }}>{row.franchise}</div>
                    <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, width: 70, textAlign: "right" }}>{row.rec}</div>
                    <div style={{ fontFamily: mono, fontSize: 11, color: C.green, width: 70, textAlign: "right" }}>{row.pf.toFixed(1)}</div>
                    <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, width: 70, textAlign: "right" }}>{row.pa.toFixed(1)}</div>
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
    if (sort === "wins")    return b.wins - a.wins || winPct(b) - winPct(a);
    if (sort === "winpct")  return winPct(b) - winPct(a);
    if (sort === "pf")      return b.pf - a.pf;
    if (sort === "ppg")     return (b.pf / (b.wins+b.losses+b.ties||1)) - (a.pf / (a.wins+a.losses+a.ties||1));
    if (sort === "champs")  return b.championships - a.championships || winPct(b) - winPct(a);
    return 0;
  });

  const sorts = ["wins","winpct","pf","ppg","champs"];
  const sortLabel = { wins:"Wins", winpct:"Win%", pf:"Total PF", ppg:"PPG", champs:"Rings" };

  return (
    <div>
      <SectionHeader title="All-Time Standings" sub={`Cumulative records across all ${SEASONS.length} seasons.`} />
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {sorts.map(s => (
          <button key={s} onClick={() => setSort(s)} style={{
            background: sort === s ? C.accent + "22" : "none",
            border: `1px solid ${sort === s ? C.accent : C.border}`,
            color: sort === s ? C.accent : C.muted,
            fontFamily: mono, fontSize: 10, fontWeight: 700,
            padding: "5px 12px", cursor: "pointer", letterSpacing: "0.08em",
          }}>{sortLabel[s]}</button>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: C.surface }}>
              {["#","Team","Owner","W","L","T","Win%","PF","PA","PPG","Rings","R-Up","Playoffs","Seasons"].map(h => (
                <th key={h} style={{ fontFamily: mono, fontSize: 10, color: C.muted, fontWeight: 700,
                  padding: "10px 12px", textAlign: h === "Team" || h === "Owner" ? "left" : "right",
                  letterSpacing: "0.08em", whiteSpace: "nowrap", borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((f, i) => {
              const tot = f.wins + f.losses + f.ties;
              const ppg = tot ? (f.pf / tot).toFixed(1) : "—";
              const pct = (winPct(f) * 100).toFixed(1);
              return (
                <tr key={f.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.dim, padding: "10px 12px", textAlign: "right" }}>{i+1}</td>
                  <td style={{ fontFamily: sans, fontWeight: 900, fontSize: 13, color: C.text, padding: "10px 12px" }}>{f.id}</td>
                  <td style={{ fontFamily: mono, fontSize: 10, color: C.muted, padding: "10px 12px" }}>{f.owner.split("/")[0].trim()}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.green, padding: "10px 12px", textAlign: "right" }}>{f.wins}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.red,   padding: "10px 12px", textAlign: "right" }}>{f.losses}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.muted, padding: "10px 12px", textAlign: "right" }}>{f.ties}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: parseFloat(pct)>=50?C.green:C.muted, padding: "10px 12px", textAlign: "right" }}>{pct}%</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.text, padding: "10px 12px", textAlign: "right" }}>{f.pf.toFixed(0)}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.muted, padding: "10px 12px", textAlign: "right" }}>{f.pa.toFixed(0)}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.text, padding: "10px 12px", textAlign: "right" }}>{ppg}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: f.championships>0?C.gold:C.dim, padding: "10px 12px", textAlign: "right", fontWeight: 900 }}>{f.championships || "—"}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: f.runnerUp>0?C.orange:C.dim, padding: "10px 12px", textAlign: "right" }}>{f.runnerUp || "—"}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.text, padding: "10px 12px", textAlign: "right" }}>{f.playoffApps}</td>
                  <td style={{ fontFamily: mono, fontSize: 12, color: C.muted, padding: "10px 12px", textAlign: "right" }}>{f.seasons}</td>
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

  // Per-team playoff summary
  const teamPlayoffs = all.map(f => {
    const appearances = [];
    SEASONS.forEach(s => {
      const p = s.playoffs?.find(x => x.franchise === f.id);
      if (p) appearances.push({ year: s.year, seed: p.seed, finish: p.finish, champion: s.champion === f.id, runnerUp: s.runnerUp === f.id });
    });
    return { ...f, appearances, champCount: appearances.filter(a => a.champion).length };
  }).filter(f => f.appearances.length > 0)
    .sort((a, b) => b.champCount - a.champCount || b.appearances.length - a.appearances.length);

  return (
    <div>
      <SectionHeader title="Playoff History" sub="All-time playoff appearances, seeds, and finishes." />
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        {["table","bracket"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            background: view === v ? C.accent + "22" : "none",
            border: `1px solid ${view === v ? C.accent : C.border}`,
            color: view === v ? C.accent : C.muted,
            fontFamily: mono, fontSize: 10, fontWeight: 700,
            padding: "5px 12px", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase",
          }}>{v}</button>
        ))}
      </div>

      {view === "table" && (
        <div>
          {teamPlayoffs.map(f => (
            <div key={f.id} style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 14, color: C.text }}>{f.id}</span>
                  <span style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginLeft: 10 }}>{f.owner.split("/")[0].trim()}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Tag color={C.gold}>{f.champCount} ring{f.champCount !== 1 ? "s" : ""}</Tag>
                  <Tag color={C.muted}>{f.appearances.length} playoff apps</Tag>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {f.appearances.sort((a, b) => b.year - a.year).map(a => (
                  <div key={a.year} style={{
                    padding: "6px 10px", border: `1px solid ${a.champion ? C.gold : a.runnerUp ? C.orange : C.border}`,
                    backgroundColor: a.champion ? C.gold + "18" : a.runnerUp ? C.orange + "11" : C.surface,
                  }}>
                    <div style={{ fontFamily: mono, fontSize: 10, color: a.champion ? C.gold : a.runnerUp ? C.orange : C.muted, fontWeight: 700 }}>
                      {a.year}
                    </div>
                    <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 11, color: a.champion ? C.gold : C.text, marginTop: 1 }}>
                      {a.champion ? "🏆 CHAMP" : a.runnerUp ? "2nd" : `${a.finish}${["","st","nd","rd","th","th","th"][a.finish] || "th"}`}
                    </div>
                    <div style={{ fontFamily: mono, fontSize: 9, color: C.dim }}>Seed {a.seed}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "bracket" && (
        <div>
          {[...SEASONS].sort((a, b) => b.year - a.year).map(s => (
            <div key={s.year} style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 24px" }}>
              <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 16, color: C.gold, marginBottom: 10 }}>{s.year}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {s.playoffs?.sort((a, b) => a.finish - b.finish).map(p => (
                  <div key={p.franchise} style={{
                    padding: "8px 12px", border: `1px solid ${p.finish === 1 ? C.gold : p.finish === 2 ? C.orange : C.border}`,
                    backgroundColor: p.finish === 1 ? C.gold + "18" : C.surface,
                  }}>
                    <div style={{ fontFamily: mono, fontSize: 9, color: p.finish===1?C.gold:C.muted, fontWeight: 700 }}>
                      {p.finish === 1 ? "🏆 CHAMPION" : p.finish === 2 ? "RUNNER-UP" : p.finish === 3 ? "3RD PLACE" : `SEED ${p.seed}`}
                    </div>
                    <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 13, color: p.finish===1?C.gold:C.text, marginTop: 2 }}>
                      {p.franchise}
                    </div>
                  </div>
                ))}
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
  const filtered = filter === "all" ? TRADES : filter === "shame" ? TRADES.filter(t => t.shame) : TRADES.filter(t => t.year === parseInt(filter));
  const sorted = [...filtered].sort((a, b) => b.year - a.year || b.week - a.week);

  return (
    <div>
      <SectionHeader title="Trade History" sub="Verdicts rendered. Winners and losers on record." />
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["all", "shame", ...years.map(String)].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? C.accent + "22" : "none",
            border: `1px solid ${filter === f ? C.accent : C.border}`,
            color: filter === f ? C.accent : C.muted,
            fontFamily: mono, fontSize: 10, fontWeight: 700,
            padding: "5px 12px", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase",
          }}>{f === "shame" ? "🚨 Hall of Shame" : f}</button>
        ))}
      </div>
      {sorted.map(t => {
        const winnerSide = t.winner === t.sideA.franchise ? "A" : t.winner === t.sideB.franchise ? "B" : null;
        return (
          <div key={t.id} style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Tag color={C.muted}>{t.year} · Wk {t.week}</Tag>
                {t.shame && <Tag color={C.red}>🚨 SHAME TRADE</Tag>}
                {t.winner === "push" && <Tag color={C.orange}>PUSH</Tag>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "start" }}>
              {/* Side A */}
              <div style={{ padding: "12px 14px", backgroundColor: winnerSide === "A" ? C.green + "11" : C.surface, border: `1px solid ${winnerSide === "A" ? C.green : C.border}` }}>
                <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 13, color: winnerSide === "A" ? C.green : C.text, marginBottom: 6 }}>
                  {t.sideA.franchise} {winnerSide === "A" && "✓"}
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>GAVE</div>
                {t.sideA.gave.map(p => <div key={p} style={{ fontFamily: sans, fontSize: 12, color: C.red, fontWeight: 700 }}>↑ {p}</div>)}
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 8, marginBottom: 4 }}>RECEIVED</div>
                {t.sideA.received.map(p => <div key={p} style={{ fontFamily: sans, fontSize: 12, color: C.green, fontWeight: 700 }}>↓ {p}</div>)}
              </div>
              <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 18, color: C.dim, paddingTop: 12 }}>⇄</div>
              {/* Side B */}
              <div style={{ padding: "12px 14px", backgroundColor: winnerSide === "B" ? C.green + "11" : C.surface, border: `1px solid ${winnerSide === "B" ? C.green : C.border}` }}>
                <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 13, color: winnerSide === "B" ? C.green : C.text, marginBottom: 6 }}>
                  {t.sideB.franchise} {winnerSide === "B" && "✓"}
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>GAVE</div>
                {t.sideB.gave.map(p => <div key={p} style={{ fontFamily: sans, fontSize: 12, color: C.red, fontWeight: 700 }}>↑ {p}</div>)}
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 8, marginBottom: 4 }}>RECEIVED</div>
                {t.sideB.received.map(p => <div key={p} style={{ fontFamily: sans, fontSize: 12, color: C.green, fontWeight: 700 }}>↓ {p}</div>)}
              </div>
            </div>
            <div style={{ marginTop: 12, fontFamily: mono, fontSize: 12, color: "#c0bdd4", lineHeight: 1.7, padding: "12px 14px", borderLeft: `3px solid ${t.shame ? C.red : t.winner === "push" ? C.orange : C.accent}`, backgroundColor: C.bg }}>
              {t.verdict}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// DRAFT ANALYSIS
// ─────────────────────────────────────────────
function DraftAnalysis() {
  const [year, setYear] = useState(DRAFTS[DRAFTS.length - 1]?.year);
  const [view, setView] = useState("board");
  const draft = DRAFTS.find(d => d.year === year);

  const posColor = { RB: C.green, WR: C.accent, QB: C.gold, TE: C.orange, K: C.muted, DEF: C.muted };

  if (!draft) return <div style={{ padding: 24, color: C.muted }}>No draft data available.</div>;

  const rounds = draft.rounds || Math.max(...draft.picks.map(p => p.round));
  const franchises = [...new Set(draft.picks.map(p => p.franchise))].sort();

  // Build round-by-round grid
  const grid = {};
  draft.picks.forEach(p => {
    if (!grid[p.round]) grid[p.round] = {};
    grid[p.round][p.franchise] = p;
  });

  return (
    <div>
      <SectionHeader title="Draft Board" sub="Full pick-by-pick draft history from 2018–2025." />
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontFamily: mono, fontSize: 10, color: C.muted, fontWeight: 700, marginRight: 4 }}>YEAR</span>
        {DRAFTS.map(d => (
          <button key={d.year} onClick={() => setYear(d.year)} style={{
            background: year === d.year ? C.gold + "22" : "none",
            border: `1px solid ${year === d.year ? C.gold : C.border}`,
            color: year === d.year ? C.gold : C.muted,
            fontFamily: mono, fontSize: 10, fontWeight: 700,
            padding: "5px 12px", cursor: "pointer",
          }}>{d.year}{d.status === "incomplete" ? "*" : ""}</button>
        ))}
        <span style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginLeft: 4 }}>* incomplete</span>
      </div>
      <div style={{ padding: "8px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        {["board","list"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            background: view === v ? C.accent + "22" : "none",
            border: `1px solid ${view === v ? C.accent : C.border}`,
            color: view === v ? C.accent : C.muted,
            fontFamily: mono, fontSize: 10, fontWeight: 700,
            padding: "5px 12px", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase",
          }}>{v}</button>
        ))}
      </div>

      {view === "board" && (
        <div style={{ overflowX: "auto", padding: "16px 24px" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ fontFamily: mono, fontSize: 9, color: C.muted, padding: "6px 12px 6px 0", textAlign: "left", whiteSpace: "nowrap", minWidth: 50 }}>RND</th>
                {franchises.map(f => (
                  <th key={f} style={{ fontFamily: mono, fontSize: 9, color: C.muted, padding: "6px 8px", textAlign: "center", whiteSpace: "nowrap", minWidth: 100 }}>{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({length: rounds}, (_, ri) => ri + 1).map(r => (
                <tr key={r} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ fontFamily: mono, fontSize: 10, color: C.dim, padding: "6px 12px 6px 0", fontWeight: 700 }}>R{r}</td>
                  {franchises.map(f => {
                    const p = grid[r]?.[f];
                    if (!p) return <td key={f} style={{ padding: "4px 8px" }} />;
                    const col = posColor[p.pos] || C.muted;
                    return (
                      <td key={f} style={{ padding: "3px 8px", verticalAlign: "top" }}>
                        <div style={{
                          padding: "5px 7px",
                          backgroundColor: p.keeper ? C.gold + "12" : C.surface,
                          border: `1px solid ${p.keeper ? C.gold + "44" : C.border}`,
                        }}>
                          <div style={{ fontFamily: mono, fontSize: 9, color: col, fontWeight: 700, marginBottom: 1 }}>
                            {p.pos} {p.keeper ? "·K" : ""}
                          </div>
                          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 11, color: C.text, lineHeight: 1.3 }}>
                            {p.player.replace(/\(K\)/g, "").trim()}
                          </div>
                          <div style={{ fontFamily: mono, fontSize: 8, color: C.dim }}>#{p.overall}</div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "list" && (
        <div>
          {draft.picks.map(p => {
            const col = posColor[p.pos] || C.muted;
            return (
              <div key={p.overall} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 24px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.dim, width: 36, textAlign: "right" }}>#{p.overall}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, width: 28 }}>R{p.round}</div>
                <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: col, backgroundColor: col + "18", padding: "2px 6px", width: 36, textAlign: "center" }}>{p.pos}</span>
                <div style={{ flex: 1, fontFamily: sans, fontWeight: 700, fontSize: 13, color: C.text }}>
                  {p.player.replace(/\(K\)/g, "").trim()}
                  {p.keeper && <span style={{ marginLeft: 6, fontFamily: mono, fontSize: 9, color: C.gold }}>KEEPER</span>}
                </div>
                <div style={{ fontFamily: sans, fontSize: 12, color: C.muted, fontWeight: 600 }}>{p.franchise}</div>
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
    if (sort === "power")  return powerScore(b) - powerScore(a);
    if (sort === "rings")  return b.championships - a.championships || powerScore(b) - powerScore(a);
    if (sort === "wins")   return b.wins - a.wins;
    if (sort === "ppg")    return (b.pf/(b.wins+b.losses+b.ties||1)) - (a.pf/(a.wins+a.losses+a.ties||1));
    return 0;
  });

  return (
    <div>
      <SectionHeader title="Franchises" sub="All-time franchise profiles." />
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["power","rings","wins","ppg"].map(s => (
          <button key={s} onClick={() => setSort(s)} style={{
            background: sort === s ? C.accent + "22" : "none",
            border: `1px solid ${sort === s ? C.accent : C.border}`,
            color: sort === s ? C.accent : C.muted,
            fontFamily: mono, fontSize: 10, fontWeight: 700,
            padding: "5px 12px", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase",
          }}>{s}</button>
        ))}
      </div>
      {sorted.map((f, i) => {
        const tot = f.wins + f.losses + f.ties;
        const pct = tot ? (f.wins / tot * 100).toFixed(1) : "0.0";
        const ppg = tot ? (f.pf / tot).toFixed(1) : "—";
        const champYears = SEASONS.filter(s => s.champion === f.id).map(s => s.year);
        return (
          <div key={f.id} style={{ borderBottom: `1px solid ${C.border}`, padding: "18px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: mono, fontSize: 12, color: C.dim, fontWeight: 700 }}>#{i+1}</span>
                  <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 17, color: C.text }}>{f.id}</span>
                  {f.championships > 0 && <span style={{ fontSize: 16 }}>{"🏆".repeat(f.championships)}</span>}
                </div>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginTop: 4 }}>{f.owner}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  <Tag color={C.muted}>{f.wins}-{f.losses}-{f.ties} all-time</Tag>
                  <Tag color={parseFloat(pct)>=50?C.green:C.muted}>{pct}% win rate</Tag>
                  <Tag color={C.muted}>{f.seasons} seasons</Tag>
                  <Tag color={C.muted}>{f.playoffApps} playoff apps</Tag>
                  <Tag color={C.muted}>{ppg} PPG</Tag>
                  {f.runnerUp > 0 && <Tag color={C.orange}>{f.runnerUp}× runner-up</Tag>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 32, color: f.championships > 0 ? C.gold : C.dim, lineHeight: 1 }}>
                  {powerScore(f)}
                </div>
                <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, fontWeight: 700, marginTop: 2 }}>POWER SCORE</div>
              </div>
            </div>
            {champYears.length > 0 && (
              <div style={{ marginTop: 10, fontFamily: mono, fontSize: 10, color: C.gold }}>
                🏆 Champions: {champYears.join(", ")}
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
    power:      <PowerRankings />,
    seasons:    <Seasons />,
    standings:  <AllTimeStandings />,
    playoffs:   <PlayoffHistory />,
    trades:     <TradeHistory />,
    draft:      <DraftAnalysis />,
    franchises: <FranchisesView />,
  };

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", color: C.text, fontFamily: sans }}>
      <Nav active={active} setActive={setActive} />
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {views[active] || null}
      </div>
    </div>
  );
}
