import React from 'react';
import { gs } from '../styles/gameStyles.js';

export default function GameOver({ totalWords, score, attempts, accuracy, avgTime, onChangeWords, onPlayAgain }) {
  return (
    <div style={gs.page}>
      <div style={gs.doneCard}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h1 style={{ color: 'var(--fm-text-1)', fontSize: 28, margin: '0 0 8px', fontWeight: 700 }}>
          Félicitations !
        </h1>
        <p style={{ color: 'var(--fm-text-2)', margin: '0 0 32px', fontSize: 16 }}>
          You matched all {totalWords} words!
        </p>
        <div style={gs.statRow}>
          <div style={gs.stat}>
            <span style={gs.statNum}>{score}</span>
            <span style={gs.statLabel}>Correct</span>
          </div>
          <div style={gs.stat}>
            <span style={gs.statNum}>{attempts}</span>
            <span style={gs.statLabel}>Attempts</span>
          </div>
          <div style={gs.stat}>
            <span style={gs.statNum}>{accuracy}</span>
            <span style={gs.statLabel}>Accuracy</span>
          </div>
          <div style={gs.stat}>
            <span style={gs.statNum}>{avgTime}</span>
            <span style={gs.statLabel}>Avg / word</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button style={gs.secondaryBtn} className="btn3d" onClick={onChangeWords}>
            Change words
          </button>
          <button style={gs.restartBtn} className="btn3d" onClick={onPlayAgain}>
            Play again
          </button>
        </div>
      </div>
    </div>
  );
}
