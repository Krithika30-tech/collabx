// Matching weights (total 100)
const WEIGHTS = { skills: 50, interests: 20, availability: 15, experience: 15 };
const LEVELS = { beginner: 0, intermediate: 1, advanced: 2 };

const norm = (arr = []) => [
  ...new Set(arr.map((s) => String(s).trim().toLowerCase()).filter(Boolean)),
];

// Fraction of the wanted items that the candidate has
const coverage = (have, want) => {
  const w = norm(want);
  if (w.length === 0) return 0;
  const h = new Set(norm(have));
  return w.filter((x) => h.has(x)).length / w.length;
};

const availabilityScore = (candidate = "", wanted = "") => {
  const c = String(candidate).trim().toLowerCase();
  const w = String(wanted).trim().toLowerCase();
  if (!w || w === "any") return 1;
  if (!c) return 0;
  return c === w ? 1 : 0;
};

const experienceScore = (candidate = "beginner", wanted = "any") => {
  const w = String(wanted).toLowerCase();
  if (!(w in LEVELS)) return 1;
  const c = LEVELS[String(candidate).toLowerCase()] ?? 0;
  return 1 - Math.abs(c - LEVELS[w]) / 2;
};

// candidate: { skills, interests, availability, experience }
// target:    { skills, interests, availability, experience }
const compatibility = (candidate, target) => {
  const parts = {
    skills: coverage(candidate.skills, target.skills),
    interests: coverage(candidate.interests, target.interests),
    availability: availabilityScore(candidate.availability, target.availability),
    experience: experienceScore(candidate.experience, target.experience),
  };
  const score = Object.keys(WEIGHTS).reduce((sum, k) => sum + parts[k] * WEIGHTS[k], 0);
  return { score: Math.round(score), breakdown: parts };
};

module.exports = { compatibility, WEIGHTS };