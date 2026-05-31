import React from 'react';
import { gs, enCardStyle, frCardStyle } from '../styles/gameStyles.js';
import { TOPIC_COLORS, FR_KEYS } from '../constants/index.js';
import { speak } from '../utils/speech.js';

export default function GameBoard({
  roundWords, enOrder, frOrder, matched, activeEnSlot, wrongFrSlot,
  score, accuracy, autoMode, onAutoToggle, onFrClick, onBack,
  roundNum, wordsLearned, totalWords, progressPct, transitioning,
  theme, onToggleTheme,
}) {
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
        Highlighted <span style={{ color: '#fb923c', fontWeight: 600 }}>English</span> word is active —
        click its <span style={{ color: '#818cf8', fontWeight: 600 }}>French</span> match.
        Keys <kbd style={gs.kbd}>1–6</kbd>
      </div>

      {/* Board */}
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
                  <span style={gs.speakerBtn} onClick={() => speak(word?.fr)} title="Hear French">🔊</span>
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
              <button
                key={slot}
                style={frCardStyle(isMatched, isWrong)}
                className="btn3d"
                onClick={() => onFrClick(slot)}
                disabled={isMatched}
              >
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
