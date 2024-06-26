import React from "react";
import { IconClick, IconFiles } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import "./card.css";

const GenerateCards = ({ cards, col }) => {
  return cards.map((card, index) => {
    return (
      <div key={index} className={`col ${col}`} style={{ padding: "20px" }}>
        <div key={index} className="col-demo">
          {card.to == "" ? (
            <div className="card-demo">
              <div className="card" style={{ height: "400px" }}>
                <div className="card__header">
                  <div style={{ display: "flex" }}>
                    <h3 style={{ paddingRight: "5px" }}>{card.title}</h3>
                    {card.icon}
                  </div>
                </div>
                <div className="card__body">{card.desc}</div>
              </div>
            </div>
          ) : (
            <Link
              key={index}
              to={card.to}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="card-demo">
                <div className="card card-hover">
                  <div className="card__header">
                    <div style={{ display: "flex" }}>
                      <h3 style={{ paddingRight: "5px" }}>{card.title}</h3>
                      {card.icon}
                    </div>
                  </div>
                  <div className="card__body">{card.desc}</div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    );
  });
};

export default function Cards({ cards, col }) {
  return (
    <div className="container">
      <div className="row">
        <GenerateCards cards={cards} col={col} />
      </div>
    </div>
  );
}
