export const gs = {
  page:         { minHeight: '100vh', background: 'var(--fm-bg-page)', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 40px' },
  progressTrack:{ width: '100%', height: 4, background: 'var(--fm-border)', flexShrink: 0 },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#f97316,#fb923c)', transition: 'width 0.6s ease', borderRadius: '0 4px 4px 0' },
  header:       { width: '100%', maxWidth: 920, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' },
  headerLeft:   { display: 'flex', alignItems: 'center', gap: 12 },
  title:        { fontSize: 22, fontWeight: 700, color: 'var(--fm-text-1)', letterSpacing: '-0.02em' },
  subtitle:     { fontSize: 12, color: 'var(--fm-text-3)', marginTop: 2 },
  headerRight:  { display: 'flex', gap: 8, alignItems: 'center' },
  pill:         { background: 'var(--fm-bg-pill)', border: '1px solid var(--fm-border-2)', borderRadius: 5, padding: '5px 14px', fontSize: 13, color: 'var(--fm-text-2)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 },
  menuBtn:      { background: 'var(--fm-bg-pill)', border: '1px solid var(--fm-border-2)', borderRadius: 5, padding: '5px 12px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', color: 'var(--fm-text-3)', cursor: 'pointer' },
  autoBtnOn:    { background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', color: '#22c55e' },
  instructions: { fontSize: 13, color: 'var(--fm-text-4)', margin: '16px 0 20px', textAlign: 'center', lineHeight: 1.8 },
  kbd:          { background: 'var(--fm-bg-pill)', border: '1px solid var(--fm-border-2)', borderRadius: 4, padding: '1px 7px', fontSize: 11, fontFamily: 'monospace', color: 'var(--fm-text-2)', margin: '0 3px' },

  // ── Board grid ────────────────────────────────────────────────────────────
  // 3-column grid: [EN cards] [56px arrow] [FR cards]
  // Each row auto-sizes to the tallest cell → both sides stay equal height.
  board: {
    display: 'grid',
    gridTemplateColumns: '1fr 56px 1fr',
    rowGap: 10,
    columnGap: 24,
    position: 'relative',       // anchor for the SVG overlay
    width: '100%',
    maxWidth: 920,
    padding: '0 16px',
  },
  colHeader: {
    textAlign: 'center', fontSize: 11, fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  arrowCell: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  arrow:      { fontSize: 18, color: '#fb923c', fontWeight: 300 },

  // ── Card inner layout helpers ─────────────────────────────────────────────
  activeDot:    { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#fb923c', boxShadow: '0 0 8px #fb923c' },
  wordText:     { flex: 1, textAlign: 'center', lineHeight: 1.3 },
  frCardInner:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 },
  exampleText:  { fontSize: 12, color: '#86efac', opacity: 0.9, fontStyle: 'italic', fontWeight: 400, lineHeight: 1.5, textAlign: 'center', maxWidth: '100%', borderTop: '1px solid rgba(134,239,172,0.2)', paddingTop: 6, marginTop: 2 },
  keyHint:      { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: 'var(--fm-text-4)', background: 'var(--fm-bg-input)', border: '1px solid var(--fm-border)', borderRadius: 4, padding: '1px 5px', lineHeight: 1.4 },
  checkMark:    { position: 'absolute', right: 10, top: 12, fontSize: 14, fontWeight: 700 },
  speakerBtn:   { position: 'absolute', right: 10, fontSize: 13, cursor: 'pointer', opacity: 0.7 },

  // ── Other screens ─────────────────────────────────────────────────────────
  roundBanner:  { position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'rgba(249,115,22,0.95)', color: '#fff', borderRadius: 6, padding: '10px 28px', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 32px rgba(249,115,22,0.4)', letterSpacing: '0.01em', whiteSpace: 'nowrap' },
  doneCard:     { background: 'var(--fm-bg-card)', border: '1px solid var(--fm-border)', borderRadius: 16, padding: 48, textAlign: 'center', maxWidth: 440, margin: 'auto' },
  statRow:      { display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 32 },
  stat:         { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  statNum:      { fontSize: 32, fontWeight: 700, color: 'var(--fm-text-1)' },
  statLabel:    { fontSize: 12, color: 'var(--fm-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  restartBtn:   { background: 'linear-gradient(135deg,#f97316,#fb923c)', color: '#fff', border: 'none', borderRadius: 5, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  secondaryBtn: { background: 'var(--fm-bg-pill)', color: 'var(--fm-text-2)', border: '1px solid var(--fm-border-2)', borderRadius: 5, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
};

// Cards are direct grid cells — height is controlled by the grid row.
export function enCardStyle(isActive, isMatched) {
  const base = {
    position: 'relative', display: 'flex', alignItems: 'center',
    width: '100%', minHeight: 64, padding: '12px 36px 12px 28px',
    borderRadius: 6, border: '2px solid transparent',
    fontSize: 15, fontWeight: 500, textAlign: 'left',
    transition: 'all 0.2s ease', letterSpacing: '0.01em',
  };
  if (isMatched) return { ...base, background: 'rgba(20,83,45,0.5)', border: '2px solid #22c55e', color: '#86efac' };
  if (isActive)  return { ...base, background: 'rgba(251,146,60,0.12)', border: '2px solid #fb923c', color: '#fed7aa', animation: 'pulse-glow 2s ease-in-out infinite', fontWeight: 600 };
  return { ...base, background: 'var(--fm-bg-encard)', border: '2px solid var(--fm-border)', color: 'var(--fm-text-dim)' };
}

export function frCardStyle(isMatched, isWrong) {
  const base = {
    position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100%', minHeight: 64, padding: '12px 36px',
    borderRadius: 6, border: '2px solid transparent',
    cursor: isMatched ? 'default' : 'pointer',
    fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
    textAlign: 'center', outline: 'none', letterSpacing: '0.01em',
  };
  if (isMatched) return { ...base, background: 'rgba(20,83,45,0.5)', border: '2px solid #22c55e', color: '#86efac', alignItems: 'flex-start', paddingTop: 14 };
  if (isWrong)   return { ...base, background: 'rgba(127,29,29,0.85)', border: '2px solid #ef4444', color: '#fca5a5', animation: 'shake 0.35s ease' };
  return { ...base, background: 'var(--fm-bg-frcard)', border: '2px solid var(--fm-border-2)', color: 'var(--fm-text-1)' };
}
