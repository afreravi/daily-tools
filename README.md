# Daily Tools

A new, single-page **HTML/CSS/JS** tool — built every day by an [OpenHands](https://www.openhands.dev) automation.

## How it works
1. You keep a queue of tool ideas in **`tools-queue.txt`** (one per line; optional `| note` after the name).
2. Every day at **03:30 UTC** the automation picks the first unbuilt idea, reads **`GUIDELINES.md`**, designs/builds the tool, and opens a **pull request**.
3. **You review the PR** —comment changes/questions or just merge. **Merging = approving.** Nothing reaches `main` bypassing your review..

## Repo layout
```
daily-tools/
├── GUIDELINES.md        ← base build rules (edit anytime; applies next run)
├── tools-queue.txt     ← your tool idea queue
├── README.md
└── tools/
    ├── 001-tool-name/   {index.html, style.css, script.js}
    ├── 002-tool-name/
    └── ...
```

## Guidelines
Full build rules live in [GUIDELINES.md](GUIDELINES.md) — Bootstrap 4.6, light theme only, SEO title/description, and a ~800–1000-word unique article per tool with E-E-A-T signals.

## Tools

| # | Slug | What it does |
| --- | --- | --- |
| 001 | ltv-calculator | Lifetime value calculator for subscription and e-commerce revenue |
| 002 | pomodoro-timer | Focus timer with work/break cycles and session tracking |
| 003 | sig-fig-calculator | Counts and rounds significant figures, with rounding rules explained |
| 004 | loan-to-value-calculator | Works out LTV from loan amount and property value |
| 005 | text-compare | Side-by-side diff checker highlighting added and removed text |
| 006 | hex-to-rgb-converter | Converts HEX colour codes to RGB values with a live swatch |
| 007 | rgb-to-hex-converter | Converts RGB values to HEX codes, with contrast preview |
| 008 | wacc-calculator | Weighted average cost of capital, with worked example and breakdown |
| 009 | color-contrast-checker | Checks WCAG contrast ratios between text and background colours |
| 010 | mulch-calculator | Estimates mulch volume and bags needed for a garden bed |
| 011 | trapezoid-area-calculator | Trapezoid area, perimeter, median and legs with a scale diagram |
| 012 | random-topic-generator | Spins writing, speech and podcast topics by category, tone and level |
| 013 | qr-code-generator | Builds scannable QR codes for links, text, Wi-Fi and contacts, with PNG export |
| 014 | html-encoder | Escapes HTML special characters into safe entities, and decodes them back |
| 015 | acreage-calculator | Converts land area between acres, sq ft, hectares and more, with totals for multiple parcels |
| 016 | loan-emi-calculator | Monthly EMI, total interest and a full amortization breakdown table |
| 017 | youtube-title-length-checker | Live character count and truncation preview for YouTube titles under the 100-character limit |
| 018 | dnd-character-name-generator | Fantasy character names by ancestry, class and tone, with roots chart and copy-to-clipboard |
| 019 | watts-to-amps-calculator | Converts watts to amps for DC, AC single-phase and three-phase circuits, with formula, voltage sweep chart and reference table |
| 020 | random-movie-generator | Random film picker with genre, era, mood, rating and runtime filters, genre chart and watchlist |
| 021 | rule-of-72-calculator | Doubling time from an annual rate, with rule of 72 vs 70 vs exact compounding, chart and milestone table |
| 022 | instagram-caption-character-counter | Live character, word, line and hashtag counts against Instagram's 2,200-character caption limit, with 125-character preview cut-off |
| 023 | prorate-rent-calculator | Prorates rent for a partial month, comparing days-in-month, flat 30-day and days-in-year methods with a bar chart and breakdown |
| 024 | random-team-name-generator | Random team names by style (corporate, sports, funny, fantasy, tech) with alliteration, squad tags, shortlist and a length chart |
| 025 | line-break-remover | Removes line breaks, blank lines and repeated spaces from pasted text, with space/strip/paragraph modes and a before-after chart |
| 026 | random-emoji-generator | Random emoji picker by category and count, with no-repeat option, click-to-copy chips and a category-mix chart |
| 027 | markdown-to-html-converter | Converts Markdown to clean, sanitised HTML with live output, rendered preview, element-mix chart and copy/download |
| 028 | twitter-post-character-counter | Live character, word and hashtag counts against the 280-character X (Twitter) limit, with URL weighting, preview cut-off, budget chart and thread split |
| 029 | random-nba-team-generator | Draws random NBA teams with conference/division filters, no-repeats mode, arena and title facts, and a championship chart |
| 030 | grade-calculator | Weighted grade from assignment scores and weights, with editable letter scale, contribution chart, and a final exam score planner |
| 031 | random-nfl-team-generator | Draws random NFL teams with conference, division and Super Bowl filters, no-repeats mode and a conference title chart |
| 032 | phonetic-spelling-generator | Turns any word or name into a sound-it-out respelling with syllable breaks, stress marks, a NATO alphabet spelling and a sounds-per-syllable chart |
