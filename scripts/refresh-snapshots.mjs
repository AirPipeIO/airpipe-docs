#!/usr/bin/env node
// Refresh the committed data/*.snapshot.json files from the live Air Pipe APIs.
//
//   npm run gen:refresh
//
// Run this whenever the config schema or marketplace changes, then commit the
// updated snapshots. The build (`npm run gen`) never calls the network; it only
// reads these snapshots.

import { writeFile, mkdir } from "node:fs/promises";
import { DATA_DIR, SNAPSHOTS, ENDPOINTS, unwrap } from "./lib/sources.mjs";

const TIMEOUT_MS = 30_000;

async function getJson(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { accept: "application/json" },
    });
    // The schema endpoint currently answers 202; accept any 2xx.
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`GET ${url} -> HTTP ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

async function refreshSchema() {
  const env = await getJson(ENDPOINTS.schema);
  const schema = env?.schema ?? env;
  if (!schema?.$defs) throw new Error("schema response missing $defs");
  await writeFile(SNAPSHOTS.schema, JSON.stringify(schema, null, 2) + "\n");
  console.log(`  schema: ${Object.keys(schema.$defs).length} $defs`);
}

async function refreshPacks() {
  const listEnv = await getJson(ENDPOINTS.packsList);
  const list = unwrap(listEnv, "List");
  if (!Array.isArray(list)) throw new Error("packs list payload is not an array");

  // Fetch each pack's detail (README + file contents) so the build stays offline.
  const details = {};
  for (const row of list) {
    const detailEnv = await getJson(ENDPOINTS.packDetail(row.slug));
    details[row.slug] = unwrap(detailEnv, "GetPack");
    process.stdout.write(".");
  }
  process.stdout.write("\n");

  const snapshot = {
    fetched_endpoint: ENDPOINTS.packsList,
    count: list.length,
    list,
    details,
  };
  await writeFile(SNAPSHOTS.packs, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`  packs: ${list.length} packs with details`);
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });
  console.log("Refreshing snapshots from live APIs...");
  await refreshSchema();
  await refreshPacks();
  console.log("Done. Commit the updated data/*.snapshot.json files.");
}

main().catch((err) => {
  console.error("refresh failed:", err.message);
  console.error("(snapshots left unchanged; build will use existing ones)");
  process.exit(1);
});
