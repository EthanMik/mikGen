import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'mikGen Docs',
  tagline: 'Easy to use autonomous simulator and planner website for VEX Robotics.',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://mikgen.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // Docs are bundled into the mikGen app deploy and served at /docs/
  baseUrl: '/docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'EthanMik', // Usually your GitHub org/user name.
  projectName: 'mikGen', // Usually your repo name.

  onBrokenLinks: 'warn',

  markdown: {
    // Treat .md files as CommonMark instead of MDX so doxybook2-generated
    // files with <br> and backslashes parse correctly
    format: 'detect',
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Social card shown in link previews (Google, Discord, Twitter, etc.)
    image: 'img/docusaurus-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'mikLib',
      items: [
        {
          href: 'https://github.com/EthanMik/mikGen',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://mikgen.com',
          label: 'Website',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'mikLib Discord',
              href: 'https://discord.gg/UKbzef8GrA',
            },
            {
              label: 'VRC Discord',
              href: 'https://discord.gg/Dpv5aZ3dK6',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/EthanMik/mikGen',
            },
            {
              label: 'Youtube',
              href: 'https://www.youtube.com/@ethanmik2587',
            },
          ],
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['c', 'cpp', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
