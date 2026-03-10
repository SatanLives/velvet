import { useState, useEffect, useRef } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const VIDEOS = [
  { id: 1, title: "Late Night Drive", creator: "NightOwl Studios", duration: 30, emoji: "🌙", reward: 0.06, views: "241K", category: "Featured" },
  { id: 2, title: "Golden Hour", creator: "SolarFlare Media", duration: 45, emoji: "🌅", reward: 0.09, views: "88K", category: "Trending" },
  { id: 3, title: "Neon City", creator: "UrbanPulse", duration: 25, emoji: "🌆", reward: 0.05, views: "312K", category: "Featured" },
  { id: 4, title: "Deep Ocean", creator: "AquaVisions", duration: 60, emoji: "🌊", reward: 0.14, views: "52K", category: "Premium" },
  { id: 5, title: "Midnight Forest", creator: "WildLens Co.", duration: 40, emoji: "🌲", reward: 0.08, views: "129K", category: "Trending" },
  { id: 6, title: "Desert Storm", creator: "DriftCam", duration: 55, emoji: "🏜️", reward: 0.11, views: "74K", category: "Premium" },
];

const ACHIEVEMENTS = [
  { id: 1, icon: "✦", title: "First Reward", desc: "Received your first payout", unlocked: true },
  { id: 2, icon: "✦", title: "Regular Viewer", desc: "Watched content 3 sessions in a row", unlocked: true },
  { id: 3, icon: "✦", title: "$10 Milestone", desc: "Accumulated $10 in total rewards", unlocked: false },
  { id: 4, icon: "✦", title: "Top Viewer", desc: "Ranked in the top 10 this week", unlocked: false },
];

const LEADERBOARD = [
  { rank: 1, name: "Isabelle M.", earned: "$48.22", days: 14 },
  { rank: 2, name: "Sophia R.", earned: "$41.70", days: 9 },
  { rank: 3, name: "You", earned: "$12.47", days: 5, isUser: true },
  { rank: 4, name: "Camille T.", earned: "$9.88", days: 3 },
  { rank: 5, name: "Ava L.", earned: "$7.12", days: 2 },
];

const c = {
  bg: "#0d0508",
  card: "#180a0e",
  border: "#3a1020",
  accent: "#c0003c",
  accent2: "#8b0000",
  baby: "#6b0020",
  babyDark: "#4a0015",
  green: "#22d98a",
  text: "#f5e6ea",
  muted: "#7a4455",
};

const $ = (style) => style;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmt(n) { return `$${n.toFixed(2)}`; }

