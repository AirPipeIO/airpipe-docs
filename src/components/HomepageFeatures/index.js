import clsx from "clsx";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import {
  IconSparkles,
  IconPlugConnected,
  IconFileText,
  IconChartHistogram,
  IconChartDots,
  IconDatabase,
  IconClock,
  IconShieldLock,
} from "@tabler/icons-react";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Build with AI",
    Icon: IconSparkles,
    to: "/docs/features/build-with-ai",
    description:
      "Describe an API in plain English and get a validated, deployable config — or drive Air Pipe from your own AI client over MCP.",
  },
  {
    title: "MCP tools",
    Icon: IconPlugConnected,
    to: "/docs/configuration/mcp-tools",
    description:
      "Expose any interface as a Model Context Protocol tool so AI agents can call your API directly.",
  },
  {
    title: "OpenAPI docs",
    Icon: IconFileText,
    to: "/docs/features/openapi",
    description:
      "Flip on docs: true and get an OpenAPI 3.0 spec plus Swagger UI generated from your config — no annotations.",
  },
  {
    title: "Metrics",
    Icon: IconChartHistogram,
    to: "/docs/configuration/metrics",
    description:
      "A Prometheus /metrics endpoint with per-interface and per-action metrics, plus custom counters and gauges.",
  },
  {
    title: "Observability",
    Icon: IconChartDots,
    to: "/docs/otel-tracing",
    description:
      "Zero-code OpenTelemetry tracing across every request, action and lookup. No black boxes.",
  },
  {
    title: "Durable state",
    Icon: IconDatabase,
    to: "/docs/configuration/state",
    description:
      "Persistent key/value for cursors, dedupe sets and counters — read inline with a|state::key|.",
  },
  {
    title: "Scheduling",
    Icon: IconClock,
    to: "/docs/configuration/scheduling",
    description:
      "Run any interface on a cron schedule with timezones and retry backoff.",
  },
  {
    title: "Access control",
    Icon: IconShieldLock,
    to: "/docs/configuration/access-control",
    description:
      "IP, geo, ASN and rate-limit policies per config or per interface, in enforce or monitor mode.",
  },
];

function Feature({ Icon, title, description, to }) {
  return (
    <div className={clsx("col col--3", styles.featureCol)}>
      <Link to={to} className={styles.featureCard}>
        <span className={styles.featureIcon}>
          <Icon size={26} stroke={1.6} />
        </span>
        <Heading as="h3" className={styles.featureTitle}>
          {title}
        </Heading>
        <p className={styles.featureDesc}>{description}</p>
      </Link>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Everything ships built in
        </Heading>
        <p className={styles.sectionSubtitle}>
          Air Pipe turns a single config into a running API — with the platform
          features you'd otherwise wire up yourself.
        </p>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
