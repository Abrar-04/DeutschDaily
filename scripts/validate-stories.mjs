import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../src/data/stories/', import.meta.url).pathname;
const LEVELS = ['A2', 'B1', 'B2'];
const COLORS = new Set(['peach', 'lavender', 'sage', 'sky', 'butter', 'rose']);
const ids = new Set();
const errors = [];
let total = 0;
let minWords = Infinity;
let maxWords = 0;
let sizeBytes = 0;

for (const level of LEVELS) {
  const dir = join(ROOT, level);
  const files = readdirSync(dir).filter(name => name.endsWith('.json'));
  if (files.length !== 50) errors.push(`${level}: expected 50 JSON stories, found ${files.length}`);

  for (const name of files) {
    const filename = join(dir, name);
    sizeBytes += Buffer.byteLength(readFileSync(filename));
    let story;
    try { story = JSON.parse(readFileSync(filename, 'utf8')); }
    catch (err) { errors.push(`${filename}: invalid JSON (${err.message})`); continue; }
    const key = `${level}/${name}`;
    total++;
    if (story.level !== level) errors.push(`${key}: wrong CEFR level`);
    if (typeof story.id !== 'string' || !story.id.length) errors.push(`${key}: missing ID`);
    if (ids.has(story.id)) errors.push(`${key}: duplicate ID ${story.id}`);
    ids.add(story.id);
    if (!story.title?.trim() || !story.subtitle?.trim() || !story.category?.trim()) errors.push(`${key}: missing metadata`);
    if (!COLORS.has(story.color)) errors.push(`${key}: invalid card color`);
    if (!Array.isArray(story.german) || !Array.isArray(story.english) || story.german.length < 3 || story.german.length !== story.english.length) {
      errors.push(`${key}: missing or unmatched German/English paragraphs`);
      continue;
    }
    for (const [i, p] of story.german.entries()) {
      if (!p.trim() || !story.english[i]?.trim()) errors.push(`${key}: empty translation paragraph ${i + 1}`);
      if (/\{[^}]+\}/.test(p) || /\{[^}]+\}/.test(story.english[i])) errors.push(`${key}: unfilled text placeholder`);
    }
    const wc = story.german.join(' ').trim().split(/\s+/).length;
    minWords = Math.min(minWords, wc);
    maxWords = Math.max(maxWords, wc);
    if (wc < 150 || wc > 250) errors.push(`${key}: ${wc} words, target 150–250`);
    if (!Array.isArray(story.questions) || story.questions.length !== 3) {
      errors.push(`${key}: expected 3 questions`); continue;
    }
    for (const [i, question] of story.questions.entries()) {
      if (!question.question?.trim() || !question.explanation?.trim() || !Array.isArray(question.options) || question.options.length !== 3 || !question.options.every(x => typeof x === 'string' && !!x.trim()) || new Set(question.options).size !== 3 || !Number.isInteger(question.answer) || question.answer < 0 || question.answer > 2) errors.push(`${key}: invalid quiz question ${i + 1}`);
    }
  }
  console.log(`${level}: ${files.length} story JSON files`);
}

if (total !== 150) errors.push(`expected 150 stories total, found ${total}`);
console.log(`Total: ${total} stories; word counts ${minWords}–${maxWords}; JSON ${Math.round(sizeBytes / 1024)} KiB`);
if (errors.length) {
  for (const error of errors) console.error('ERROR:', error);
  process.exitCode = 1;
} else {
  console.log('PASS: all structural checks passed. Language accuracy requires editorial review.');
}
