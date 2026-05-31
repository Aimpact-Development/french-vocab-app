import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

async function loadVocab() {
  const res = await fetch('/vocab.csv');
  const buf = await res.arrayBuffer();
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    text = new TextDecoder('windows-1252').decode(buf);
  }
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  return parseCSV(text);
}

// Used when loading old-format CSVs (no CEFR_level column) to auto-assign CEFR by topic
const TOPIC_CEFR = {
  "People & Family": "A1", "Daily Verbs": "A1", "Home": "A1",
  "Food & Drink": "A1", "Time": "A1", "Adjectives": "A1", "Common Phrases": "A1",
  "Travel & City": "A2", "Work & Study": "A2", "Health & Body": "A2",
  "Weather & Nature": "A2", "Connectors": "A2", "Shopping & Money": "A2",
  "Emotions & Opinions": "B1", "Technology": "B1",
  "Business Terminology": "B2",
};

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const header = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
  const isNewFormat = header[0] === 'cefr_level';
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const cols = parseCsvLine(line);
    if (isNewFormat) {
      return {
        cefr:         cols[0]?.trim() || 'A1',
        type:         cols[1]?.trim() || 'W',
        topic:        cols[2]?.trim() || '',
        grammar_type: cols[3]?.trim() || '',
        english:      cols[4]?.trim() || '',
        french:       cols[5]?.trim() || '',
        example:      cols.slice(6).join(',').trim(),
      };
    }
    const topic = cols[0]?.trim() || '';
    return {
      cefr:         TOPIC_CEFR[topic] || 'A1',
      type:         'W',
      topic,
      grammar_type: cols[1]?.trim() || '',
      english:      cols[2]?.trim() || '',
      french:       cols[3]?.trim() || '',
      example:      cols.slice(4).join(',').trim(),
    };
  });
}

function parseCsvLine(line) {
  const cols = [];
  let inQuote = false, cur = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuote = !inQuote; }
    else if (ch === ',' && !inQuote) { cols.push(cur); cur = ''; }
    else { cur += ch; }
  }
  cols.push(cur);
  return cols.map(c => c.trim());
}

const ROUND_SIZE = 6;
const MAX_WORDS  = 300;
const FR_KEYS = ['1', '2', '3', '4', '5', '6'];

const CEFR_META = [
  { code: 'A1',  label: 'A1 · Essentials',        color: '#22c55e' },
  { code: 'A2',  label: 'A2 · Daily Life',          color: '#06b6d4' },
  { code: 'B1',  label: 'B1 · Conversation',        color: '#3b82f6' },
  { code: 'B2',  label: 'B2 · Flexible French',     color: '#8b5cf6' },
  { code: 'C1+', label: 'C1+ · Advanced',           color: '#f97316' },
];

const TOPIC_COLORS = {
  "People & Family": "#6366f1",
  "Daily Verbs": "#f59e0b",
  "Home": "#10b981",
  "Food & Drink": "#ef4444",
  "Travel & City": "#3b82f6",
  "Time": "#8b5cf6",
  "Work & Study": "#06b6d4",
  "Health & Body": "#f97316",
  "Weather & Nature": "#22c55e",
  "Adjectives": "#e879f9",
  "Connectors": "#94a3b8",
  "Shopping & Money": "#f43f5e",
  "Emotions & Opinions": "#a78bfa",
  "Technology": "#38bdf8",
  "Common Phrases": "#fb923c",
  "Business Terminology": "#f59e0b",
};

const GRAMMAR_COLORS = {
  "noun": "#60a5fa",
  "verb": "#f59e0b",
  "adjective": "#e879f9",
  "adverb": "#34d399",
  "conjunction": "#94a3b8",
  "preposition": "#fb923c",
  "phrase": "#a78bfa",
};

function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR'; u.rate = 0.82;
  window.speechSynthesis.speak(u);
}

