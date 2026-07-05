import React, { useState, useMemo, useEffect, useCallback } from "react";
import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";
import CodeBlock from "@theme/CodeBlock";
import snapshot from "@site/data/packs.snapshot.json";
import PackIcons from "@site/src/components/marketplace/PackIcons";
import Markdown from "@site/src/components/marketplace/Markdown";
import { IconStar, IconCircleCheck, IconLock, IconArrowLeft, IconSearch } from "@tabler/icons-react";
import styles from "@site/src/components/marketplace/marketplace.module.css";

const CATEGORIES = {
  "ai-and-agents": ["AI & Agents", "#8b5cf6"],
  "backend-and-apis": ["Backend & APIs", "#3b82f6"],
  "data-and-analytics": ["Data & Analytics", "#06b6d4"],
  "engineering-and-devops": ["Engineering & DevOps", "#10b981"],
  "security-and-compliance": ["Security & Compliance", "#ef4444"],
  "operations": ["Operations", "#f59e0b"],
  "sales-and-crm": ["Sales & CRM", "#ec4899"],
  "marketing": ["Marketing", "#f97316"],
  "customer-support": ["Customer Support", "#14b8a6"],
  "finance-and-commerce": ["Finance & Commerce", "#22c55e"],
  "productivity": ["Productivity", "#a855f7"],
  "utilities": ["Utilities", "#64748b"],
};
const catLabel = (s) => CATEGORIES[s]?.[0] ?? s;
const catHex = (s) => CATEGORIES[s]?.[1] ?? "#64748b";
const APP = "https://app.airpipe.io/marketplace";

const PACKS = snapshot.list || [];
const DETAILS = snapshot.details || {};

function decodeB64(b64) {
  try {
    return new TextDecoder().decode(Uint8Array.from(atob(b64 || ""), (c) => c.charCodeAt(0)));
  } catch {
    return "";
  }
}
const isYaml = (n) => /\.ya?ml$/i.test(n || "");
const langOf = (n) =>
  isYaml(n) ? "yaml" : /\.sql$/i.test(n) ? "sql" : /\.json$/i.test(n) ? "json" : /\.md$/i.test(n) ? "markdown" : "text";

