#!/usr/bin/env node
// Generate the Configuration Reference from data/schema.snapshot.json.
//
//   npm run gen:config   (also runs via prestart/prebuild)
//
// The snapshot is `schema_for!(IntegrationConfig)` from the Air Pipe engine
// (schemars, JSON Schema draft 2020-12). Rust `///` doc-comments come through
// as `description`; `#[schemars(skip)]` fields are already absent. We render
// each named type ($def) as a section with a field table, grouped into pages.
//
// Output: docs/configuration/reference/*.md  (CommonMark via markdown.format
// 'detect' -- descriptions contain `{`/`<` from YAML examples).

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { DOCS_DIR, SNAPSHOTS } from "./lib/sources.mjs";

const OUT_DIR = path.join(DOCS_DIR, "reference");

// Which $def lives on which page, in sidebar order. Anything unmapped falls
// through to the "other-types" page (and is logged, so the map stays honest).
const PAGES = [
  { file: "01-configuration", title: "Configuration structure", root: true, defs: [] },
  {
    file: "02-interfaces",
    title: "Interfaces",
    defs: ["Interface", "InterfaceResponse", "InterfaceLog", "InterfaceLogOn",
      "InterfaceOutput", "ErrorFallbackStrategy", "McpTool", "Param", "Schedule"],
  },
  {
    file: "03-actions",
    title: "Actions & workflow control",
    defs: ["Action", "ActionResponse", "Retry", "LogMessage", "RunCondition",
      "RunOnConfig", "ConditionalInput", "ConditionalInputConfig"],
  },
  {
    file: "04-inputs-http",
    title: "HTTP requests",
    defs: ["HttpRequest", "Pagination", "MultipartPart", "MultipartData",
      "MultipartFile", "MultipartText", "ProxyHeaders"],
  },
  {
    file: "05-inputs-command",
    title: "Command execution",
    defs: ["CommandRun", "CommandParse", "CommandRegex"],
  },
  {
    file: "06-inputs-database",
    title: "Databases",
    defs: ["Database", "DocumentOperation"],
  },
  {
    file: "07-inputs-cloud",
    title: "Cloud (Google & AWS)",
    defs: ["Google", "GoogleGetSignedUploadUrl", "GoogleUploadObject", "CreateToken",
      "Aws", "AwsGetSignedUploadUrl", "AwsUploadObject"],
  },
  {
    file: "08-inputs-email",
    title: "Email",
    defs: ["Email", "EmailSmtp"],
  },
  {
    file: "09-state",
    title: "Durable state",
    defs: ["StateAction", "StateGet", "StateSet", "StateSeen"],
  },
  {
    file: "10-metrics",
    title: "Metrics",
    defs: ["EmitMetric", "MetricType"],
  },
  {
    file: "11-transforms",
    title: "Transforms",
    defs: ["Transform", "TransformConfig", "CustomTransform", "TransformExtractArray",
      "TransformFilterSearch", "TransformFlatten", "TransformMath", "TransformPasswordGen",
      "TransformReplaceValues", "BcryptTransform", "AddJWT", "ReadJWT", "EncryptValue",
      "GenerateBytes", "ExtractWithRegex", "S3GeneratePresignedURL", "MathEvalType", "DataType"],
  },
  {
    file: "12-asserts",
    title: "Asserts & tests",
    defs: ["Assert", "Test", "ContainOptions", "ContainsAny", "ContainsAdv", "JwtConfig",
      "JwtVerifyConfig", "IsValidHmacConfig", "CompareValue", "CompareDataType",
      "VerifySignature", "VerifySchema", "ValueType", "FieldType"],
  },
  {
    file: "13-network",
    title: "Network access control",
    defs: ["NetworkPolicy", "NetworkMode", "IpRule", "IpFilterSource", "DenyCheckMode",
      "GeoRule", "AsnRule", "RateLimitRule", "RateLimitScope", "DenyResponse"],
  },
  {
    file: "14-globals",
    title: "Globals, secrets & credentials",
    defs: ["GlobalConfig", "Secret", "SecretKind", "SecretFormat", "CustomLog",
      "AwsCredential", "GoogleCredential"],
  },
  { file: "99-other-types", title: "Other types", defs: [] },
];