function speakEn(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DEFAULT_LIMIT = 30;

// ── Selection screen ──────────────────────────────────────────────────────────
function SelectionScreen({ onStart, vocab }) {
  const [wordLimit, setWordLimit] = useState(DEFAULT_LIMIT);
  const [contentType, setContentType] = useState('W');

  // Only show CEFR levels that actually exist in the vocab data
  const availCefr = useMemo(() => {
    const present = new Set(vocab.map(w => w.cefr));
    return CEFR_META.filter(m => present.has(m.code));
  }, [vocab]);

  const [selCefr, setSelCefr] = useState(() => new Set(CEFR_META.map(m => m.code)));

  // Topics and grammar derived from vocab filtered by CEFR + content type
  const allTopics = useMemo(() => {
    const map = {};
    vocab
      .filter(w => selCefr.has(w.cefr) && w.type === contentType)
      .forEach(w => { map[w.topic] = (map[w.topic] || 0) + 1; });
    return map;
  }, [vocab, selCefr, contentType]);

  const allGrammar = useMemo(() => {
    const map = {};
    vocab
      .filter(w => selCefr.has(w.cefr) && w.type === contentType)
      .forEach(w => { map[w.grammar_type] = (map[w.grammar_type] || 0) + 1; });
    return map;
  }, [vocab, selCefr, contentType]);

  const [selTopics, setSelTopics]   = useState(() => new Set(Object.keys(allTopics)));
  const [selGrammar, setSelGrammar] = useState(() => new Set(Object.keys(allGrammar)));

  // Reset topic / grammar selections whenever the available set changes
  // (triggered by switching content type or CEFR level)
  useEffect(() => { setSelTopics(new Set(Object.keys(allTopics)));   }, [allTopics]);
  useEffect(() => { setSelGrammar(new Set(Object.keys(allGrammar))); }, [allGrammar]);

  const filteredCount = useMemo(() =>
    vocab.filter(w =>
      selCefr.has(w.cefr) &&
      w.type === contentType &&
      selTopics.has(w.topic) &&
      selGrammar.has(w.grammar_type)
    ).length,
    [vocab, selCefr, contentType, selTopics, selGrammar]
  );

  function toggleCefr(code) {
    setSelCefr(prev => { const n = new Set(prev); n.has(code) ? n.delete(code) : n.add(code); return n; });
  }
  function toggleTopic(t) {
    setSelTopics(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  }
  function toggleGrammar(g) {
    setSelGrammar(prev => { const n = new Set(prev); n.has(g) ? n.delete(g) : n.add(g); return n; });
  }

  const itemLabel = contentType === 'S' ? 'sentences' : 'words';

  return (
    <div style={ss.page}>
      <div style={ss.card}>

        {/* Header */}
        <div style={ss.logoRow}>
          <img src="/favicon.svg" alt="Aimpact" style={{ width: 42, height: 42 }} />
          <div>
            <div style={ss.title}>French Match</div>
            <div style={ss.subtitle}>Choose what to practise</div>
          </div>
        </div>

        {/* ── CEFR Level ── */}
        <div style={ss.sectionLabel}>
          <span>CEFR Level</span>
          <button style={ss.toggleAll} onClick={() =>
            setSelCefr(prev =>
              prev.size === availCefr.length ? new Set() : new Set(availCefr.map(m => m.code))
            )
          }>
            {selCefr.size === availCefr.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div style={{ ...ss.grid, marginBottom: 20 }}>
          {availCefr.map(({ code, label, color }) => {
            const on = selCefr.has(code);
            return (
              <label key={code} style={ss.chip(on, color)} className="btn3d">
                <input type="checkbox" checked={on} onChange={() => toggleCefr(code)} style={{ display: 'none' }} />
                <span style={ss.chipDot(color)} />
                <span style={ss.chipLabel}>{label}</span>
              </label>
            );
          })}
        </div>

        {/* ── Content Type ── */}
        <div style={ss.sectionLabel}><span>Content Type</span></div>
        <div style={ss.typeToggle}>
          {[{ code: 'W', label: 'Words & Phrases' }, { code: 'S', label: 'Sentences' }].map(({ code, label }) => (
            <button key={code} style={ss.typeBtn(contentType === code)} className="btn3d" onClick={() => setContentType(code)}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Topic ── */}
        <div style={ss.sectionLabel}>
          <span>Topic</span>
          <button style={ss.toggleAll} onClick={() =>
            setSelTopics(prev =>
              prev.size === Object.keys(allTopics).length ? new Set() : new Set(Object.keys(allTopics))
            )
          }>
            {selTopics.size === Object.keys(allTopics).length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div style={ss.grid}>
          {Object.keys(allTopics).length === 0
            ? <span style={{ fontSize: 13, color: '#475569' }}>No {itemLabel} available for this selection.</span>
            : Object.entries(allTopics).map(([topic, count]) => {
                const on = selTopics.has(topic);
                const color = TOPIC_COLORS[topic] || '#64748b';
                return (
                  <label key={topic} style={ss.chip(on, color)} className="btn3d">
                    <input type="checkbox" checked={on} onChange={() => toggleTopic(topic)} style={{ display: 'none' }} />
                    <span style={ss.chipDot(color)} />
                    <span style={ss.chipLabel}>{topic}</span>
                    <span style={ss.chipCount}>{count}</span>
                  </label>
                );
              })
          }
        </div>

        {/* ── Grammar type ── */}
        <div style={{ ...ss.sectionLabel, marginTop: 20 }}>
          <span>Grammar type</span>
          <button style={ss.toggleAll} onClick={() =>
            setSelGrammar(prev =>
              prev.size === Object.keys(allGrammar).length ? new Set() : new Set(Object.keys(allGrammar))
            )
          }>
            {selGrammar.size === Object.keys(allGrammar).length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div style={ss.grid}>
          {Object.entries(allGrammar).map(([g, count]) => {
            const on = selGrammar.has(g);
            const color = GRAMMAR_COLORS[g] || '#64748b';
            return (
              <label key={g} style={ss.chip(on, color)} className="btn3d">
                <input type="checkbox" checked={on} onChange={() => toggleGrammar(g)} style={{ display: 'none' }} />
                <span style={ss.chipDot(color)} />
                <span style={ss.chipLabel}>{g}</span>
                <span style={ss.chipCount}>{count}</span>
              </label>
            );
          })}
        </div>

        {/* ── Word limit ── */}
        <div style={{ ...ss.sectionLabel, marginTop: 24 }}>
          <span>Max {itemLabel} per session</span>
          <span style={{ color: '#ef4444', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>HARD LIMIT: 300</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <input
            type="number" min={ROUND_SIZE} max={MAX_WORDS} value={wordLimit}
            onChange={e => setWordLimit(Math.min(MAX_WORDS, Math.max(ROUND_SIZE, parseInt(e.target.value) || DEFAULT_LIMIT)))}
            style={ss.limitInput}
          />
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {filteredCount > wordLimit
              ? `${filteredCount} available — will play ${Math.min(wordLimit, MAX_WORDS)}`
              : `${filteredCount} ${itemLabel} will be played`}
          </span>
        </div>

        <div style={ss.footer}>
          <span style={ss.wordCount} />
          <button
            style={ss.startBtn(filteredCount >= ROUND_SIZE)}
            className="btn3d"
            disabled={filteredCount < ROUND_SIZE}
            onClick={() => onStart(selCefr, contentType, selTopics, selGrammar, wordLimit)}
          >
            Start Game →
          </button>
        </div>
        {filteredCount > 0 && filteredCount < ROUND_SIZE && (
          <div style={ss.warn}>Select at least {ROUND_SIZE} {itemLabel} to play.</div>
        )}
      </div>
    </div>
  );
}

const ss = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 100%)',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
  },
  card: {
    background: '#111827',
    border: '1px solid #1e293b',
    borderRadius: 20,
    padding: '36px 32px',
    width: '100%',
    maxWidth: 640,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
  },
  title:    { fontSize: 24, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  sectionLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#475569',
    marginBottom: 10,
  },
  toggleAll: {
    background: 'none', border: 'none', color: '#4f6eff',
    fontSize: 11, cursor: 'pointer', padding: 0,
    fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2,
  },
  typeToggle: {
    display: 'flex',
    background: '#0f172a',
    borderRadius: 6,
    padding: 3,
    gap: 3,
    marginBottom: 24,
  },
  typeBtn: (on) => ({
    flex: 1,
    padding: '9px 16px',
    borderRadius: 5,
    border: on ? '1.5px solid #3b82f6' : '1.5px solid #1e293b',
    background: on ? 'rgba(59,130,246,0.18)' : '#1a2234',
    color: on ? '#60a5fa' : '#475569',
    fontWeight: on ? 700 : 500,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: on ? '0 4px 0 #1e3a5f' : '0 4px 0 rgba(0,0,0,0.5)',
  }),
  grid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: (on, color) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 5,
    border: `1.5px solid ${on ? color : '#1e293b'}`,
    background: on ? `${color}18` : '#0f172a',
    cursor: 'pointer', userSelect: 'none',
    boxShadow: on ? `0 4px 0 ${color}55` : '0 4px 0 rgba(0,0,0,0.45)',
  }),
  chipDot:   (color) => ({ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }),
  chipLabel: { fontSize: 13, color: '#cbd5e1', fontWeight: 500 },
  chipCount: {
    fontSize: 11, color: '#475569', fontWeight: 600,
    background: '#1e293b', borderRadius: 3, padding: '1px 6px',
  },
  footer:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 },
  wordCount: { fontSize: 13, color: '#475569', fontWeight: 500 },
  startBtn:  (enabled) => ({
    background: enabled ? 'linear-gradient(135deg, #f97316, #fb923c)' : '#1e293b',
    color: enabled ? '#fff' : '#334155',
    border: 'none', borderRadius: 5, padding: '12px 28px',
    fontSize: 14, fontWeight: 600,
    cursor: enabled ? 'pointer' : 'not-allowed',
    letterSpacing: '0.01em',
    boxShadow: enabled ? '0 5px 0 #b45309' : 'none',
  }),
  warn: { textAlign: 'center', fontSize: 12, color: '#ef4444', marginTop: 10 },
  limitInput: {
    width: 72, padding: '6px 10px',
    background: '#0f172a', border: '1.5px solid #334155',
    borderRadius: 4, color: '#f1f5f9', fontSize: 15,
    fontWeight: 600, fontFamily: 'inherit', outline: 'none', textAlign: 'center',
  },
};

// ── Main game ─────────────────────────────────────────────────────────────────
export default function FrenchMatchGame() {
  const [vocab, setVocab] = useState(null);

  useEffect(() => {
    loadVocab().then(setVocab);
  }, []);

  const [screen, setScreen]           = useState('select');
  const [activeVocab, setActiveVocab] = useState([]);

  const questionStartRef = useRef(null);
  const [responseTimes, setResponseTimes] = useState([]);

  const [usedIds, setUsedIds]         = useState(new Set());
  const [roundWords, setRoundWords]   = useState([]);
  const [frOrder, setFrOrder]         = useState([]);
  const [enOrder, setEnOrder]         = useState([]);
  const [activeEnSlot, setActiveEnSlot] = useState(0);
  const [matched, setMatched]         = useState(new Set());
  const [wrongFrSlot, setWrongFrSlot] = useState(null);
  const [score, setScore]             = useState(0);
  const [attempts, setAttempts]       = useState(0);
  const [roundNum, setRoundNum]       = useState(0);
  const [gameOver, setGameOver]       = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [autoMode, setAutoMode]       = useState(false);
  const autoModeRef  = useRef(false);
  const handleFrRef  = useRef(null);
  useEffect(() => { autoModeRef.current = autoMode; }, [autoMode]);

  function handleStart(selCefr, contentType, selTopics, selGrammar, wordLimit) {
    const cap = Math.min(wordLimit, MAX_WORDS);
    let filtered = vocab.filter(w =>
      selCefr.has(w.cefr) &&
      w.type === contentType &&
      (selTopics.size === 0 || selTopics.has(w.topic)) &&
      (selGrammar.size === 0 || selGrammar.has(w.grammar_type))
    );
    if (filtered.length > cap) filtered = shuffle(filtered).slice(0, cap);
    setActiveVocab(filtered);
    setScreen('game');
  }

  const startRound = useCallback((used, vocab) => {
    const available = vocab.map((_, i) => i).filter(i => !used.has(i));
    if (available.length === 0) { setGameOver(true); return; }
    const picked = shuffle(available).slice(0, Math.min(ROUND_SIZE, available.length));
    const words  = picked.map(i => ({
      fr:      vocab[i].french,
      en:      vocab[i].english,
      cat:     vocab[i].topic,
      grammar: vocab[i].grammar_type,
      example: vocab[i].example,
    }));
    const idxs   = words.map((_, i) => i);
    const newUsed = new Set([...used, ...picked]);
    setRoundWords(words);
    setFrOrder(shuffle(idxs));
    setEnOrder(shuffle(idxs));
    setMatched(new Set());
    setActiveEnSlot(0);
    setWrongFrSlot(null);
    setTransitioning(false);
    setRoundNum(n => n + 1);
    setUsedIds(newUsed);
  }, []);

  useEffect(() => {
    if (screen === 'game' && activeVocab.length > 0) {
      questionStartRef.current = Date.now();
      startRound(new Set(), activeVocab);
    }
  }, [screen, activeVocab, startRound]);

  const nextEnSlot = useCallback((newMatched, currentSlot, order) => {
    for (let i = 1; i < order.length; i++) {
      const slot = (currentSlot + i) % order.length;
      if (!newMatched.has(order[slot])) return slot;
    }
    return null;
  }, []);

  const handleFr = useCallback((frSlot) => {
    if (wrongFrSlot !== null || transitioning) return;
    if (matched.has(frOrder[frSlot])) return;

    const frId = frOrder[frSlot];
    const enId = enOrder[activeEnSlot];
    setAttempts(t => t + 1);

    if (frId === enId) {
      if (!autoModeRef.current) speak(roundWords[frId].fr);
      if (questionStartRef.current !== null) {
        const elapsed = (Date.now() - questionStartRef.current) / 1000;
        setResponseTimes(prev => [...prev, elapsed]);
      }
      const newMatched = new Set([...matched, frId]);
      setMatched(newMatched);
      setScore(s => s + 1);
      const next = nextEnSlot(newMatched, activeEnSlot, enOrder);
      if (next !== null) {
        setActiveEnSlot(next);
        questionStartRef.current = Date.now();
      }
    } else {
      setWrongFrSlot(frSlot);
      setTimeout(() => setWrongFrSlot(null), 650);
    }
  }, [wrongFrSlot, transitioning, matched, frOrder, enOrder, activeEnSlot, roundWords, nextEnSlot]);

  useEffect(() => {
    if (roundWords.length > 0 && matched.size === roundWords.length && !transitioning) {
      setTransitioning(true);
      setTimeout(() => {
        questionStartRef.current = Date.now();
        startRound(usedIds, activeVocab);
      }, 1800);
    }
  }, [matched.size, roundWords.length, transitioning, startRound, usedIds, activeVocab]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return;
      const fi = FR_KEYS.indexOf(e.key);
      if (fi >= 0 && fi < frOrder.length) handleFr(fi);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleFr, frOrder.length]);

  useEffect(() => { handleFrRef.current = handleFr; }, [handleFr]);

  useEffect(() => {
    if (!autoMode || transitioning || roundWords.length === 0) return;
    const activeWordId = enOrder[activeEnSlot];
    if (activeWordId === undefined) return;
    const word = roundWords[activeWordId];
    if (!word) return;

    let cancelled = false;
    let timer = null;

    function doClick() {
      if (cancelled) return;
      const slot = frOrder.findIndex(id => id === activeWordId);
      if (slot !== -1) handleFrRef.current(slot);
    }

    function speakFrench() {
      if (cancelled) return;
      clearTimeout(timer);
      const uFr = new SpeechSynthesisUtterance(word.fr);
      uFr.lang = 'fr-FR'; uFr.rate = 0.82;
      uFr.onend = () => { clearTimeout(timer); timer = setTimeout(doClick, 400); };
      window.speechSynthesis.speak(uFr);
      timer = setTimeout(doClick, 6000);
    }

    window.speechSynthesis.cancel();
    const uEn = new SpeechSynthesisUtterance(word.en);
    uEn.lang = 'en-US'; uEn.rate = 0.85;
    uEn.onend = speakFrench;
    window.speechSynthesis.speak(uEn);
    timer = setTimeout(speakFrench, 6000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.speechSynthesis?.cancel();
    };
  }, [autoMode, activeEnSlot, roundNum, transitioning, roundWords, enOrder, frOrder]);

  if (!vocab) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontFamily: 'system-ui', fontSize: 15 }}>
        Loading vocabulary…
      </div>
    );
  }

  if (screen === 'select') {
    return <SelectionScreen onStart={handleStart} vocab={vocab} />;
  }

  const accuracy    = attempts === 0 ? '—' : Math.round((score / attempts) * 100) + '%';
  const totalWords  = activeVocab.length;
  const wordsLearned = usedIds.size - (roundWords.length - matched.size);
  const progressPct  = Math.round((wordsLearned / totalWords) * 100);
  const avgTime      = responseTimes.length > 0
    ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1) + 's'
    : '—';

  function resetGame() {
    setScore(0); setAttempts(0); setRoundNum(0);
    setUsedIds(new Set()); setRoundWords([]);
    setResponseTimes([]); questionStartRef.current = null;
    setAutoMode(false); window.speechSynthesis?.cancel();
  }

  if (gameOver) {
    return (
      <div style={gs.page}>
        <div style={gs.doneCard}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h1 style={{ color: '#f1f5f9', fontSize: 28, margin: '0 0 8px', fontWeight: 700 }}>
            Félicitations !
          </h1>
          <p style={{ color: '#94a3b8', margin: '0 0 32px', fontSize: 16 }}>
            You matched all {totalWords} words!
          </p>
          <div style={gs.statRow}>
            <div style={gs.stat}><span style={gs.statNum}>{score}</span><span style={gs.statLabel}>Correct</span></div>
            <div style={gs.stat}><span style={gs.statNum}>{attempts}</span><span style={gs.statLabel}>Attempts</span></div>
            <div style={gs.stat}><span style={gs.statNum}>{accuracy}</span><span style={gs.statLabel}>Accuracy</span></div>
            <div style={gs.stat}><span style={gs.statNum}>{avgTime}</span><span style={gs.statLabel}>Avg / word</span></div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button style={gs.secondaryBtn} className="btn3d" onClick={() => { resetGame(); setGameOver(false); setScreen('select'); }}>
              Change words
            </button>
            <button style={gs.restartBtn} className="btn3d" onClick={() => {
              resetGame(); setGameOver(false);
              questionStartRef.current = Date.now();
              startRound(new Set(), activeVocab);
            }}>
              Play again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={gs.page}>
      <div style={gs.progressTrack}>
        <div style={{ ...gs.progressFill, width: progressPct + '%' }} />
      </div>

      <div style={gs.header}>
        <div style={gs.headerLeft}>
          <img src="/favicon.svg" alt="Aimpact" style={{ width: 32, height: 32 }} />
          <div>
            <div style={gs.title}>French Match</div>
            <div style={gs.subtitle}>Round {roundNum} · {wordsLearned}/{totalWords} words</div>
          </div>
        </div>
        <div style={gs.headerRight}>
          <div style={gs.pill}><span style={{ color: '#4ade80' }}>✓</span> {score}</div>
          <div style={gs.pill}>🎯 {accuracy}</div>
          <button
            style={{ ...gs.menuBtn, ...(autoMode ? gs.autoBtnOn : {}) }}
            className="btn3d"
            onClick={() => { if (autoMode) window.speechSynthesis?.cancel(); setAutoMode(a => !a); }}
            title={autoMode ? 'Stop auto-play' : 'Auto-play'}
          >
            {autoMode ? '⏹ Stop' : '▶ Auto'}
          </button>
          <button style={gs.menuBtn} className="btn3d" onClick={() => { resetGame(); setGameOver(false); setScreen('select'); }} title="Back to selection">⚙</button>
        </div>
      </div>

      <div style={gs.instructions}>
        The highlighted <span style={{ color: '#fb923c', fontWeight: 600 }}>English</span> word
        is active — click its <span style={{ color: '#818cf8', fontWeight: 600 }}>French</span> match.
        Use keys <kbd style={gs.kbd}>1–6</kbd>
      </div>

      <div style={gs.board}>
        {/* English column */}
        <div style={gs.column}>
          <div style={gs.colHeader}><span style={{ color: '#fb923c' }}>English</span></div>
          {enOrder.map((wordId, slot) => {
            const word      = roundWords[wordId];
            const isMatched = matched.has(wordId);
            const isActive  = !isMatched && slot === activeEnSlot;
            return (
              <div key={slot} style={enCardStyle(isActive, isMatched)}>
                {isActive && <span style={gs.activeDot} />}
                <span style={gs.wordText}>{word?.en}</span>
                {isMatched && (
                  <span style={gs.speakerBtn} onClick={() => speak(word?.fr)} title="Hear French again">🔊</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Arrow column */}
        <div style={gs.arrowCol}>
          <div style={{ height: 28 }} />
          {enOrder.map((wordId, slot) => {
            const isActive = !matched.has(wordId) && slot === activeEnSlot;
            return (
              <div key={slot} style={gs.arrowRow}>
                <span style={{ ...gs.arrow, opacity: isActive ? 1 : 0.15 }}>→</span>
              </div>
            );
          })}
        </div>

        {/* French column */}
        <div style={gs.column}>
          <div style={gs.colHeader}><span style={{ color: '#818cf8' }}>Français</span></div>
          {frOrder.map((wordId, slot) => {
            const word      = roundWords[wordId];
            const isMatched = matched.has(wordId);
            const isWrong   = wrongFrSlot === slot;
            const color     = TOPIC_COLORS[word?.cat] || '#64748b';
            return (
              <button key={slot} style={frCardStyle(isMatched, isWrong)} className="btn3d" onClick={() => handleFr(slot)} disabled={isMatched}>
                <span style={gs.keyHint}>{FR_KEYS[slot]}</span>
                <div style={gs.frCardInner}>
                  <span style={gs.wordText}>{word?.fr}</span>
                  {isMatched && word?.example && (
                    <span style={gs.exampleText}>{word.example}</span>
                  )}
                </div>
                {isMatched && <span style={{ ...gs.checkMark, color }}> ✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {transitioning && (
        <div style={gs.roundBanner}>✨ Round complete! Loading next…</div>
      )}
    </div>
  );
}

function enCardStyle(isActive, isMatched) {
  const base = {
    position: 'relative', display: 'flex', alignItems: 'center',
    width: '100%', minHeight: 64, padding: '12px 36px 12px 28px',
    borderRadius: 6, border: '2px solid transparent',
    fontSize: 15, fontWeight: 500, textAlign: 'left',
    transition: 'all 0.2s ease', letterSpacing: '0.01em',
  };
  if (isMatched) return { ...base, background: 'rgba(20,83,45,0.6)', border: '2px solid #22c55e', color: '#86efac' };
  if (isActive)  return { ...base, background: 'rgba(251,146,60,0.15)', border: '2px solid #fb923c', color: '#fed7aa', animation: 'pulse-glow 2s ease-in-out infinite', fontWeight: 600 };
  return { ...base, background: '#111827', border: '2px solid #1e293b', color: '#374151' };
}

function frCardStyle(isMatched, isWrong) {
  const base = {
    position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    width: '100%', minHeight: 64, padding: '12px 36px',
    borderRadius: 6, border: '2px solid transparent',
    cursor: isMatched ? 'default' : 'pointer',
    fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
    textAlign: 'center', outline: 'none', letterSpacing: '0.01em',
  };
  if (isMatched) return { ...base, background: 'rgba(20,83,45,0.6)', border: '2px solid #22c55e', color: '#86efac', alignItems: 'flex-start', paddingTop: 14, boxShadow: 'none' };
  if (isWrong)   return { ...base, background: 'rgba(127,29,29,0.85)', border: '2px solid #ef4444', color: '#fca5a5', animation: 'shake 0.35s ease', boxShadow: '0 4px 0 #7f1d1d' };
  return { ...base, background: '#1e293b', border: '2px solid #334155', color: '#e2e8f0', boxShadow: '0 4px 0 rgba(0,0,0,0.5)' };
}

const gs = {
  page:          { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 100%)', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 40px' },
  progressTrack: { width: '100%', height: 4, background: '#1e293b', flexShrink: 0 },
  progressFill:  { height: '100%', background: 'linear-gradient(90deg, #f97316, #fb923c)', transition: 'width 0.6s ease', borderRadius: '0 4px 4px 0' },
  header:        { width: '100%', maxWidth: 920, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' },
  headerLeft:    { display: 'flex', alignItems: 'center', gap: 12 },
  title:         { fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' },
  subtitle:      { fontSize: 12, color: '#64748b', marginTop: 2 },
  headerRight:   { display: 'flex', gap: 8, alignItems: 'center' },
  pill:          { background: '#1e293b', border: '1px solid #334155', borderRadius: 5, padding: '5px 14px', fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 },
  menuBtn:       { background: '#1e293b', border: '1px solid #334155', borderRadius: 5, padding: '5px 12px', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', color: '#64748b', cursor: 'pointer', boxShadow: '0 4px 0 rgba(0,0,0,0.55)' },
  autoBtnOn:     { background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', color: '#22c55e', boxShadow: '0 4px 0 #14532d' },
  instructions:  { fontSize: 13, color: '#475569', margin: '16px 0 20px', textAlign: 'center', lineHeight: 1.8 },
  kbd:           { background: '#1e293b', border: '1px solid #475569', borderRadius: 5, padding: '1px 7px', fontSize: 11, fontFamily: 'monospace', color: '#94a3b8', margin: '0 3px' },
  board:         { display: 'flex', gap: 0, width: '100%', maxWidth: 920, padding: '0 16px', alignItems: 'flex-start' },
  column:        { flex: 1, display: 'flex', flexDirection: 'column', gap: 10 },
  colHeader:     { textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  arrowCol:      { width: 80, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  arrowRow:      { minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  arrow:         { fontSize: 18, color: '#fb923c', transition: 'opacity 0.3s ease', fontWeight: 300 },
  activeDot:     { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 8, height: 8, borderRadius: '50%', background: '#fb923c', boxShadow: '0 0 8px #fb923c' },
  wordText:      { flex: 1, textAlign: 'center', lineHeight: 1.3 },
  frCardInner:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 },
  exampleText:   { fontSize: 12, color: '#86efac', opacity: 0.9, fontStyle: 'italic', fontWeight: 400, lineHeight: 1.5, textAlign: 'center', maxWidth: '100%', borderTop: '1px solid rgba(134,239,172,0.2)', paddingTop: 6, marginTop: 2 },
  keyHint:       { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: '#475569', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 4, padding: '1px 5px', lineHeight: 1.4 },
  checkMark:     { position: 'absolute', right: 10, top: 12, fontSize: 14, fontWeight: 700 },
  speakerBtn:    { position: 'absolute', right: 10, fontSize: 13, cursor: 'pointer', opacity: 0.7 },
  roundBanner:   { position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'rgba(249,115,22,0.95)', color: '#fff', borderRadius: 24, padding: '10px 28px', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 32px rgba(249,115,22,0.4)', letterSpacing: '0.01em', whiteSpace: 'nowrap' },
  doneCard:      { background: '#111827', border: '1px solid #1e293b', borderRadius: 24, padding: 48, textAlign: 'center', maxWidth: 440, margin: 'auto' },
  statRow:       { display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 32 },
  stat:          { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  statNum:       { fontSize: 32, fontWeight: 700, color: '#f1f5f9' },
  statLabel:     { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' },
  restartBtn:    { background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', border: 'none', borderRadius: 5, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 5px 0 #b45309' },
  secondaryBtn:  { background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: 5, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 5px 0 rgba(0,0,0,0.55)' },
};