function readmeOf(detail) {
  if (detail?.readme_content) return detail.readme_content;
  const f = (detail?.files || []).find((x) => x.filename?.toLowerCase() === "readme.md");
  return f ? decodeB64(f.content) : "";
}
// Strip the leading "# Title" + Category/Tags meta lines (we render our own header).
function cleanReadme(md, name) {
  const lines = (md || "").replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let droppedH1 = false;
  for (const line of lines) {
    if (!droppedH1 && /^#\s+\S/.test(line)) { droppedH1 = true; continue; }
    if (/^\s*\*\*(Category|Tags)\s*:\*\*/i.test(line)) continue;
    out.push(line);
  }
  return out.join("\n").replace(/^\n+/, "").trimEnd();
}

function Badges({ pack }) {
  return (
    <div className={styles.badges}>
      {pack.is_featured ? (
        <span className={styles.badgeFeatured}><IconStar size={13} /> Featured</span>
      ) : null}
      {pack.is_verified ? (
        <span className={styles.badgeVerified}><IconCircleCheck size={13} /> Verified</span>
      ) : null}
      {pack.self_hosted_only ? (
        <span className={styles.badgeSelfHosted}><IconLock size={13} /> Self-hosted</span>
      ) : null}
    </div>
  );
}

function PackCard({ pack, onOpen }) {
  return (
    <button className={styles.card} onClick={() => onOpen(pack.slug)}>
      <div className={styles.cardTop}>
        <PackIcons name={pack.name} tags={pack.tags} size={34} />
        <Badges pack={pack} />
      </div>
      <h3 className={styles.cardTitle}>{pack.name}</h3>
      <p className={styles.cardDesc}>{pack.description}</p>
      <span
        className={styles.catBadge}
        style={{ background: `${catHex(pack.primary_category)}22`, color: catHex(pack.primary_category), borderColor: `${catHex(pack.primary_category)}55` }}
      >
        {catLabel(pack.primary_category)}
      </span>
    </button>
  );
}

function Gallery({ onOpen }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = PACKS.filter((p) => {
      if (cat !== "All" && p.primary_category !== cat) return false;
      if (!query) return true;
      const hay = `${p.name} ${p.description} ${(p.tags || []).join(" ")}`.toLowerCase();
      return hay.includes(query);
    });
    return list.sort(
      (a, b) =>
        (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) ||
        Number(b.total_installs || 0) - Number(a.total_installs || 0) ||
        a.name.localeCompare(b.name)
    );
  }, [q, cat]);

  const cats = useMemo(() => {
    const counts = {};
    for (const p of PACKS) counts[p.primary_category] = (counts[p.primary_category] || 0) + 1;
    return Object.keys(CATEGORIES).filter((c) => counts[c]).map((c) => [c, counts[c]]);
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <h1 className={styles.h1}>Marketplace</h1>
        <p className={styles.sub}>
          {PACKS.length} ready-to-deploy Air Pipe configurations. Preview the workflow, README and YAML — then deploy in one click.
        </p>
        <div className={styles.searchBox}>
          <IconSearch size={18} />
          <input
            className={styles.search}
            placeholder="Search packs…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.chips}>
        <button className={cat === "All" ? styles.chipActive : styles.chip} onClick={() => setCat("All")}>
          All <span className={styles.chipCount}>{PACKS.length}</span>
        </button>
        {cats.map(([c, n]) => (
          <button key={c} className={cat === c ? styles.chipActive : styles.chip} onClick={() => setCat(c)}>
            {catLabel(c)} <span className={styles.chipCount}>{n}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No packs match “{q}”.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p) => (
            <PackCard key={p.slug} pack={p} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ slug, onBack }) {
  const [tab, setTab] = useState("overview");
  const pack = PACKS.find((p) => p.slug === slug);
  const detail = DETAILS[slug];
  const packUrl = `${APP}?pack=${encodeURIComponent(slug)}`;

  const { readme, ymlFiles, otherFiles } = useMemo(() => {
    const files = detail?.files || [];
    return {
      readme: cleanReadme(readmeOf(detail), pack?.name),
      ymlFiles: files.filter((f) => isYaml(f.filename)),
      otherFiles: files.filter((f) => !isYaml(f.filename) && f.filename?.toLowerCase() !== "readme.md"),
    };
  }, [detail, pack]);

  if (!pack || !detail) {
    return (
      <div className={styles.wrap}>
        <button className={styles.back} onClick={() => onBack()}><IconArrowLeft size={16} /> Back</button>
        <p className={styles.empty}>Pack not found.</p>
      </div>
    );
  }

  const configFiles = [...ymlFiles, ...otherFiles];

  return (
    <div className={styles.wrap}>
      <button className={styles.back} onClick={() => onBack()}><IconArrowLeft size={16} /> All packs</button>

      <div className={styles.detailHead}>
        <PackIcons name={pack.name} tags={pack.tags} size={48} />
        <div style={{ flex: 1 }}>
          <div className={styles.detailTitleRow}>
            <h1 className={styles.h1} style={{ margin: 0 }}>{pack.name}</h1>
            <Badges pack={pack} />
          </div>
          <p className={styles.sub} style={{ margin: "0.4rem 0 0" }}>{pack.description}</p>
          <div className={styles.meta}>
            <span className={styles.catBadge} style={{ background: `${catHex(pack.primary_category)}22`, color: catHex(pack.primary_category), borderColor: `${catHex(pack.primary_category)}55` }}>
              {catLabel(pack.primary_category)}
            </span>
            {(pack.tags || []).slice(0, 6).map((t) => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
          </div>
        </div>
        <a className="button button--primary button--lg" href={packUrl} target="_blank" rel="noopener noreferrer">
          Get this pack →
        </a>
      </div>

      <div className={styles.tabs}>
        {["overview", "workflow", "config"].map((t) => (
          <button key={t} className={tab === t ? styles.tabActive : styles.tab} onClick={() => setTab(t)}>
            {t === "overview" ? "Overview" : t === "workflow" ? "Workflow" : "Config"}
          </button>
        ))}
      </div>

      {tab === "overview" && <Markdown>{readme}</Markdown>}

      {tab === "workflow" && (
        <div>
          {ymlFiles.length === 0 ? (
            <p className={styles.empty}>No config files to visualize.</p>
          ) : (
            ymlFiles.map((f) => (
              <div key={f.filename} style={{ marginBottom: "1.5rem" }}>
                <div className={styles.fileName}>{f.filename}</div>
                <BrowserOnly fallback={<div className={styles.flowSkeleton}>Loading workflow…</div>}>
                  {() => {
                    const PackFlow = require("@site/src/components/marketplace/PackFlow").default;
                    return <PackFlow yaml={decodeB64(f.content)} />;
                  }}
                </BrowserOnly>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "config" && (
        <div>
          {configFiles.map((f) => (
            <div key={f.filename} style={{ marginBottom: "1rem" }}>
              <CodeBlock language={langOf(f.filename)} title={f.filename}>
                {decodeB64(f.content)}
              </CodeBlock>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    const read = () => setSlug(new URLSearchParams(window.location.search).get("pack"));
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  const open = useCallback((s) => {
    const url = s ? `?pack=${encodeURIComponent(s)}` : window.location.pathname;
    window.history.pushState({}, "", url);
    setSlug(s || null);
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout title="Marketplace" description="Browse ready-to-deploy Air Pipe configurations — preview the workflow, README and YAML.">
      {slug ? <Detail slug={slug} onBack={() => open(null)} /> : <Gallery onOpen={open} />}
    </Layout>
  );
}
