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

## Tools
| # | Tool | What it does | Link |
|---|------|---------------|------|
| 001 | LTV Calculator | Estimate customer lifetime value for subscription and SaaS businesses | [View](tools/001-ltv-calculator/) |
| 002 | Pomodoro Timer | Run customizable 25/5 focus sessions with short and long break cycles | [View](tools/002-pomodoro-timer/) |
| 003 | Sig Fig Calculator | Count and round significant figures, with scientific notation support | [View](tools/003-sig-fig-calculator/) |
| 004 | Loan to Value Calculator | Calculate mortgage LTV ratio, equity stake,and risk band from price and down payment | [View](tools/004-loan-to-value-calculator/) | 
| 005 | Text Compare | Compare two texts line by line to spots additions, removals,and unchanged blocks, with similarity percentage | [View](tools/005-text-compare/) |
| 009 | Color Contrast Checker | Check WCAG contrast ratio between two colors with optional presets and a ratio scale | [View](tools/009-color-contrast-checker/) |

## Guidelines
Full build rules live in [GUIDELINES.md](GUIDELINES.md) — Bootstrap 4.6, light theme only, SEO title/description, and a ~800–1000-word unique article per tool with E-E-A-T signals.| 007 | RGB to HEX Converter | Convert RGB or rgba color values to six-digit hex codes with live swatch previewand HSL data | [View](tools/007-rgb-to-hex-converter/) |