const y = (v) => JSON.stringify(v ?? null);
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// Explicit, collision-proof heading id for a type (page H1 titles never use
// this prefix, so e.g. the "Email" page title can't clash with the Email type).
const anchorId = (name) => `type-${slug(name)}`;

// --- schema helpers -------------------------------------------------------

let DEFS = {};
let DEF_TO_FILE = {}; // defName -> page file base

const refName = (node) =>
  node && node.$ref ? node.$ref.replace(/^#\/\$defs\//, "") : null;

// Link to a type's section, same-page anchor or relative cross-page .md link.
function typeLink(name, currentFile) {
  if (!DEFS[name]) return `\`${name}\``;
  const file = DEF_TO_FILE[name];
  const anchor = `#${anchorId(name)}`;
  const target = file === currentFile ? anchor : `./${file}.md${anchor}`;
  return `[${name}](${target})`;
}

// Render a JSON-schema node as a human type string (may contain markdown links).
function typeStr(node, currentFile) {
  if (!node || typeof node !== "object") return "any";
  if (node.$ref) return typeLink(refName(node), currentFile);

  const union = node.anyOf || node.oneOf;
  if (union) {
    const members = union.filter(
      (m) => !(m.type === "null" || (Array.isArray(m.type) && m.type.includes("null") && Object.keys(m).length === 1))
    );
    const rendered = members.map((m) => typeStr(m, currentFile));
    const uniq = [...new Set(rendered)];
    return uniq.join(" | ") || "null";
  }

  let t = node.type;
  if (Array.isArray(t)) t = t.filter((x) => x !== "null"); // drop null; nullability handled by caller
  const base = Array.isArray(t) ? t[0] : t;

  if (node.enum) return node.enum.map((v) => `\`${v}\``).join(" | ");

  if (base === "array") {
    return `Array&lt;${node.items ? typeStr(node.items, currentFile) : "any"}&gt;`;
  }
  if (base === "object") {
    const ap = node.additionalProperties;
    if (ap && typeof ap === "object") return `Map&lt;string, ${typeStr(ap, currentFile)}&gt;`;
    return "object";
  }
  if (base === "integer" || base === "number") return "number";
  if (base === "string" || base === "boolean") return base;
  return base || "any";
}

const isNullable = (node) => {
  if (Array.isArray(node.type) && node.type.includes("null")) return true;
  const union = node.anyOf || node.oneOf;
  if (union) return union.some((m) => m.type === "null");
  return false;
};

// Escape a string for a single markdown table cell.
function cell(s) {
  return String(s).replace(/\r?\n+/g, " ").replace(/\|/g, "\\|").trim();
}

// Short one-line summary for a table: description up to the first heading/example.
function summarize(desc) {
  if (!desc) return "";
  let s = desc.split(/\n#{1,6}\s|\n```|\n## Example/)[0];
  s = s.replace(/\r?\n+/g, " ").trim();
  if (s.length > 180) s = s.slice(0, 177).replace(/\s+\S*$/, "") + "…";
  return s;
}

// Full def-level description, safe to render as prose: demote headings to bold
// so `## Example` inside a doc-comment doesn't pollute the page TOC.
function proseDescription(desc) {
  if (!desc) return "";
  return desc
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/^(#{1,6})\s+(.*)$/, "**$2**"))
    .join("\n")
    .trim();
}

// --- rendering ------------------------------------------------------------

function renderFieldsTable(schema, currentFile) {
  const props = schema.properties || {};
  const required = new Set(schema.required || []);
  const names = Object.keys(props);
  if (!names.length) return "";
  const rows = names.map((name) => {
    const p = props[name];
    let type = typeStr(p, currentFile);
    if (isNullable(p) && !/\|/.test(type)) type += " *(nullable)*";
    let desc = summarize(p.description);
    if (required.has(name)) desc = `**Required.** ${desc}`.trim();
    if (p.default !== undefined) desc += ` Default: \`${JSON.stringify(p.default)}\`.`;
    if (p.enum) desc += ` One of: ${p.enum.map((v) => `\`${v}\``).join(", ")}.`;
    return `| \`${name}\` | ${cell(type)} | ${cell(desc)} |`;
  });
  return ["| Field | Type | Description |", "|---|---|---|", ...rows].join("\n");
}

// One bullet in a "One of:" list. Externally-tagged Rust enum variants look
// like { type:object, properties:{ <tag>: <inner> }, required:[<tag>] } -- for
// those, show `tag` -> inner type + the variant's own doc summary.
function renderUnionMember(m, currentFile) {
  const req = m.required || [];
  if (m.type === "object" && m.properties && req.length === 1 && m.properties[req[0]]) {
    const tag = req[0];
    const inner = typeStr(m.properties[tag], currentFile);
    const s = summarize(m.description);
    return `\`${tag}\` → ${inner}${s ? ` — ${s}` : ""}`;
  }
  const s = summarize(m.description);
  return `${typeStr(m, currentFile)}${s ? ` — ${s}` : ""}`;
}

function renderDef(name, currentFile) {
  const d = DEFS[name];
  const out = [`## ${name} {#${anchorId(name)}}`, ""];
  if (d.description) out.push(proseDescription(d.description), "");

  // Enum type
  if (d.enum && !d.properties) {
    out.push(`**Type:** \`string\` — one of: ${d.enum.map((v) => `\`${v}\``).join(", ")}`, "");
    return out.join("\n");
  }

  // Union type (tagged or untagged enum in Rust): anyOf / oneOf
  const union = d.anyOf || d.oneOf;
  if (union && !d.properties) {
    const members = union
      .filter((m) => m.type !== "null")
      .map((m) => `- ${renderUnionMember(m, currentFile)}`);
    out.push("**One of:**", "", ...members, "");
    return out.join("\n");
  }

  const table = renderFieldsTable(d, currentFile);
  if (table) out.push(table, "");
  else out.push("_No configurable fields._", "");
  return out.join("\n");
}

function renderPage(page, index) {
  const fm = [
    "---",
    `title: ${y(page.title)}`,
    `sidebar_label: ${y(page.title)}`,
    "---",
    "",
  ].join("\n");

  const parts = [fm, `# ${page.title}`, ""];

  if (page.root) {
    const root = ROOT;
    if (root.description) parts.push(proseDescription(root.description), "");
    parts.push("## Top-level fields", "");
    parts.push(renderFieldsTable(root, page.file), "");
    parts.push(
      "Each section below documents a named type referenced from this structure. " +
        "This reference is generated from the live config schema " +
        "(`https://api.airpipe.io/config/schema`).",
      ""
    );
  }

  for (const name of page.defs) {
    if (!DEFS[name]) {
      console.warn(`  ! def "${name}" not in schema (page ${page.file})`);
      continue;
    }
    parts.push(renderDef(name, page.file), "");
  }
  return parts.join("\n");
}

// --- main -----------------------------------------------------------------

let ROOT = {};

async function main() {
  const schema = JSON.parse(await readFile(SNAPSHOTS.schema, "utf-8"));
  DEFS = schema.$defs || {};
  ROOT = schema;

  // Assign every def to a page; collect leftovers into "other-types".
  const mapped = new Set();
  for (const page of PAGES) {
    for (const name of page.defs) {
      DEF_TO_FILE[name] = page.file;
      mapped.add(name);
    }
  }
  const other = PAGES.find((p) => p.file === "99-other-types");
  for (const name of Object.keys(DEFS)) {
    if (!mapped.has(name)) {
      other.defs.push(name);
      DEF_TO_FILE[name] = other.file;
    }
  }
  if (other.defs.length) console.log(`  other-types: ${other.defs.join(", ")}`);

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  await writeFile(
    path.join(OUT_DIR, "_category_.json"),
    JSON.stringify(
      { label: "Reference", position: 1, collapsed: false,
        link: { type: "generated-index", title: "Configuration Reference",
          description: "Every field of the Air Pipe config, generated from the live schema." } },
      null, 2
    ) + "\n"
  );

  let n = 0;
  for (let i = 0; i < PAGES.length; i++) {
    const page = PAGES[i];
    if (!page.root && !page.defs.length) continue;
    await writeFile(path.join(OUT_DIR, `${page.file}.md`), renderPage(page, i));
    n++;
  }
  console.log(
    `gen:config -> ${n} pages, ${Object.keys(DEFS).length} types in ${path.relative(
      process.cwd(),
      OUT_DIR
    )}`
  );
}

main().catch((err) => {
  console.error("gen:config failed:", err);
  process.exit(1);
});
