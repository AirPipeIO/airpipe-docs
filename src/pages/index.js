import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import styles from "./index.module.css";
import ReactRotatingText from "react-rotating-text";
import Dots from "./dots";
function HomepageHeader() {
  const words = ["APIs", "automations", "integrations", "workflows"];
  const originalSentence = "Build high performance";
  const { siteConfig } = useDocusaurusContext();
  return (
    <header
      className={clsx("hero hero--primary", styles.heroBanner, styles.wrapper)}
    >
      <Dots className={styles.dots} style={{ left: 0, top: 0 }} />
      <Dots className={styles.dots} style={{ left: 60, top: 0 }} />
      <Dots className={styles.dots} style={{ left: 0, top: 140 }} />
      <Dots className={styles.dots} style={{ right: 0, top: 60 }} />
      <div className="container">
        <Heading as="h1" className="hero__title">
          <div style={{ color: "white" }}>{originalSentence}</div>

          <ReactRotatingText style={{ color: "#228BE6" }} items={words} />
        </Heading>

        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/">
            Air Pipe Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`v1`}
      description="Description will go into a meta tag in <head />"
      className={styles.wrapper}
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
