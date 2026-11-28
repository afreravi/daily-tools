# Daily Tools

One new single-page **HTML/CSS/JS** tool, every day — built by an [OpenHands](https://www.openhands.dev) automation, merged by a human.

**Live site:** [afreetools.com](https://afreetools.com) · **75 tools built** · **1 per day since 2025**

## How it works

1. Tool ideas live in **`tools-queue.txt`**, one per line, with an optional `| note` giving extra design guidance.
2. Every day at **03:30 UTC** an automation picks the first unbuilt idea, reads **`GUIDELINES.md`**, builds the tool, writes its article, and opens **one pull request**.
3. **Merging is the approval gate.** The automation may never merge, close, or approve its own PR — nothing reaches `main` without a human review.

### Guardrails

- **30-minute wall clock** per run, with a hard delivery contract: branch pushed by minute 25, PR open by minute 28.
- **One PR per run**, scoped to a single tool folder plus two lines of bookkeeping.
- **Never touches** `GUIDELINES.md`, previous tool folders, or any line of `tools-queue.txt` it didn't consume.
- If the queue is empty, it opens an issue instead of inventing work.

## Repo layout

```
daily-tools/
├── GUIDELINES.md       ← build rules (edit anytime; applies next run)
├── tools-queue.txt     ← the tool idea queue
├── README.md
└── tools/
    ├── 001-tool-name/  {index.html, style.css, script.js}
    ├── 002-tool-name/
    └── ...
```

## Guidelines

Full build rules live in [GUIDELINES.md](GUIDELINES.md): Bootstrap 4.6, light theme only, SEO title and meta description, and a ~800–1000-word unique article per tool with E-E-A-T signals.

## The tools

| # | Slug | What it does |
| --- | --- | --- |
| 001 | ltv-calculator | Free LTV calculator - compute customer lifetime value with the CLV formula, retention rate, margin, and CAC payback. |
| 002 | pomodoro-timer | Free pomodoro timer - run 25-minute focus sessions with 5-minute breaks, track completed pomodoro cycles, and build a deeper focus... |
| 003 | sig-fig-calculator | Free significant figures calculator - count sig figs, round any number to the desired significant digits, view decimal places, and... |
| 004 | loan-to-value-calculator | Free loan-to-value calculator: enter property value and down payment to instantly see your mortgage LTV ratio, equity, and risk band. |
| 005 | text-compare | Compare two texts and spot additions, removals, and code changes in seconds with this free online text compare tool, showing... |
| 006 | hex-to-rgb-converter | Free online HEX to RGB converter: paste any hex color code and instantly get its RGB values, a live color preview, and CSS ready... |
| 007 | rgb-to-hex-converter | Free online RGB to HEX converter: enter any RGB or rgba color value, get its hex code instantly, plus a live preview, HSL,, and... |
| 008 | wacc-calculator | Free online WACC calculator: enter equity value, debt value, cost of equity, cost of debt, and tax rate to get weighted average... |
| 009 | color-contrast-checker | Free WCAG color contrast checker: calculate the contrast ratio between any two colors and see instantly whether your text passes AA... |
| 010 | mulch-calculator | Free mulch calculator: estimate cubic yards, bags, and cost for rectangular, circular, or triangular beds at any depth. |
| 011 | trapezoid-area-calculator | Free trapezoid area calculator: find the area of any trapezoid from its two parallel bases and height, with perimeter, median, and... |
| 012 | random-topic-generator | Free random topic generator: spin unlimited writing prompts for essays, speeches, podcasts and debates. |
| 013 | qr-code-generator | Free QR code generator: turn a link, text, Wi-Fi login or phone number into a scannable QR code. |
| 014 | html-encoder | Free HTML encoder that escapes special characters into safe HTML entities and decodes them back. |
| 015 | acreage-calculator | Free acreage calculator: convert land area between square feet, acres, hectares, and square meters. |
| 016 | loan-emi-calculator | Free loan EMI calculator: enter principal, interest rate and tenure to get your monthly EMI, total interest payable and a full... |
| 017 | youtube-title-length-checker | Check your YouTube title length instantly. |
| 018 | dnd-character-name-generator | Generate memorable D&D character names by race, class and tone. |
| 019 | watts-to-amps-calculator | Convert watts to amps for DC, AC single-phase and three-phase circuits. |
| 020 | random-movie-generator | Spin the random movie generator and get a film worth watching tonight. |
| 021 | rule-of-72-calculator | Use the rule of 72 calculator to estimate how many years an investment takes to double. |
| 022 | instagram-caption-character-counter | Count Instagram caption characters as you type, check the 2,200 caption limit, see the 125-character preview cut-off and the... |
| 023 | prorate-rent-calculator | Prorate rent for a partial month with this free calculator. |
| 024 | random-team-name-generator | Generate random team names for sports, work, quizzes or games. |
| 025 | line-break-remover | Instantly remove line breaks, blank lines and extra spaces from pasted text. |
| 026 | random-emoji-generator | Spin the random emoji generator to pick surprise emojis by mood, category or count. |
| 027 | markdown-to-html-converter | Convert Markdown to clean HTML instantly with this free online converter. |
| 028 | twitter-post-character-counter | Free Twitter post character counter. |
| 029 | random-nba-team-generator | Spin a random NBA team in one click. |
| 030 | grade-calculator | Free grade calculator: turn assignment scores and weights into a weighted average, see your letter grade, and work out the final... |
| 031 | random-nfl-team-generator | Use this random NFL team generator to pick a random football team in one click. |
| 032 | phonetic-spelling-generator | Free phonetic spelling generator: turn any word or name into an easy sound-it-out respelling with syllable breaks, stress marks and... |
| 033 | random-nfl-player-generator | Random NFL player generator that spins football legends, All-Pros and rising stars by position or team. |
| 034 | facebook-ad-cost-calculator | Facebook ad cost calculator: turn budget, impressions, clicks and conversions into CPM, CPC, CTR, CPA and ROAS, then see what... |
| 035 | artist-name-generator | Free artist name generator that creates unique band names, stage names and musician aliases. |
| 036 | random-nba-player-generator | Random NBA player generator that draws basketball stars by position, team and era. |
| 037 | ship-name-generator | Ship name generator blends two first names into perfect couple names. |
| 038 | random-anime-character-generator | Free random anime character generator: roll instant OCs with a name, age, power, signature move and backstory seed, then copy,... |
| 039 | quirk-generator | Free quirk generator: roll random character quirks, habits and small oddities for stories, RPGs and drawing prompts, filtered by... |
| 040 | random-animal-facts | Generate random animal facts for kids, quizzes and trivia nights. |
| 041 | youtube-title-generator | Free YouTube title generator: enter your topic, pick a format and tone, and get click-worthy video title ideas with live character... |
| 042 | random-string-generator | Generate random strings online with cryptographically secure randomness. |
| 043 | utm-link-builder | Build UTM tracking links in seconds. |
| 044 | tvm-calculator | Free TVM calculator solves the time value of money equation for any one unknown: present value, future value, payment, number of... |
| 045 | password-generator | Free password generator creates strong, random passwords and passphrases. |
| 046 | irr-calculator | Free IRR calculator finds the internal rate of return for any cash flow series, with an NPV profile chart, MIRR and payback period... |
| 047 | random-color-generator | Free random color generator: spin a random hex code or build a palette by pastel, vivid, dark or warm mode, then copy the hex, RGB... |
| 048 | npv-calculator | Free NPV calculator: enter a discount rate and yearly cash flows to get net present value, total discounted cash flow and a payback... |
| 049 | random-word-generator | Free random word generator: pick words instantly by length, starting letter or word type. |
| 050 | roi-calculator | Free ROI calculator: enter your investment, total return, extra costs and holding period to get return on investment, net profit... |
| 051 | random-email-generator | Free random email generator: create realistic fake email addresses in seconds. |
| 052 | dcf-calculator | Free DCF calculator: discount projected free cash flows at your WACC, add a terminal value, and see enterprise value, equity value... |
| 053 | online-font-generator | Free online font generator: style any text with 10 web fonts, size, weight, spacing and colour, preview it live and copy the... |
| 054 | stylish-text-generator | Free stylish text generator: turn plain words into bold, italic, script, gothic and 30+ fancy fonts you can copy and paste into... |
| 055 | font-copy-and-paste | Font copy and paste in one click. |
| 056 | bold-text-generator | Bold text generator turns plain words into bold Unicode fonts you can copy and paste into bios, captions, usernames and posts - no... |
| 057 | small-text-generator | Small text generator turns plain words into tiny superscript and subscript Unicode you can copy and paste into bios, captions and... |
| 058 | tiny-text-generator | Tiny text generator converts normal words into miniature superscript and subscript Unicode text you can copy and paste into bios,... |
| 059 | aesthetic-fonts-generator | Aesthetic fonts generator turns plain text into dreamy copy-and-paste styles with script, serif and sans Unicode fonts wrapped in... |
| 060 | glitch-text-generator | Glitch text generator turns plain words into creepy zalgo, static, flicker and fade corrupted Unicode text you can copy and paste... |
| 061 | twitter-x-fonts-generator | Twitter (X) fonts generator turns plain text into bold, italic, script and gothic Unicode fonts you can copy and paste into your X... |
| 062 | instagram-font-generator | Instagram font generator turns plain text into cursive, bold and aesthetic Unicode fonts you can copy and paste into your IG bio,... |
| 063 | cursed-text-generator | Cursed text generator turns plain words into creepy, corrupted Unicode text you can copy and paste. |
| 064 | zalgo-text-generator | Free zalgo text generator that stacks Unicode marks above, through and below your words to make creepy glitchy zalgo text you can... |
| 065 | cool-fonts-generator | Free cool fonts generator: turn plain text into 30+ copy and paste cool fonts for Instagram, Discord and bios, with a live size... |
| 066 | italics-text-generator | Italics text generator turns plain words into copy-and-paste italic Unicode fonts for bios, captions and notes. |
| 067 | creepy-text-generator | Creepy text generator turns plain words into horror-ready copy-paste text with shadow marks, gothic letters and blood accents. |
| 068 | facebook-fonts-generator | Facebook fonts generator converts plain text into bold, italic, script, bubble and gothic Unicode fonts you can copy and paste into... |
| 069 | discord-fonts-generator | Discord fonts generator turns plain text into bold, cursive, gothic, bubble and small-caps Unicode fonts you can copy and paste... |
| 070 | bubble-words-generator | Bubble words generator turns plain text into bubble letters you can copy and paste. |
| 071 | bubble-font-generator | Bubble font generator turns your text into fat bubble letters using real bubble typefaces. |
| 072 | barbie-font-generator | Type a name to build a Barbie-style logo in pink gradient lettering, download it as SVG, and copy six Barbie-inspired Unicode text... |
| 073 | graffiti-generator | Create a spray-paint graffiti tag from any name. |
| 074 | ascii-art-generator | Turn any word into copy-and-paste ASCII art. |
| 075 | calligraphy-font-generator | Free calligraphy font generator: type once and copy elegant script, italic, blackletter and small-caps Unicode lettering for bios, invites and logos. |
| 076 | gothic-font-generator | Free gothic font generator: turn plain text into copy-and-paste blackletter, fraktur and textura lettering, with live typeface previews and a glyph coverage chart. |
| 077 | strikethrough-text-generator | Cross out any line with ten copy-and-paste Unicode strike styles, live preview, coverage chart and a `<del>` snippet for the web. |
| 078 | wingdings-translator | Wingdings translator turns text into copy-and-paste dingbat symbols and decodes them back, with a live coverage chart. |
