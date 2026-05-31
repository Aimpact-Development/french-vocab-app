import React, { useState, useEffect, useMemo } from 'react';
import { ss } from '../styles/selectionStyles.js';
import { CEFR_META, TOPIC_COLORS, GRAMMAR_COLORS, ROUND_SIZE, MAX_WORDS, DEFAULT_LIMIT } from '../constants/index.js';

export default function SelectionScreen({ onStart, vocab, theme, onToggleTheme }) {
  const [wordLimit, setWordLimit]     = useState(DEFAULT_LIMIT);
  const [contentType, setContentType] = useState('W');

  const availCefr = useMemo(() => {
    const present = new Set(vocab.map(w => w.cefr));
    return CEFR_META.filter(m => present.has(m.code));
  }, [vocab]);

  const [selCefr, setSelCefr] = useState(() => new Set(CEFR_META.map(m => m.code)));

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

  useEffect(() => { setSelTopics(new Set(Object.keys(allTopics)));   }, [allTopics]);
  useEffect(() => { setSelGrammar(new Set(Object.keys(allGrammar))); }, [allGrammar]);

  const filteredCount = useMemo(() =>
    vocab.filter(w =>
      selCefr.has(w.cefr) && w.type === contentType &&
      selTopics.has(w.topic) && selGrammar.has(w.grammar_type)
    ).length,
    [vocab, selCefr, contentType, selTopics, selGrammar]
  );

  function toggle(set, setter, key) {
    setter(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }

  const itemLabel = { W: 'words', P: 'phrases', S: 'sentences', ANT: 'antonyms' }[contentType] ?? 'items';

  return (
    <div style={ss.page}>
      <div style={ss.card}>

        {/* Header */}
        <div style={ss.logoRow}>
          <div style={ss.logoLeft}>
            <img src="/favicon.svg" alt="Aimpact" style={{ width: 42, height: 42 }} />
            <div>
              <div style={ss.title}>French Match</div>
              <div style={ss.subtitle}>Choose what to practise</div>
            </div>
          </div>
          <button style={ss.skinBtn} className="btn3d" onClick={onToggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
        </div>

        {/* CEFR Level */}
        <div style={ss.sectionLabel}>
          <span>CEFR Level</span>
          <button style={ss.toggleAll} onClick={() =>
            setSelCefr(prev => prev.size === availCefr.length
              ? new Set()
              : new Set(availCefr.map(m => m.code)))
          }>
            {selCefr.size === availCefr.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div style={{ ...ss.grid, marginBottom: 20 }}>
          {availCefr.map(({ code, label, color }) => {
            const on = selCefr.has(code);
            return (
              <label key={code} style={ss.chip(on, color)} className="btn3d">
                <input type="checkbox" checked={on} onChange={() => toggle(selCefr, setSelCefr, code)} style={{ display: 'none' }} />
                <span style={ss.chipDot(on, color)} />
                <span style={ss.chipLabel(on)}>{label}</span>
              </label>
            );
          })}
        </div>

        {/* Content Type */}
        <div style={ss.sectionLabel}><span>Content Type</span></div>
        <div style={ss.typeToggle}>
          {[{ code: 'W', label: 'Words' }, { code: 'P', label: 'Phrases' }, { code: 'S', label: 'Sentences' }, { code: 'ANT', label: 'Antonyms' }]
            .map(({ code, label }) => (
              <button key={code} style={ss.typeBtn(contentType === code)} className="btn3d" onClick={() => setContentType(code)}>
                {label}
              </button>
            ))}
        </div>

        {/* Topic */}
        <div style={ss.sectionLabel}>
          <span>Topic</span>
          <button style={ss.toggleAll} onClick={() =>
            setSelTopics(prev => prev.size === Object.keys(allTopics).length
              ? new Set()
              : new Set(Object.keys(allTopics)))
          }>
            {selTopics.size === Object.keys(allTopics).length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div style={ss.grid}>
          {Object.keys(allTopics).length === 0
            ? <span style={{ fontSize: 13, color: 'var(--fm-text-3)' }}>No {itemLabel} for this selection.</span>
            : Object.entries(allTopics).map(([topic, count]) => {
                const on    = selTopics.has(topic);
                const color = TOPIC_COLORS[topic] || '#64748b';
                return (
                  <label key={topic} style={ss.chip(on, color)} className="btn3d">
                    <input type="checkbox" checked={on} onChange={() => toggle(selTopics, setSelTopics, topic)} style={{ display: 'none' }} />
                    <span style={ss.chipDot(on, color)} />
                    <span style={ss.chipLabel(on)}>{topic}</span>
                    <span style={ss.chipCount(on)}>{count}</span>
                  </label>
                );
              })
          }
        </div>

        {/* Grammar type */}
        <div style={{ ...ss.sectionLabel, marginTop: 20 }}>
          <span>Grammar type</span>
          <button style={ss.toggleAll} onClick={() =>
            setSelGrammar(prev => prev.size === Object.keys(allGrammar).length
              ? new Set()
              : new Set(Object.keys(allGrammar)))
          }>
            {selGrammar.size === Object.keys(allGrammar).length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div style={ss.grid}>
          {Object.entries(allGrammar).map(([g, count]) => {
            const on    = selGrammar.has(g);
            const color = GRAMMAR_COLORS[g] || '#64748b';
            return (
              <label key={g} style={ss.chip(on, color)} className="btn3d">
                <input type="checkbox" checked={on} onChange={() => toggle(selGrammar, setSelGrammar, g)} style={{ display: 'none' }} />
                <span style={ss.chipDot(on, color)} />
                <span style={ss.chipLabel(on)}>{g}</span>
                <span style={ss.chipCount(on)}>{count}</span>
              </label>
            );
          })}
        </div>

        {/* Word limit */}
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
          <span style={{ fontSize: 13, color: 'var(--fm-text-3)' }}>
            {filteredCount > wordLimit
              ? `${filteredCount} available — will play ${Math.min(wordLimit, MAX_WORDS)}`
              : `${filteredCount} ${itemLabel} will be played`}
          </span>
        </div>

        <div style={ss.footer}>
          <span />
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
