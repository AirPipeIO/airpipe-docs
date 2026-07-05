// Shared config for the docs generation harness.
//
// Two-stage design:
//   1. `npm run gen:refresh` hits the live Air Pipe APIs and writes the
//      snapshot files under data/. Those snapshots are committed to git.
//   2. `npm run gen` (wired into prestart/prebuild) reads ONLY the snapshots
//      and emits MDX. No network access at build time -> deterministic,
//      offline, CI-safe. Live-source changes reach the docs whenever the
//      snapshots are refreshed (locally or on a schedule in CI).
//
// The API envelopes mirror Air Pipe's own action model: every response is
// `{ data: { <ActionName>: { "time.ms", data } } }`. The paths below encode
// where the useful payload actually lives.

import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(here, "..", "..");
export const DATA_DIR = path.join(REPO_ROOT, "data");
export const DOCS_DIR = path.join(REPO_ROOT, "docs");

export const API_BASE = process.env.AIRPIPE_API || "https://api.airpipe.io";

export const SNAPSHOTS = {
  schema: path.join(DATA_DIR, "schema.snapshot.json"),
  packs: path.join(DATA_DIR, "packs.snapshot.json"),
};

// Live endpoints used by refresh-snapshots.mjs only.
export const ENDPOINTS = {
  schema: `${API_BASE}/config/schema`,
  packsList: `${API_BASE}/accounts/marketplace/public/packs?limit=200`,
  packDetail: (slug) =>
    `${API_BASE}/accounts/marketplace/public/pack?slug=${encodeURIComponent(slug)}`,
};

// Pull the payload out of an Air Pipe action envelope: data.<action>.data
export function unwrap(envelope, action) {
  const node = envelope?.data?.[action];
  if (!node) {
    throw new Error(
      `expected action "${action}" in response envelope; got keys: ${Object.keys(
        envelope?.data || {}
      ).join(", ")}`
    );
  }
  return node.data;
}
