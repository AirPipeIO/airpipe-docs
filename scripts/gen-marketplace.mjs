#!/usr/bin/env node
// Generate the Examples > Marketplace docs from data/packs.snapshot.json.
//
//   npm run gen:marketplace   (also runs via prestart/prebuild)
//
// Output: docs/examples/marketplace/<category>/<slug>.md  (+ per-category
// _category_.json and an index.md). Pages are .md (not .mdx) so Docusaurus
// parses them as CommonMark (markdown.format: 'detect') -- pack READMEs are
// external content full of `{` and `<` that would break the MDX parser.
//
// Snapshot shape (see refresh-snapshots.mjs):
//   { list: [ {slug,name,description,primary_category,tags,...} ],
//     details: { <slug>: { files: [ {filename,file_type,content(base64)} ], ... } } }

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { Buffer } from "node:buffer";
import { DOCS_DIR, SNAPSHOTS, closeMarkers } from "./lib/sources.mjs";

const OUT_DIR = path.join(DOCS_DIR, "examples", "marketplace");
const APP_MARKETPLACE = "https://app.airpipe.io/marketplace";

// Docs-facing labels + sidebar order for the fixed 12-slug taxonomy.
const CATEGORIES = {
  "ai-and-agents": ["AI & Agents", 1],
  "backend-and-apis": ["Backend & APIs", 2],
  "data-and-analytics": ["Data & Analytics", 3],
  "engineering-and-devops": ["Engineering & DevOps", 4],
  "security-and-compliance": ["Security & Compliance", 5],
  "operations": ["Operations", 6],
  "sales-and-crm": ["Sales & CRM", 7],
  "marketing": ["Marketing", 8],
  "customer-support": ["Customer Support", 9],
  "finance-and-commerce": ["Finance & Commerce", 10],
  "productivity": ["Productivity", 11],
  "utilities": ["Utilities", 12],
};
const catLabel = (slug) => CATEGORIES[slug]?.[0] ?? slug;
const catPos = (slug) => CATEGORIES[slug]?.[1] ?? 99;

const LANG = { yaml: "yaml", yml: "yaml", sql: "sql", json: "json", markdown: "md" };

function decode(b64) {
  return Buffer.from(b64 || "", "base64").toString("utf-8");
}

// YAML frontmatter scalar via JSON (valid YAML for strings/numbers/bools).
const y = (v) => JSON.stringify(v ?? null);

// Strip the leading "# Title" and the "**Category:**"/"**Tags:**" metadata
// lines from a pack README -- we render those ourselves in frontmatter + header.
function cleanReadme(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let droppedH1 = false;
  for (const line of lines) {
    if (!droppedH1 && /^#\s+\S/.test(line)) {
      droppedH1 = true;
      continue;
    }
    if (/^\s*\*\*(Category|Tags)\s*:\*\*/i.test(line)) continue;
    out.push(line);
  }
  return out.join("\n").replace(/^\n+/, "").replace(/\n{3,}/g, "\n\n").trimEnd();
}

function readmeOf(detail) {
  if (detail.readme_content) return detail.readme_content;
  const f = (detail.files || []).find(
    (x) => x.filename?.toLowerCase() === "readme.md"
  );
  return f ? decode(f.content) : "";
}

// Config files worth rendering, in a stable, sensible order.
function configFiles(detail) {
  const files = (detail.files || []).filter(
    (f) => f.filename?.toLowerCase() !== "readme.md"
  );
  const rank = (f) => {
    const n = f.filename.toLowerCase();
    if (n === "config.yml" || n === "config.yaml") return 0;
    if (n.endsWith(".yml") || n.endsWith(".yaml")) return 1;
    if (n.endsWith(".sql")) return 2;
    return 3;
  };
  return files.sort(
    (a, b) => rank(a) - rank(b) || a.filename.localeCompare(b.filename)
  );
}

function badges(row) {
  const b = [`**Category:** ${catLabel(row.primary_category)}`];
  if (row.is_verified) b.push("✅ Verified");
  if (row.is_featured) b.push("⭐ Featured");
  if (row.self_hosted_only) b.push("🔒 Self-hosted only");
  const n = Number(row.total_installs);
  if (n > 0) b.push(`📦 ${n} install${n === 1 ? "" : "s"}`);
  return b.join(" · ");
}

