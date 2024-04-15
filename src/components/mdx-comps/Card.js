import React from "react";
import { IconClick, IconFiles } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import "./card.css";
const cards = [
  {
    title: "Getting Started",
    to: "/docs/getting-started",
    desc: "Get up and running in 5 minutes",
    icon: <IconClick color="#007bff" />,
  },
  {
    title: "Configuration",
    to: "/docs/configuration",
    desc: "Learn the all features needed to create configuration files",
    icon: <IconFiles color="#007bff" />,
  },
  {
    title: "Examples",
    to: "/docs/examples/http-example",
    desc: "Built by Air Pipe and the community",
    icon: <IconFiles color="#007bff" />,
  },
];
const GenerateCards = () => {
  return cards.map((card, index) => {
    return (
      <div className="col col--6" style={{ padding: "20px" }}>
        <div className="col-demo">
          <Link
            key={index}
            to={card.to}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="card-demo">
              <div className="card">
                <div className="card__header">
                  <div style={{ display: "flex" }}>
                    <h3 style={{ paddingRight: "5px" }}>{card.title}</h3>
                    {card.icon}
                  </div>
                </div>
                <div className="card__body">
                  <p>{card.desc}</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  });
};

export default function BasicCard() {
  return (
    <div className="container">
      <div className="row">
        <GenerateCards />
      </div>
    </div>
  );
}