function Ring({ pct, size = 64, stroke = 5, color = c.accent }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
}

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────
function BottomNav({ page, setPage }) {
  if (page === "watch") return null;
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(13,5,8,0.97)", backdropFilter: "blur(24px)", borderTop: `1px solid ${c.border}`, display: "flex", padding: "12px 0 28px", zIndex: 100 }}>
      {[
        { id: "home", icon: "▶", label: "Browse" },
        { id: "social", icon: "✦", label: "Top Earners" },
        { id: "wallet", icon: "💳", label: "Wallet" },
        { id: "profile", icon: "◎", label: "Account" },
      ].map(tab => (
        <button key={tab.id} onClick={() => setPage(tab.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: page === tab.id ? 1 : 0.35, transition: "opacity 0.2s" }}>
          <span style={{ fontSize: 18 }}>{tab.icon}</span>
          <span style={{ fontSize: 10, color: page === tab.id ? c.accent : c.muted, fontFamily: "inherit", fontWeight: page === tab.id ? 700 : 400, letterSpacing: 0.5 }}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [balance, setBalance] = useState(12.47);
  const [totalEarned, setTotalEarned] = useState(12.47);
  const [streak, setStreak] = useState(5);
  const [watching, setWatching] = useState(null);
  const [watchProgress, setWatchProgress] = useState(0);
  const [justEarned, setJustEarned] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [txns, setTxns] = useState([
    { id: 1, label: "Viewed Deep Ocean", amt: 0.14, time: "4m ago", type: "earn" },
    { id: 2, label: "Referral credit — Sophia R.", amt: 0.50, time: "1h ago", type: "ref" },
    { id: 3, label: "Loyalty bonus (Day 5)", amt: 0.25, time: "Today", type: "bonus" },
    { id: 4, label: "Withdrawal via PayPal", amt: -5.00, time: "Yesterday", type: "out" },
  ]);
  const [cashAmt, setCashAmt] = useState("");
  const [cashDone, setCashDone] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const iRef = useRef(null);

  function startWatch(v) {
    setWatching(v);
    setWatchProgress(0);
    setJustEarned(null);
    setPage("watch");
  }

  useEffect(() => {
    if (page === "watch" && watching) {
      iRef.current = setInterval(() => {
        setWatchProgress(p => {
          const next = p + (100 / watching.duration) * 0.5;
          if (next >= 100) {
            clearInterval(iRef.current);
            setBalance(b => +(b + watching.reward).toFixed(2));
            setTotalEarned(b => +(b + watching.reward).toFixed(2));
            setJustEarned(watching.reward);
            setCompletedIds(ids => [...ids, watching.id]);
            setTxns(t => [{ id: Date.now(), label: `Viewed ${watching.title}`, amt: watching.reward, time: "Just now", type: "earn" }, ...t]);
            return 100;
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(iRef.current);
  }, [page, watching]);

  const categories = ["All", "Featured", "Trending", "Premium"];
  const filtered = activeCategory === "All" ? VIDEOS : VIDEOS.filter(v => v.category === activeCategory);

  // ── WATCH PAGE ──────────────────────────────────────────────────────────────
  if (page === "watch" && watching) return (
    <Shell>
      <BottomNav page={page} setPage={setPage} />
      <div style={{ padding: "56px 20px 20px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <BackBtn onClick={() => { clearInterval(iRef.current); setPage("home"); }} />

        {/* Video mock */}
        <div style={{ borderRadius: 24, background: "linear-gradient(135deg, #1a0a2e, #0d1a2e)", border: `1px solid ${c.border}`, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 60% 40%, rgba(255,61,110,0.12), transparent 60%)" }} />
          {watching.emoji}
          {watchProgress < 100 && (
            <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 99 }}>
              <div style={{ height: "100%", width: `${watchProgress}%`, background: `linear-gradient(90deg, ${c.accent}, ${c.accent2})`, borderRadius: 99, transition: "width 0.5s linear" }} />
            </div>
          )}
        </div>

        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{watching.title}</div>
        <div style={{ fontSize: 13, color: c.muted, marginBottom: 28 }}>by {watching.creator}</div>

        {watchProgress < 100 ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
              <Ring pct={watchProgress} size={96} stroke={7} color={c.accent} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier Prime', monospace", fontSize: 15, fontWeight: 700 }}>{Math.round(watchProgress)}%</div>
            </div>
            <div style={{ fontSize: 14, color: c.muted }}>Earn <span style={{ color: c.green, fontWeight: 700 }}>{fmt(watching.reward)}</span> when complete</div>
          </div>
        ) : (
          <div style={{ textAlign: "center", animation: "popIn 0.5s cubic-bezier(.34,1.56,.64,1)", padding: "20px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: c.green, marginBottom: 8 }}>+{fmt(justEarned)}</div>
            <div style={{ fontSize: 13, color: c.muted, marginBottom: 28 }}>Credited to your balance</div>
            <PillBtn onClick={() => setPage("home")}>Watch More →</PillBtn>
          </div>
        )}
      </div>
    </Shell>
  );

  // ── WALLET PAGE ─────────────────────────────────────────────────────────────
  if (page === "wallet") return (
    <Shell>
      <BottomNav page={page} setPage={setPage} />
      <div style={{ padding: "56px 20px 100px" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Wallet</div>

        {/* Balance card */}
        <div style={{ background: `linear-gradient(135deg, ${c.accent} 0%, #c2185b 50%, #6a1b9a 100%)`, borderRadius: 24, padding: 28, marginBottom: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ fontSize: 12, opacity: 0.8, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Available Balance</div>
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 48, fontWeight: 700 }}>{fmt(balance)}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>Total earned: {fmt(totalEarned)}</div>
        </div>

        {/* Cashout */}
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: c.muted, textTransform: "uppercase", letterSpacing: 1 }}>Withdraw</div>
          {cashDone ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ color: c.green, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>✓ Withdrawal Requested</div>
              <div style={{ fontSize: 12, color: c.muted }}>Arrives in 1–3 business days</div>
              <button onClick={() => setCashDone(false)} style={{ marginTop: 14, background: "none", border: `1px solid ${c.border}`, color: c.muted, borderRadius: 10, padding: "8px 18px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Withdraw Again</button>
            </div>
          ) : (
            <>
              <input type="number" placeholder="Amount (min $1.00)" value={cashAmt} onChange={e => setCashAmt(e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${c.border}`, borderRadius: 14, padding: "14px 16px", color: c.text, fontSize: 16, fontFamily: "'Courier Prime', monospace", outline: "none", marginBottom: 12 }} />
              <PillBtn full onClick={() => { if (parseFloat(cashAmt) >= 1 && parseFloat(cashAmt) <= balance) { setBalance(b => +(b - parseFloat(cashAmt)).toFixed(2)); setTxns(t => [{ id: Date.now(), label: "Cashout via PayPal", amt: -parseFloat(cashAmt), time: "Just now", type: "out" }, ...t]); setCashDone(true); setCashAmt(""); } }}>
                Withdraw via PayPal
              </PillBtn>
            </>
          )}
        </Card>

        {/* Transactions */}
        <div style={{ fontSize: 13, color: c.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>History</div>
        {txns.map(tx => (
          <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${c.border}` }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: tx.type === "earn" ? "rgba(34,217,138,0.12)" : tx.type === "out" ? "rgba(255,61,110,0.12)" : "rgba(245,200,66,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                {tx.type === "earn" ? "▶" : tx.type === "out" ? "↑" : "⭐"}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{tx.label}</div>
                <div style={{ fontSize: 11, color: c.muted, marginTop: 1 }}>{tx.time}</div>
              </div>
            </div>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700, color: tx.amt > 0 ? c.green : c.accent, fontSize: 14 }}>
              {tx.amt > 0 ? "+" : ""}{fmt(tx.amt)}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );

  // ── LEADERBOARD PAGE ────────────────────────────────────────────────────────
  if (page === "social") return (
    <Shell>
      <BottomNav page={page} setPage={setPage} />
      <div style={{ padding: "56px 20px 100px" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Top Earners</div>
        <div style={{ fontSize: 13, color: c.muted, marginBottom: 24 }}>Highest rewards this week</div>

        {/* Podium */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12, marginBottom: 28, height: 120 }}>
          {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((u, i) => {
            const heights = [80, 110, 65];
            const colors = ["#b0bec5", c.gold, "#cd7f32"];
            const ranks = [2, 1, 3];
            return (
              <div key={u.rank} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 11, color: c.muted, marginBottom: 4 }}>{u.name.length > 10 ? u.name.slice(0, 10) + "…" : u.name}</div>
                <div style={{ width: "100%", height: heights[i], background: u.isUser ? `linear-gradient(180deg, ${c.accent}, #c2185b)` : `rgba(255,255,255,0.06)`, borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", border: `1px solid ${u.isUser ? c.accent : c.border}` }}>
                  <div style={{ fontSize: 18, color: colors[i] }}>#{ranks[i]}</div>
                  <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: c.green, marginTop: 2 }}>{u.earned}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full list */}
        {LEADERBOARD.map(u => (
          <div key={u.rank} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 16, marginBottom: 10, background: u.isUser ? "rgba(255,61,110,0.1)" : c.card, border: `1px solid ${u.isUser ? c.accent : c.border}` }}>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700, color: u.rank <= 3 ? c.gold : c.muted, width: 24, textAlign: "center" }}>#{u.rank}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: u.isUser ? 700 : 500 }}>{u.name} {u.isUser && "← You"}</div>
              <div style={{ fontSize: 11, color: c.muted, marginTop: 2 }}>🌸 {u.days} days active</div>
            </div>
            <div style={{ fontFamily: "'Courier Prime', monospace", color: c.green, fontWeight: 700, fontSize: 14 }}>{u.earned}</div>
          </div>
        ))}

        {/* Referral */}
        <Card style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Invite & Earn</div>
          <div style={{ fontSize: 13, color: c.muted, marginBottom: 16, lineHeight: 1.6 }}>Invite someone and receive <span style={{ color: c.accent, fontWeight: 600 }}>$0.50</span> when they complete their first view.</div>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 16px", fontFamily: "'Courier Prime', monospace", fontSize: 13, color: c.accent, letterSpacing: 1, marginBottom: 12, textAlign: "center" }}>
            velvet.app/ref/USER8821
          </div>
          <PillBtn full onClick={() => {}}>Copy Referral Link</PillBtn>
        </Card>
      </div>
    </Shell>
  );

  // ── PROFILE PAGE ────────────────────────────────────────────────────────────
  if (page === "profile") return (
    <Shell>
      <BottomNav page={page} setPage={setPage} />
      <div style={{ padding: "56px 20px 100px" }}>
        {/* Avatar */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 12px", border: `3px solid ${c.accent}` }}>👤</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>You</div>
          <div style={{ fontSize: 13, color: c.muted }}>Member since March 2026</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1a0810", border: `1px solid ${c.border}`, borderRadius: 99, padding: "6px 14px", marginTop: 12 }}>
            <span>🌸</span><span style={{ fontSize: 13, color: c.accent, fontWeight: 600 }}>{streak} days active</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Earned", val: fmt(totalEarned), icon: "💰" },
            { label: "Videos Watched", val: completedIds.length + 28, icon: "▶️" },
            { label: "Referrals", val: "3", icon: "👥" },
            { label: "Rank", val: "#3", icon: "🏆" },
          ].map(s => (
            <Card key={s.label} style={{ textAlign: "center", padding: "18px 12px" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 20, fontWeight: 700 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: c.muted, marginTop: 2 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Achievements */}
        <div style={{ fontSize: 13, color: c.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Milestones</div>
        {ACHIEVEMENTS.map(a => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 16, marginBottom: 10, background: c.card, border: `1px solid ${a.unlocked ? c.border : "rgba(255,255,255,0.03)"}`, opacity: a.unlocked ? 1 : 0.45 }}>
            <div style={{ fontSize: 28 }}>{a.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>{a.desc}</div>
            </div>
            {a.unlocked && <div style={{ marginLeft: "auto", fontSize: 11, color: c.green, fontWeight: 600 }}>✓ Unlocked</div>}
          </div>
        ))}
      </div>
    </Shell>
  );

  // ── HOME PAGE ───────────────────────────────────────────────────────────────
  return (
    <Shell>
      <BottomNav page={page} setPage={setPage} />
      <div style={{ padding: "0 0 100px" }}>
        {/* Header */}
        <div style={{ padding: "52px 20px 20px", background: `linear-gradient(180deg, rgba(192,0,60,0.1) 0%, transparent 100%)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: c.accent, fontWeight: 700, marginBottom: 4 }}>Velvet</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>Browse.<br/>Enjoy.<br/>Get paid.</div>
            </div>
            <div onClick={() => setPage("wallet")} style={{ background: "rgba(34,217,138,0.1)", border: `1px solid rgba(34,217,138,0.25)`, borderRadius: 18, padding: "14px 18px", cursor: "pointer", textAlign: "right" }}>
              <div style={{ fontSize: 11, color: c.muted, marginBottom: 4 }}>Balance</div>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontWeight: 700, color: c.green, fontSize: 20 }}>{fmt(balance)}</div>
            </div>
          </div>

          {/* Loyalty banner */}
          <div style={{ background: "#1a0810", border: `1px solid ${c.border}`, borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
            <div style={{ fontSize: 28 }}>🌸</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.accent }}>Day {streak} — Loyalty Reward Active</div>
              <div style={{ fontSize: 11, color: c.muted, marginTop: 2 }}>View 2 more videos today for a +$0.25 loyalty bonus</div>
              <div style={{ height: 4, background: c.border, borderRadius: 99, marginTop: 8 }}>
                <div style={{ height: "100%", width: "60%", background: `linear-gradient(90deg, ${c.baby}, ${c.accent})`, borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div style={{ padding: "24px 20px 4px" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: c.muted, fontWeight: 600, marginBottom: 16 }}>How It Works</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { step: "01", icon: "▶", title: "Browse & View", desc: "Pick any video and watch it to completion" },
              { step: "02", icon: "💳", title: "Earn Cash", desc: "Rewards are credited to your balance instantly" },
              { step: "03", icon: "↑", title: "Withdraw", desc: "Cash out anytime via PayPal — no minimum wait" },
            ].map(s => (
              <div key={s.step} style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, padding: "16px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: c.accent, letterSpacing: 2, marginBottom: 10, fontFamily: "'Courier Prime', monospace" }}>{s.step}</div>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: c.text, marginBottom: 5 }}>{s.title}</div>
                <div style={{ fontSize: 10, color: c.muted, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div style={{ display: "flex", gap: 8, padding: "16px 20px", overflowX: "auto" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ flexShrink: 0, padding: "8px 18px", borderRadius: 99, border: `1px solid ${activeCategory === cat ? c.accent : c.border}`, background: activeCategory === cat ? `rgba(255,61,110,0.15)` : "transparent", color: activeCategory === cat ? c.accent : c.muted, fontSize: 13, fontFamily: "inherit", cursor: "pointer", fontWeight: activeCategory === cat ? 600 : 400, transition: "all 0.2s" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Video grid */}
        <div style={{ padding: "0 20px" }}>
          {filtered.map((v, i) => {
            const done = completedIds.includes(v.id);
            return (
              <div key={v.id} onClick={() => !done && startWatch(v)}
                style={{ display: "flex", gap: 14, alignItems: "center", padding: "16px 18px", borderRadius: 20, marginBottom: 12, background: c.card, border: `1px solid ${done ? "rgba(34,217,138,0.2)" : c.border}`, cursor: done ? "default" : "pointer", opacity: done ? 0.6 : 1, transition: "all 0.2s", animationDelay: `${i * 0.07}s` }}
                onMouseEnter={e => { if (!done) { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.borderColor = c.accent; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.borderColor = done ? "rgba(34,217,138,0.2)" : c.border; }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,61,110,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, border: `1px solid rgba(255,61,110,0.15)` }}>
                  {v.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{v.title}</div>
                  <div style={{ fontSize: 12, color: c.muted }}>{v.creator} · {v.duration}s · {v.views} views</div>
                  <div style={{ display: "inline-block", fontSize: 10, padding: "2px 8px", borderRadius: 99, background: v.category === "Premium" ? "rgba(155,93,229,0.15)" : "rgba(255,140,66,0.12)", color: v.category === "Premium" ? c.purple : c.accent2, marginTop: 5, fontWeight: 600 }}>{v.category}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {done ? (
                    <div style={{ fontSize: 11, color: c.green, fontWeight: 700 }}>✓ Earned<br />{fmt(v.reward)}</div>
                  ) : (
                    <>
                      <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 16, fontWeight: 700, color: c.accent }}>+{fmt(v.reward)}</div>
                      <div style={{ fontSize: 10, color: c.muted, marginTop: 2 }}>tap to view</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </Shell>
  );
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function Shell({ children }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: c.bg, minHeight: "100vh", color: c.text, maxWidth: 430, margin: "0 auto", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Courier+Prime:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        input::placeholder { color: #4a2030; }
        input:focus { border-color: ${c.accent} !important; outline: none; }
        @keyframes popIn { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      <div style={{ position: "fixed", top: -120, right: -80, width: 340, height: 340, borderRadius: "50%", background: `radial-gradient(circle, rgba(192,0,60,0.18), transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -100, left: -60, width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle, rgba(139,0,0,0.15), transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 20, padding: 20, boxShadow: "0 2px 20px rgba(0,0,0,0.4)", ...style }}>{children}</div>;
}

function PillBtn({ children, onClick, full }) {
  return (
    <button onClick={onClick} style={{ width: full ? "100%" : "auto", background: `linear-gradient(135deg, ${c.accent}, #c2185b)`, border: "none", borderRadius: 14, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, padding: "14px 28px", cursor: "pointer", transition: "all 0.2s", letterSpacing: 0.3 }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
      {children}
    </button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, color: c.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13, padding: "8px 16px", cursor: "pointer", marginBottom: 24 }}>← Back</button>
  );
}