function renderPack(row, detail) {
  const tags = Array.isArray(row.tags) ? row.tags : [];
  const readme = cleanReadme(readmeOf(detail));
  const files = configFiles(detail);
  const packUrl = `${APP_MARKETPLACE}?pack=${encodeURIComponent(row.slug)}`;

  const fm = [
    "---",
    `title: ${y(row.name)}`,
    `description: ${y(row.description)}`,
    `sidebar_label: ${y(row.name)}`,
    `slug: /examples/marketplace/${row.slug}`,
    tags.length ? `tags: [${tags.map((t) => y(t)).join(", ")}]` : null,
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  // NB: the pack description is intentionally NOT repeated here -- the README
  // body (rendered below) already opens with it. It lives in frontmatter for SEO.
  const header = [
    `# ${row.name}`,
    "",
    badges(row),
    "",
    `<a class="button button--primary" href="${packUrl}" target="_blank" rel="noopener noreferrer">Get this pack →</a>`,
    "",
    "> This page is generated from the Air Pipe marketplace. " +
      `[Browse it live](${packUrl}) to install into your organization.`,
  ].join("\n");

  const filesSection = files.length
    ? [
        "",
        "## Configuration",
        "",
        ...files.map((f) => {
          const lang = LANG[(f.file_type || "").toLowerCase()] ||
            LANG[f.filename.split(".").pop().toLowerCase()] ||
            "";
          const body = decode(f.content).trimEnd();
          const note = f.description ? `\n${f.description}\n` : "";
          return `### ${f.filename}${note}\n\n\`\`\`${lang}\n${body}\n\`\`\``;
        }),
      ].join("\n")
    : "";

  // Frontmatter stays verbatim; normalize deprecated open-form markers in the
  // body (README + rendered config files) to the closed `a|…|` form.
  return [fm, "", closeMarkers([header, "", readme, filesSection, ""].join("\n"))].join("\n");
}

function renderIndex(byCat) {
  const lines = [
    "---",
    "title: Marketplace Examples",
    "description: Ready-to-deploy Air Pipe configurations from the marketplace.",
    "slug: /examples/marketplace",
    "---",
    "",
    "# Marketplace Examples",
    "",
    "Production-ready Air Pipe configurations you can deploy in one click. " +
      "Every example below is a live marketplace pack — browse and install them at " +
      `[app.airpipe.io/marketplace](${APP_MARKETPLACE}).`,
    "",
  ];
  for (const cat of Object.keys(CATEGORIES)) {
    const packs = byCat.get(cat);
    if (!packs || !packs.length) continue;
    lines.push(`## ${catLabel(cat)}`, "");
    for (const row of packs.sort((a, b) => a.name.localeCompare(b.name))) {
      // Relative file link -> Docusaurus resolves to the real URL regardless
      // of routeBasePath. Avoids hardcoding the /docs prefix.
      lines.push(
        `- [${row.name}](./${cat}/${row.slug}.md) — ${row.description || ""}`
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  const snap = JSON.parse(await readFile(SNAPSHOTS.packs, "utf-8"));
  const { list, details } = snap;

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const byCat = new Map();
  for (const row of list) {
    (byCat.get(row.primary_category) ??
      byCat.set(row.primary_category, []).get(row.primary_category)).push(row);
  }

  let written = 0;
  for (const [cat, packs] of byCat) {
    const dir = path.join(OUT_DIR, cat);
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, "_category_.json"),
      JSON.stringify(
        { label: catLabel(cat), position: catPos(cat), collapsed: true },
        null,
        2
      ) + "\n"
    );
    for (const row of packs) {
      const detail = details[row.slug];
      if (!detail) {
        console.warn(`  ! no detail for ${row.slug}, skipping`);
        continue;
      }
      await writeFile(path.join(dir, `${row.slug}.md`), renderPack(row, detail));
      written++;
    }
  }

  await writeFile(path.join(OUT_DIR, "index.md"), renderIndex(byCat));
  console.log(
    `gen:marketplace -> ${written} packs across ${byCat.size} categories in ${path.relative(
      process.cwd(),
      OUT_DIR
    )}`
  );
}

main().catch((err) => {
  console.error("gen:marketplace failed:", err);
  process.exit(1);
});
