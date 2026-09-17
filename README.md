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

## Previewing a tool
Each tool is self-contained in its folder. With GitHub Pages enabled (Settings → Pages → deploy from `main` at root):, preview any built tool at:
```
https://<your-user>.github.io/daily-tools/tools/001-tool-name/
```



## Guidelines
Full build rules live in [GUIDELINES.md](GUIDELINES.md) — Bootstrap 4.6, light theme only, SEO title/description, and a ~800–1000-word unique article per tool with E-E-A-T signals.

## Tools

| # | Slug | What it does | Link |
| --- | --- | --- | --- |
| 001 | ltv-calculator | Lifetime value calculator for subscription and e-commerce revenue | [open](tools/001-ltv-calculator/) |
| 002 | pomodoro-timer | Focus timer with work/break cycles and session tracking | [open](tools/002-pomodoro-timer/) |
| 003 | sig-fig-calculator | Counts and rounds significant figures, with rounding rules explained | [open](tools/003-sig-fig-calculator/) |
| 004 | loan-to-value-calculator | Works out LTV from loan amount and property value | [open](tools/004-loan-to-value-calculator/) |
| 005 | text-compare | Side-by-side diff checker highlighting added and removed text | [open](tools/005-text-compare/) |
| 006 | hex-to-rgb-converter | Converts HEX colour codes to RGB values with a live swatch | [open](tools/006-hex-to-rgb-converter/) |
| 007 | rgb-to-hex-converter | Converts RGB values to HEX codes, with contrast preview | [open](tools/007-rgb-to-hex-converter/) |
| 008 | wacc-calculator | Weighted average cost of capital, with worked example and breakdown | [open](tools/008-wacc-calculator/) |
| 009 | color-contrast-checker | Checks WCAG contrast ratios between text and background colours | [open](tools/009-color-contrast-checker/) |
| 010 | mulch-calculator | Estimates mulch volume and bags needed for a garden bed | [open](tools/010-mulch-calculator/) |
| 011 | trapezoid-area-calculator | Trapezoid area, perimeter, median and legs with a scale diagram | [open](tools/011-trapezoid-area-calculator/) |
| 012 | random-topic-generator | Spins writing, speech and podcast topics by category, tone and level | [open](tools/012-random-topic-generator/) |
| 013 | qr-code-generator | Builds scannable QR codes for links, text, Wi-Fi and contacts, with PNG export | [open](tools/013-qr-code-generator/) |

