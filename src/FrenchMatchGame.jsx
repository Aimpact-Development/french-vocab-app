import React, { useState, useEffect, useCallback, useRef } from 'react';
import { loadVocab }      from './utils/loadVocab.js';
import { shuffle }        from './utils/shuffle.js';
import { speak, speakEn } from './utils/speech.js';
import { ROUND_SIZE, MAX_WORDS } from './constants/index.js';
import SelectionScreen from './components/SelectionScreen.jsx';
import GameBoard       from './components/GameBoard.jsx';
import GameOver        from './components/GameOver.jsx';

export default function FrenchMatchGame() {
  // ── Vocab ─────────────────────────────────────────────────────────────────
  const [vocab, setVocab] = useState(null);
  useEffect(() => { loadVocab().then(setVocab); }, []);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem('fm-theme') || 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fm-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // ── Screen routing ────────────────────────────────────────────────────────
  const [screen, setScreen]           = useState('select');
  const [activeVocab, setActiveVocab] = useState([]);
  const [contentType, setContentType] = useState('W');

  // ── Round state ───────────────────────────────────────────────────────────
  const questionStartRef              = useRef(null);
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

  // ── Auto-play ─────────────────────────────────────────────────────────────
  const [autoMode, setAutoMode] = useState(false);
  const autoModeRef = useRef(false);
  const handleFrRef = useRef(null);
  useEffect(() => { autoModeRef.current = autoMode; }, [autoMode]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleStart(selCefr, type, selTopics, selGrammar, wordLimit) {
    const cap = Math.min(wordLimit, MAX_WORDS);
    let filtered = vocab.filter(w =>
      selCefr.has(w.cefr) && w.type === type &&
      (selTopics.size === 0  || selTopics.has(w.topic)) &&
      (selGrammar.size === 0 || selGrammar.has(w.grammar_type))
    );
    if (filtered.length > cap) filtered = shuffle(filtered).slice(0, cap);
    setContentType(type);
    setActiveVocab(filtered);
    setScreen('game');
  }

  const startRound = useCallback((used, voc) => {
    const available = voc.map((_, i) => i).filter(i => !used.has(i));
    if (available.length === 0) { setGameOver(true); return; }
    const picked  = shuffle(available).slice(0, Math.min(ROUND_SIZE, available.length));
    const words   = picked.map(i => ({
      fr: voc[i].french, en: voc[i].english,
      cat: voc[i].topic, grammar: voc[i].grammar_type,
      example: voc[i].example, hint: voc[i].hint || '',
    }));
    const idxs = words.map((_, i) => i);
    setRoundWords(words);
    setFrOrder(shuffle(idxs));
    setEnOrder(shuffle(idxs));
    setMatched(new Set());
    setActiveEnSlot(0);
    setWrongFrSlot(null);
    setTransitioning(false);
    setRoundNum(n => n + 1);
    setUsedIds(new Set([...used, ...picked]));
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
    const frId = frOrder[frSlot], enId = enOrder[activeEnSlot];
    setAttempts(t => t + 1);
    if (frId === enId) {
      if (!autoModeRef.current) speak(roundWords[frId].fr);
      if (questionStartRef.current !== null)
        setResponseTimes(prev => [...prev, (Date.now() - questionStartRef.current) / 1000]);
      const newMatched = new Set([...matched, frId]);
      setMatched(newMatched);
      setScore(s => s + 1);
      const next = nextEnSlot(newMatched, activeEnSlot, enOrder);
      if (next !== null) { setActiveEnSlot(next); questionStartRef.current = Date.now(); }
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

  // Keyboard shortcut: 1–6 maps to FR card slots
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return;
      const fi = ['1','2','3','4','5','6'].indexOf(e.key);
      if (fi >= 0 && fi < frOrder.length) handleFr(fi);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleFr, frOrder.length]);

  useEffect(() => { handleFrRef.current = handleFr; }, [handleFr]);

  // Auto-play: speak EN → speak FR → click correct card
  useEffect(() => {
    if (!autoMode || transitioning || roundWords.length === 0) return;
    const wId  = enOrder[activeEnSlot];
    if (wId === undefined) return;
    const word = roundWords[wId];
    if (!word) return;

    let cancelled = false, timer = null;

    function doClick() {
      if (cancelled) return;
      const slot = frOrder.findIndex(id => id === wId);
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
    // For Antonyms both sides are French words; otherwise left side is English
    const leftLang = contentType === 'ANT' ? 'fr-FR' : 'en-US';
    const leftRate = contentType === 'ANT' ? 0.82   : 0.85;
    window.speechSynthesis.cancel();
    const uEn = new SpeechSynthesisUtterance(word.en);
    uEn.lang = leftLang; uEn.rate = leftRate;
    uEn.onend = speakFrench;
    window.speechSynthesis.speak(uEn);
    timer = setTimeout(speakFrench, 6000);

    return () => { cancelled = true; clearTimeout(timer); window.speechSynthesis?.cancel(); };
  }, [autoMode, activeEnSlot, roundNum, transitioning, roundWords, enOrder, frOrder]);

  // ── Derived display values ────────────────────────────────────────────────
  const accuracy     = attempts === 0 ? '—' : Math.round((score / attempts) * 100) + '%';
  const totalWords   = activeVocab.length;
  const wordsLearned = usedIds.size - (roundWords.length - matched.size);
  const progressPct  = totalWords > 0 ? Math.round((wordsLearned / totalWords) * 100) : 0;
  const avgTime      = responseTimes.length > 0
    ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1) + 's'
    : '—';

  function resetGame() {
    setScore(0); setAttempts(0); setRoundNum(0);
    setUsedIds(new Set()); setRoundWords([]);
    setResponseTimes([]); questionStartRef.current = null;
    setAutoMode(false); window.speechSynthesis?.cancel();
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!vocab) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--fm-bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fm-text-3)', fontFamily: 'system-ui', fontSize: 15 }}>
        Loading vocabulary…
      </div>
    );
  }

  // ── Screen routing ────────────────────────────────────────────────────────
  if (screen === 'select') {
    return (
      <SelectionScreen
        onStart={handleStart}
        vocab={vocab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (gameOver) {
    return (
      <GameOver
        totalWords={totalWords}
        score={score}
        attempts={attempts}
        accuracy={accuracy}
        avgTime={avgTime}
        onChangeWords={() => { resetGame(); setGameOver(false); setScreen('select'); }}
        onPlayAgain={() => { resetGame(); setGameOver(false); questionStartRef.current = Date.now(); startRound(new Set(), activeVocab); }}
      />
    );
  }

  return (
    <GameBoard
      roundWords={roundWords}
      enOrder={enOrder}
      frOrder={frOrder}
      matched={matched}
      activeEnSlot={activeEnSlot}
      wrongFrSlot={wrongFrSlot}
      score={score}
      accuracy={accuracy}
      autoMode={autoMode}
      onAutoToggle={() => { if (autoMode) window.speechSynthesis?.cancel(); setAutoMode(a => !a); }}
      onFrClick={handleFr}
      onBack={() => { resetGame(); setGameOver(false); setScreen('select'); }}
      roundNum={roundNum}
      wordsLearned={wordsLearned}
      totalWords={totalWords}
      progressPct={progressPct}
      transitioning={transitioning}
      theme={theme}
      onToggleTheme={toggleTheme}
      contentType={contentType}
    />
  );
}
