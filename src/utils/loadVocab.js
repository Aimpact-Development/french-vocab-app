import { parseCSV } from './csvParser.js';

export async function loadVocab() {
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
