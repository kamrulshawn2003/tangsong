# 唐诗宋词苑 Tangsong — Tang & Song Poetry Garden

> Appreciate Tang poems and Song ci · Savor a thousand years of elegance

A static poetry website for classroom learning and leisurely reading. The entire site is built with native HTML5 / CSS3 / JavaScript — no third-party libraries, no CDN, no network requests. All assets are stored locally; simply double-click to browse offline.

[中文](README.md) | **English**

## Overview

Based on the "comprehensive example" of Tang & Song poetry in the textbook, this site collects representative works by the most celebrated poets of the Tang and Song dynasties, organized into two main sections — **Tang Poetry** and **Song Ci** — with a dedicated detail page for every featured master, including biography and background notes.

- 4 main pages: Home / Tang Poetry / Song Ci / About, all interlinked as one coherent site
- 8 master detail pages: Li Bai (李白), Du Fu (杜甫), Wang Wei (王维), Bai Juyi (白居易), Su Shi (苏轼), Li Qingzhao (李清照), Xin Qiji (辛弃疾), Liu Yong (柳永)
- 24 timeless masterpieces with biographies and background notes

## Features

- **Home page**
  - Ink-wash hero scene: layered parallax of the moon, mountains and cranes, with drifting ink dots
  - Animated stats bar: 2 sections · 8 masters · 24 poems (count-up entrance)
  - Poem of the day (今日诗笺): rotates a featured excerpt automatically by date
  - Random poem: one click reveals a random masterpiece, line by line, with copy support
- **Category pages (Tang Poetry / Song Ci)**
  - Instant keyword search & filter (by poet or poem title)
  - Quick-navigation poet chips with scroll-spy highlighting
  - "N poems" count badge for each master section
- **Interaction & UX**
  - Click any poem card to open a reading modal (large elegant typography, copy full text, close via Esc / backdrop)
  - One-click poem copy with toast feedback
  - Reading progress bar, sticky header, back-to-top with progress ring
  - Character-by-character heading reveal, scroll-in animations, ink-ripple buttons, card shine sweep
  - **Night reading mode (墨夜)**: one-click deep ink palette, preference remembered locally
- **Accessibility & responsiveness**
  - Responsive layout for desktop and mobile
  - Respects `prefers-reduced-motion` and degrades animations automatically

## Tech Stack

- Native HTML5 / CSS3 / JavaScript — zero third-party dependencies
- Ink-scroll visual style: rice-paper texture, seal stamps, misty mountains, vertical calligraphy
- All decoration implemented with CSS and inline SVG, fully offline

## Project Structure

```text
tangsong-site/
├── index.html          # Home page
├── tangshi.html        # Tang Poetry section
├── songci.html         # Song Ci section
├── about.html          # About this site
├── poets/              # 8 poet / lyricist detail pages
│   ├── libai.html      # Li Bai (李白)
│   ├── dufu.html       # Du Fu (杜甫)
│   ├── wangwei.html    # Wang Wei (王维)
│   ├── baijuyi.html    # Bai Juyi (白居易)
│   ├── sushi.html      # Su Shi (苏轼)
│   ├── liqingzhao.html # Li Qingzhao (李清照)
│   ├── xinqiji.html    # Xin Qiji (辛弃疾)
│   └── liuyong.html    # Liu Yong (柳永)
├── css/
│   └── style.css       # Global styles (incl. night-mode palette variables)
└── js/
    └── main.js         # All interaction logic and poem data
```

## Getting Started

Option 1 — double-click `index.html` to browse offline.

Option 2 — serve it with a local static server (recommended for a full preview):

```bash
python -m http.server 8000
# open http://localhost:8000 in your browser
```

## Content Maintenance

- **Add / edit poems**: edit the `POEMS` array at the top of `js/main.js` (used by "Poem of the Day" and "Random Poem" on the home page).
- **Poet quote banners**: edit the `POET_QUOTES` map at the top of `js/main.js`.
- **Section pages**: edit `tangshi.html` / `songci.html` directly; follow an existing poet block to add a new one.
- **Color themes**: Home and About use a gold-brown palette by default; add `theme-tang` (cinnabar red) to the `<body>` of the Tang page and `theme-song` (indigo blue) to the Song page. Color tokens are centralized in `:root` of `css/style.css`.

## Browser Support

- Modern Chrome / Edge / Firefox / Safari
- No internet required; night-mode preference is remembered via localStorage under the `file://` protocol

## Background

A classroom learning / exchange project built on the textbook's Tang & Song poetry theme. Placeholders such as class and group name can be filled in as needed before submission (see `about.html` for details).

## License

- Poem texts are quoted from publicly transmitted classical works (public domain)
- The page code is free to use, share and modify for learning purposes
