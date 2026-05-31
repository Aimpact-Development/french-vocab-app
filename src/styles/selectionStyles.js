export const ss = {
  page: {
    minHeight: '100vh',
    background: 'var(--fm-bg-page)',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '32px 16px',
  },
  card: {
    background: 'var(--fm-bg-card)',
    border: '1px solid var(--fm-border)',
    borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 640,
  },
  logoRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 28,
  },
  logoLeft:  { display: 'flex', alignItems: 'center', gap: 14 },
  title:     { fontSize: 24, fontWeight: 700, color: 'var(--fm-text-1)', letterSpacing: '-0.02em' },
  subtitle:  { fontSize: 13, color: 'var(--fm-text-3)', marginTop: 2 },
  skinBtn: {
    background: 'var(--fm-bg-pill)', border: '1px solid var(--fm-border-2)',
    borderRadius: 5, padding: '6px 12px', fontSize: 16,
    cursor: 'pointer', color: 'var(--fm-text-2)', fontFamily: 'inherit',
  },
  sectionLabel: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--fm-text-4)', marginBottom: 10,
  },
  toggleAll: {
    background: 'none', border: 'none', color: '#4f6eff',
    fontSize: 11, cursor: 'pointer', padding: 0,
    fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2,
  },
  typeToggle: {
    display: 'flex', background: 'var(--fm-bg-input)',
    borderRadius: 6, padding: 3, gap: 3, marginBottom: 24,
  },
  typeBtn: (on) => ({
    flex: 1, padding: '9px 16px', borderRadius: 5, border: 'none',
    background: on ? '#3b82f6' : 'transparent',
    color: on ? '#fff' : 'var(--fm-text-3)',
    fontWeight: on ? 700 : 500, fontSize: 13,
    cursor: 'pointer', fontFamily: 'inherit',
  }),
  grid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: (on, color) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 5,
    border: `2px solid ${on ? color : 'var(--fm-border)'}`,
    background: on ? color : 'var(--fm-bg-chip)',
    cursor: 'pointer',
  }),
  chipDot: (on, color) => ({
    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
    background: on ? 'rgba(255,255,255,0.7)' : color,
  }),
  chipLabel: (on) => ({
    fontSize: 13, fontWeight: 500,
    color: on ? '#fff' : 'var(--fm-text-chip)',
  }),
  chipCount: (on) => ({
    fontSize: 11, fontWeight: 600, borderRadius: 3, padding: '1px 6px',
    background: on ? 'rgba(255,255,255,0.25)' : 'var(--fm-bg-pill)',
    color: on ? 'rgba(255,255,255,0.95)' : 'var(--fm-text-4)',
  }),
  footer:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 },
  startBtn: (enabled) => ({
    background: enabled ? 'linear-gradient(135deg, #f97316, #fb923c)' : 'var(--fm-bg-pill)',
    color: enabled ? '#fff' : 'var(--fm-text-4)',
    border: 'none', borderRadius: 5, padding: '12px 28px',
    fontSize: 14, fontWeight: 600,
    cursor: enabled ? 'pointer' : 'not-allowed', letterSpacing: '0.01em',
  }),
  warn: { textAlign: 'center', fontSize: 12, color: '#ef4444', marginTop: 10 },
  limitInput: {
    width: 72, padding: '6px 10px',
    background: 'var(--fm-bg-input)', border: '1.5px solid var(--fm-border-2)',
    borderRadius: 4, color: 'var(--fm-text-1)', fontSize: 15,
    fontWeight: 600, fontFamily: 'inherit', outline: 'none', textAlign: 'center',
  },
};
