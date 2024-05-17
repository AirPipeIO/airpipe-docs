// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";
const organizationName = "AirPipeIO";
const projectName = "airpipe-docs";
const baseUrl = `/${projectName}/`;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "AirPipe Docs",
  tagline: "",
  favicon: "img/ap-resize.png",
  organizationName,
  projectName,
  // Set the production url of your site here
  url: `https://docs.airpipe.io/`,

  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.

  // onBrokenLinks: 'throw',
  // onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",

          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/`,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      colorMode: {
        defaultMode: "dark",
        disableSwitch: true,
      },
      navbar: {
        title: "",
        logo: {
          alt: "Air Pipe",
          src: "img/ap-logo-white.png",
        },
        items: [
          {
            position: "left",
            label: "Docs",
            sidebarId: "documentationSidebar",
            type: "docSidebar",
          },
          {
            type: "docSidebar",
            sidebarId: "configurationSidebar",
            position: "left",
            label: "Configuration",
          },
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "Tutorials",
          },
          {
            type: "docSidebar",
            sidebarId: "exampleSidebar",
            position: "left",
            label: "Examples",
          },

          // {
          //   href: "https://blog.airpipe.io",
          //   label: "Blog",
          //   position: "left",
          //   className: "internal-href",
          //   target: "_self",
          // },
          {
            href: "https://github.com/AirPipeIO/airpipe-docs",
            label: "GitHub",
            position: "right",
          },
          // { type: 'docsVersionDropdown' },
        ],
      },
      footer: {
        style: "dark",
        links: [
          // {
          //   title: "Configuration",
          //   items: [
          //     {
          //       label: "Configuration",
          //       to: "/docs/configuration/",
          //     },
          //   ],
          // },
          {
            title: "Docs",
            items: [
              {
                label: "Getting Started",
                to: "/docs/tutorial/setup",
              },
              {
                label: "Configuration",
                to: "/docs/configuration",
              },
              {
                label: "Examples",
                to: "/docs/examples",
              },
            ],
          },
          {
            title: "Community",
            items: [
              // {
              //   label: "Discord",
              //   href: "https://discordapp.com/invite/docusaurus",
              // },
              {
                label: "Twitter",
                href: "https://twitter.com/airpipeio",
              },
            ],
          },
          {
            title: "More",
            items: [
              // {
              //   label: "Blog",
              //   href: "https://blog.airpipe.io",
              // },
              {
                label: "GitHub",
                href: "https://github.com/AirPipeIO/airpipe-docs",
              },
            ],
          },
        ],
        copyright: `Copyright © 2024 Air Pipe`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.vsDark,
      },
      mermaid: {
        theme: { light: "neutral", dark: "forest" },
      },
      codeblock: {
        showGithubLink: true,
        githubLinkLabel: "View on GitHub",
        showRunmeLink: false,
        runmeLinkLabel: "Checkout via Runme",
      },
    }),
  markdown: {
    mermaid: true,
  },
  themes: [
    "docusaurus-theme-github-codeblock",
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
      },
    ],
  ],
  scripts: ["/js/sidebar-toggle.js", "/js/strip-toggle.js"],
};

export default config;
