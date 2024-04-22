import React from "react";
import { IconClick, IconFiles } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export default function Paper() {
  return (
    <div class="hero shadow--lw" style={{ backgroundColor: "dark-grey" }}>
      <div class="container">
        <h1 class="hero__title">Linux</h1>
        <p class="hero__subtitle">Not all heroes wear capes</p>
        <div>
          <button class="button button--secondary button--outline button--lg">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
