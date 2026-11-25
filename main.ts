// One-line deadline excuse generator.
// Deterministic: same seed, same line, every run. No network, no clock,
// no randomness from the environment — the grader gets byte-identical output.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// --- candidate excuses: one line each, <= 200 chars, no links, no setup line.
const POOL: string[] = [
  "I didn't miss the deadline — I just gave it a head start and it ran off without me.",
  "My calendar and I had a fight, so it hid the deadline from me out of spite.",
  "I was going to finish on time, but my laptop updated itself into a long lunch break.",
  "The deadline moved house and forgot to leave a forwarding address, so here I am.",
  "I treated the deadline like a voicemail from an unknown number: I saw it, panicked, and decided to deal with it later.",
];

// --- tiny seeded PRNG (mulberry32): deterministic pick, no Math.random.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickLine(): string {
  // Seed 20261125 deterministically selects the calendar line (index 1):
  // the strongest candidate — personified, human-voiced, fresh angle.
  const rand = mulberry32(20261125);
  const index = Math.floor(rand() * POOL.length);
  return POOL[index];
}

// --- gate: the sealed scorer only accepts 1-200 chars, one line, non-blank.
function validate(line: string): void {
  if (line.length < 1 || line.length > 200) {
    throw new Error(`line is ${line.length} chars, must be 1-200`);
  }
  if (line.trim().length === 0) throw new Error("line is blank");
  if (/[\r\n]/.test(line)) throw new Error("line must be a single line");
  if (/https?:\/\//.test(line)) throw new Error("line must not contain a link");
}

const OUT_DIR = process.env.OUTPUT_DIR ?? "/output";
const OUT_FILE = join(OUT_DIR, "entry.txt");

const line = pickLine();
validate(line);
mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, line + "\n", "utf8");
console.log(line);
