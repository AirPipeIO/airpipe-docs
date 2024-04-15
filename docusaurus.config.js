// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";
const organizationName = "AirPipeIO";
const projectName = "dummy";
const baseUrl = `/${projectName}/`;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "AirPipe Docs",
  tagline: "",
  favicon: "img/favicon.ico",
  organizationName,
  projectName,
  // Set the production url of your site here
  url: `https://dummy-ap.pages.dev/`,

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
        blog: {
          showReadingTime: true,
          postsPerPage: 1,
          blogListComponent: "@theme/BlogListPage",
          blogPostComponent: "@theme/BlogPostPage",
          blogTagsListComponent: "@theme/BlogTagsListPage",
          blogTagsPostsComponent: "@theme/BlogTagsPostsPage",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/`,
        },
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
          alt: "My Site Logo",
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
            sidebarId: "exampleSidebar",
            position: "left",
            label: "Examples",
          },

          { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/facebook/docusaurus",
            label: "GitHub",
            position: "right",
          },
          // { type: 'docsVersionDropdown' },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Configuration",
            items: [
              {
                label: "Configuration",
                to: "/docs/configuration/",
              },
            ],
          },
          {
            title: "Docs",
            items: [
              {
                label: "Documentation",
                to: "/docs/",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discordapp.com/invite/docusaurus",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/airpipeio",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/facebook/docusaurus",
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
};

export default config;
