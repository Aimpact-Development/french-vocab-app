export const TOPIC_CEFR = {
  'People & Family':    'A1', 'Daily Verbs':    'A1', 'Home':             'A1',
  'Food & Drink':       'A1', 'Time':           'A1', 'Adjectives':       'A1',
  'Common Phrases':     'A1', 'Travel & City':  'A2', 'Work & Study':     'A2',
  'Health & Body':      'A2', 'Weather & Nature':'A2', 'Connectors':      'A2',
  'Shopping & Money':   'A2', 'Emotions & Opinions':'B1', 'Technology':   'B1',
  'Business Terminology':'B2',
};

export function parseCsvLine(line) {
  const cols = [];
  let inQuote = false, cur = '';
  for (const ch of line) {
    if (ch === '"')            { inQuote = !inQuote; }
    else if (ch === ',' && !inQuote) { cols.push(cur); cur = ''; }
    else                       { cur += ch; }
  }
  cols.push(cur);
  return cols.map(c => c.trim());
}

export function parseCSV(text) {
  const lines  = text.trim().split('\n');
  const header = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
  const isNew  = header[0] === 'cefr_level';

  return lines.slice(1).filter(l => l.trim()).map(line => {
    const c = parseCsvLine(line);
    if (isNew) {
      return {
        cefr:         c[0]?.trim() || 'A1',
        type:         c[1]?.trim() || 'W',
        topic:        c[2]?.trim() || '',
        grammar_type: c[3]?.trim() || '',
        english:      c[4]?.trim() || '',
        french:       c[5]?.trim() || '',
        example:      c.slice(6).join(',').trim(),
      };
    }
    const topic = c[0]?.trim() || '';
    return {
      cefr:         TOPIC_CEFR[topic] || 'A1',
      type:         'W',
      topic,
      grammar_type: c[1]?.trim() || '',
      english:      c[2]?.trim() || '',
      french:       c[3]?.trim() || '',
      example:      c.slice(4).join(',').trim(),
    };
  });
}
