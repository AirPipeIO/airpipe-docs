import clsx from "clsx";
import Heading from "@theme/Heading";
import { IconCode, IconBolt, IconServer2 } from "@tabler/icons-react";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Zero Code",
    Icon: IconCode,
    description: (
      <>Define APIs, integrations & workflows declaratively in a single YAML file.</>
    ),
  },
  {
    title: "High Performance",
    Icon: IconBolt,
    description: (
      <>
        Build performant, fully functional APIs, integrations & workflows faster
        than ever.
      </>
    ),
  },
  {
    title: "Managed or Self Hosted",
    Icon: IconServer2,
    description: (
      <>
        <b>Run anywhere</b> — managed by us, or self-hosted on your own
        infrastructure, host or container.
      </>
    ),
  },
];

function Feature({ Icon, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <span className={styles.featureIcon}>
          <Icon size={32} stroke={1.6} />
        </span>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
