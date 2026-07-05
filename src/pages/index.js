import clsx from "clsx";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import styles from "./index.module.css";
import ReactRotatingText from "react-rotating-text";
import Dots from "./dots";

const ROTATING = [
  "APIs",
  "workflows",
  "AI agents",
  "MCP servers",
  "RAG chatbots",
  "integrations",
  "backend services",
];

const BUILD = [
  {
    title: "REST API over your database",
    to: "/docs/examples/marketplace/rest-api-starter",
    desc: "CRUD endpoints over Postgres with auth and seed data.",
  },
  {
    title: "RAG chatbot",
    to: "/docs/examples/marketplace/rag-chatbot",
    desc: "Postgres + pgvector + embeddings, retrieval and chat.",
  },
  {
    title: "MCP server",
    to: "/docs/examples/marketplace/mcp-postgres-starter",
    desc: "Expose your data as tools an AI agent can call.",
  },
  {
    title: "LLM gateway",
    to: "/docs/examples/marketplace/llm-gateway",
    desc: "A configurable completion + moderation endpoint.",
  },
  {
    title: "Stripe & webhooks",
    to: "/docs/examples/marketplace/stripe-webhooks-db-slack",
    desc: "Verify signatures, store events, notify Slack.",
  },
  {
    title: "Durable API polling",
    to: "/docs/examples/marketplace/durable-api-polling",
    desc: "Cursor state, dedupe and retries on a schedule.",
  },
];

function HomepageHeader() {
  return (
    <header className={clsx("hero", styles.heroBanner)}>
      <Dots className={styles.dots} style={{ left: 0, top: 0 }} />
      <Dots className={styles.dots} style={{ left: 60, top: 0 }} />
      <Dots className={styles.dots} style={{ left: 0, top: 140 }} />
      <Dots className={styles.dots} style={{ right: 0, top: 60 }} />
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          <span>Ship </span>
          <ReactRotatingText items={ROTATING} />
          <br />
          you can <span className={styles.highlight}>actually see</span>.
        </Heading>
        <p className={styles.heroSubtitle}>
          Build from a prompt or by hand — and go live in seconds. Every endpoint
          ships with tracing, metrics, and OpenAPI docs generated automatically.
          No black boxes.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="https://app.airpipe.io/register"
          >
            ✨ Start with a prompt
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/tutorial/setup"
          >
            Start with YAML
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/marketplace"
          >
            Browse the marketplace
          </Link>
        </div>
        <p className={styles.heroFootnote}>
          Describe it in plain English, write the config by hand, or fork a
          marketplace pack. No card required.
        </p>
      </div>
    </header>
  );
}

function BuildStrip() {
  return (
    <section className={styles.buildSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          What you can build
        </Heading>
        <p className={styles.sectionSubtitle}>
          Start from a ready-to-deploy pack in the marketplace, then make it yours.
        </p>
        <div className="row">
          {BUILD.map((b, i) => (
            <div className="col col--4" key={i} style={{ marginBottom: "1.5rem" }}>
              <Link to={b.to.replace("/docs/examples/marketplace/", "/marketplace?pack=")} className={styles.buildCard}>
                <h3 className={styles.buildTitle}>{b.title}</h3>
                <p className={styles.buildDesc}>{b.desc}</p>
              </Link>
            </div>
          ))}
        </div>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/marketplace"
          >
            See all packs →
          </Link>
        </div>
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className={styles.closing}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Ship your first API in five minutes
        </Heading>
        <p className={styles.sectionSubtitle}>
          No credit card required. Managed or self-hosted.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="https://app.airpipe.io/register"
          >
            Start building — free
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="Air Pipe — Ship APIs, workflows & AI agents you can actually see"
      description="Build APIs, workflows, MCP servers and integrations from a prompt or by hand. Every endpoint ships with tracing, metrics and OpenAPI docs automatically. Managed or self-hosted."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <BuildStrip />
        <ClosingCTA />
      </main>
    </Layout>
  );
}
