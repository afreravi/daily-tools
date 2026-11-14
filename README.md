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
| 048 | npv-calculator | Net present value from a discount rate and yearly cash flows, with per-period discount factors, a DCF bar chart and payback view. |
| 049 | random-word-generator | Draw 1–50 random English words with filters for length, starting letter and word type, plus length stats and a starting-letter bar chart. |
| 050 | roi-calculator | Return on investment from initial cost, total return, extra fees and holding period, with net profit, annualized ROI, a money-in-vs-money-out chart and a full breakdown table. |
| 051 | random-email-generator | Generate up to 25 realistic fake email addresses by name style and domain, with copy, .txt export and an address-length chart. |
| 052 | dcf-calculator | Discounted cash flow valuation from yearly free cash flows, a WACC discount rate and a perpetuity-growth or exit-multiple terminal value, with enterprise value, equity value, a nominal-vs-present chart, a year-by-year breakdown and a rate/growth sensitivity grid. |
| 053 | online-font-generator | Style any text with 10 web fonts and live size, weight, spacing, line-height and colour controls, then compare rendered widths across families and copy the ready-made CSS. |
| 054 | stylish-text-generator | Turn plain text into 30+ copy-and-paste Unicode styles (bold, script, gothic, circled and more), with per-style copy buttons and a coverage chart. |
| 055 | font-copy-and-paste | Convert text into 21 copy-and-paste Unicode fonts (bold, italic, script, gothic, circled, squared and more) with category and keyword filters, a 30-character username check and a style-length chart. |
| 056 | bold-text-generator | Convert plain text into 12 bold Unicode styles - serif, sans, bold italic, script, fraktur and more - with per-style copy buttons and a conversion-coverage chart. |
| 057 | small-text-generator | Shrink text into superscript or subscript tiny Unicode you can copy and paste, with a coverage chart and one-click copy/export. |
| 058 | tiny-text-generator | Convert words into miniature superscript or subscript Unicode tiny text, with per-style copy buttons, input validation and a character-coverage chart. |
| 059 | aesthetic-fonts-generator | Turn plain text into complete aesthetic looks — 17 Unicode fonts paired with sparkle, heart, cloud, moon and flower accents — with one-click copy and a coverage chart. |
| 060 | glitch-text-generator | Turn plain text into corrupted glitch/zalgo text with four styles and an intensity slider, plus copy, .txt export, a mark chart and output stats. |
| 061 | twitter-x-fonts-generator | Style text into 26 copy-and-paste Unicode fonts (bold, italic, script, gothic, circled, fullwidth and more) for X display names, bios and posts, with a style filter, an X handle length check and a coverage chart. |
| 062 | instagram-font-generator | Style plain text into 24 copy-and-paste Unicode fonts (cursive, bold, gothic, circled, fullwidth and more) for Instagram bios, captions and comments, with a style filter, a live bio preview, a caption length check and a coverage chart. |
| 064 | zalgo-text-generator | Stack Unicode marks above, through and below your letters with three independent sliders and five presets to build creepy zalgo text, with live rendering, copy/download, a marks-by-direction chart and output stats. |
| 063 | cursed-text-generator | Turn plain words into creepy cursed Unicode text with five curse styles and a 1–10 curse level, plus live preview, copy, .txt export, a marks-per-character chart and a readability report. |
| 065 | cool-fonts-generator | Turn plain text into 32 copy-and-paste cool Unicode fonts (bold, script, gothic, bubble, wide, framed and more) with a style-family and name filter, a random-text shortcut and an output-width chart. |
