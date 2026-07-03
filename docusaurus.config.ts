import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Muesli — "Google Docs for Markdown files".
// This site is served at https://docs.muesli.md
// The main marketing site lives at https://muesli.md (separate `website/` repo).
const config: Config = {
  title: 'Muesli Docs',
  tagline: 'Documentation for Muesli — Google Docs for Markdown files',
  favicon: 'img/favicon.ico',

  // Full icon set + warm-gold theme-color (the brand accent; matches
  // site.webmanifest). The `favicon` above emits the primary <link>; these add the
  // PNG sizes, apple-touch icon, PWA manifest and browser-chrome color.
  // Assets live in static/img/ (derived from ../assets-new).
  headTags: [
    {
      tagName: 'link',
      attributes: { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/img/favicon-32x32.png' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/img/favicon-16x16.png' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png' },
    },
    {
      tagName: 'link',
      attributes: { rel: 'manifest', href: '/img/site.webmanifest' },
    },
    {
      tagName: 'meta',
      attributes: { name: 'theme-color', content: '#cc9350' },
    },
  ],

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Production URL of this site.
  url: 'https://docs.muesli.md',
  // Served at the domain root.
  baseUrl: '/',

  // GitHub org/repo (used for some metadata; not deploying via GH Pages).
  organizationName: 'muesli-dot-md',
  projectName: 'docs',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang.
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          // Serve docs as the site root ("/") instead of "/docs".
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/muesli-dot-md/docs/tree/main/',
        },
        // Blog is not used for the docs site.
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Social card — Agent 3 will replace with Muesli branding.
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      // Dark-first, matching the marketing site; toggle stays available.
      defaultMode: 'dark',
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Muesli Docs',
      logo: {
        alt: 'Muesli Logo',
        src: 'img/logo.png',
        // Clicking the brand takes you back to the main site.
        href: 'https://muesli.md',
        target: '_self',
      },
      items: [
        {
          href: 'https://muesli.md',
          label: 'muesli.md',
          position: 'right',
        },
        {
          href: 'https://github.com/muesli-dot-md/muesli',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Muesli',
          items: [
            {
              label: 'Home (muesli.md)',
              href: 'https://muesli.md',
            },
            {
              label: 'Documentation',
              to: '/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/muesli-dot-md/muesli',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Muesli · <a href="https://muesli.md">muesli.md</a>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
