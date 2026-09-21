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
