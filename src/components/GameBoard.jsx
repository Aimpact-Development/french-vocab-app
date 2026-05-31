import React, { useRef, useState, useLayoutEffect } from 'react';
import { gs, enCardStyle, frCardStyle } from '../styles/gameStyles.js';
import { TOPIC_COLORS, FR_KEYS, ROUND_SIZE } from '../constants/index.js';
import { speak } from '../utils/speech.js';

export default function GameBoard({
  roundWords, enOrder, frOrder, matched, activeEnSlot, wrongFrSlot,
  score, accuracy, autoMode, onAutoToggle, onFrClick, onBack,
  roundNum, wordsLearned, totalWords, progressPct, transitioning,
  theme, onToggleTheme,
}) {
  // ── Refs for SVG line calculation ─────────────────────────────────────────
  const boardRef = useRef(null);
  const enRefs   = useRef(Array.from({ length: ROUND_SIZE }, () => React.createRef()));
  const frRefs   = useRef(Array.from({ length: ROUND_SIZE }, () => React.createRef()));
  const [lines, setLines] = useState([]);

  // Recalculate dotted match lines after every render where matched changes.
  // useLayoutEffect runs after DOM mutations so getBoundingClientRect is accurate.
  useLayoutEffect(() => {
    if (!boardRef.current || matched.size === 0) {
      setLines([]);
      return;
    }
    const boardRect = boardRef.current.getBoundingClientRect();
    const next = [];

    matched.forEach(wordId => {
      const enSlot = enOrder.indexOf(wordId);
      const frSlot = frOrder.indexOf(wordId);
      if (enSlot < 0 || frSlot < 0) return;

      const enEl = enRefs.current[enSlot]?.current;
      const frEl = frRefs.current[frSlot]?.current;
      if (!enEl || !frEl) return;

      const enRect = enEl.getBoundingClientRect();
      const frRect = frEl.getBoundingClientRect();

      next.push({
        x1: enRect.right  - boardRect.left,
        y1: enRect.top    + enRect.height / 2 - boardRect.top,
        x2: frRect.left   - boardRect.left,
        y2: frRect.top    + frRect.height / 2 - boardRect.top,
      });
    });

    setLines(next);
  }, [matched, enOrder, frOrder]);

  return (
    <div style={gs.page}>

      {/* Progress bar */}
      <div style={gs.progressTrack}>
        <div style={{ ...gs.progressFill, width: progressPct + '%' }} />
      </div>

      {/* Header */}
      <div style={gs.header}>
        <div style={gs.headerLeft}>
          <img src="/favicon.svg" alt="Aimpact" style={{ width: 32, height: 32 }} />
          <div>
            <div style={gs.title}>French Match</div>
            <div style={gs.subtitle}>Round {roundNum} · {wordsLearned}/{totalWords}</div>
          </div>
        </div>
        <div style={gs.headerRight}>
          <div style={gs.pill}><span style={{ color: '#4ade80' }}>✓</span> {score}</div>
          <div style={gs.pill}>🎯 {accuracy}</div>
          <button
            style={{ ...gs.menuBtn, ...(autoMode ? gs.autoBtnOn : {}) }}
            className="btn3d"
            onClick={onAutoToggle}
            title={autoMode ? 'Stop auto-play' : 'Auto-play'}
          >
            {autoMode ? '⏹ Stop' : '▶ Auto'}
          </button>
          <button style={gs.menuBtn} className="btn3d" onClick={onToggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
          <button style={gs.menuBtn} className="btn3d" onClick={onBack} title="Back to selection">⚙</button>
        </div>
      </div>

      {/* Instructions */}
      <div style={gs.instructions}>
        Highlighted <span style={{ color: '#fb923c', fontWeight: 600 }}>English</span> word
        is active — click its <span style={{ color: '#818cf8', fontWeight: 600 }}>French</span> match.
        Keys <kbd style={gs.kbd}>1–6</kbd>
      </div>

      {/* ── Board grid ──────────────────────────────────────────────────────── */}
      <div ref={boardRef} style={gs.board}>

        {/* SVG overlay — dotted bezier lines for each matched pair */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible', zIndex: 1 }}
          aria-hidden="true"
        >
          {lines.map((line, i) => {
            const cx = (line.x1 + line.x2) / 2;
            return (
              <path
                key={i}
                d={`M ${line.x1} ${line.y1} C ${cx} ${line.y1}, ${cx} ${line.y2}, ${line.x2} ${line.y2}`}
                stroke="#22c55e"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                fill="none"
                opacity="0.8"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* ── Header row (row 0 of the grid) ── */}
        <div style={{ ...gs.colHeader, color: '#fb923c' }}>English</div>
        <div />
        <div style={{ ...gs.colHeader, color: '#818cf8' }}>Français</div>

        {/* ── Card rows (rows 1–ROUND_SIZE of the grid) ── */}
        {enOrder.map((enWordId, slot) => {
          const frWordId  = frOrder[slot];
          const enWord    = roundWords[enWordId];
          const frWord    = roundWords[frWordId];
          const enMatched = matched.has(enWordId);
          const frMatched = matched.has(frWordId);
          const isActive  = !enMatched && slot === activeEnSlot;
          const isWrong   = wrongFrSlot === slot;
          const dotColor  = TOPIC_COLORS[frWord?.cat] || '#64748b';

          return (
            <React.Fragment key={slot}>

              {/* English card */}
              <div ref={enRefs.current[slot]} style={enCardStyle(isActive, enMatched)}>
                {isActive && <span style={gs.activeDot} />}
                <span style={gs.wordText}>{enWord?.en}</span>
                {enMatched && (
                  <span style={gs.speakerBtn} onClick={() => speak(enWord?.fr)} title="Hear French">🔊</span>
                )}
              </div>

              {/* Arrow cell */}
              <div style={gs.arrowCell}>
                <span style={{ ...gs.arrow, opacity: isActive ? 1 : 0.2 }}>→</span>
              </div>

              {/* French card */}
              <button
                ref={frRefs.current[slot]}
                style={frCardStyle(frMatched, isWrong)}
                className="btn3d"
                onClick={() => onFrClick(slot)}
                disabled={frMatched}
              >
                <span style={gs.keyHint}>{FR_KEYS[slot]}</span>
                <div style={gs.frCardInner}>
                  <span style={gs.wordText}>{frWord?.fr}</span>
                  {frMatched && frWord?.example && (
                    <span style={gs.exampleText}>{frWord.example}</span>
                  )}
                </div>
                {frMatched && <span style={{ ...gs.checkMark, color: dotColor }}> ✓</span>}
              </button>

            </React.Fragment>
          );
        })}
      </div>

      {transitioning && (
        <div style={gs.roundBanner}>✨ Round complete! Loading next…</div>
      )}
    </div>
  );
}
