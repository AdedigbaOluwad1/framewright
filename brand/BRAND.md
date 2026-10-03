# Framewright brand identity

Assumptions: the product keeps the repo name Framewright if it survives the name check below; the app stays dark-first; the existing app fonts (Geist, Geist Mono) are reused for UI; everything here is original work and should still be checked for similarity before launch. Open `brand/preview.html` to see every direction and the final assets rendered.

## 1. Strategy

**Positioning statement.** For short-form creators who care about speed and privacy, Framewright is the browser-based vertical video editor that does all its work on your device, so your footage is never uploaded, there is no account, and no watermark. Unlike cloud editors, it is private by construction, and unlike lightweight apps, it gives you a precise, Premiere-style workspace.

**Pillars**

1. **Precise.** Frame-accurate tools and a workspace that respects detail. The brand shows this with exact geometry and restraint.
2. **Private.** Nothing leaves the device. This is a fact of the architecture, so the brand states it plainly and never hedges.
3. **Swift.** Hardware-accelerated and instant to open. Copy is short, and the visual system has no decoration that slows the eye.

**Tone of voice:** direct, calm, technical but warm. Say what happens, in the fewest words.

| Do                                             | Don't                                               |
| ---------------------------------------------- | --------------------------------------------------- |
| "Your footage never leaves this device."       | "We take your privacy very seriously."              |
| "Export finished in 14 s."                     | "Woohoo! Your masterpiece is ready!"                |
| "This format needs converting first. Convert?" | "Oops! Something went wrong."                       |
| "No account. No watermark."                    | "Unlock premium creator magic."                     |
| "Cut. Trim. Export."                           | "The ultimate all-in-one AI-powered editing studio" |

**Taglines (privacy- and speed-led)**

1. Cut vertical video. Keep it on your device. _(used on the social card)_
2. Your footage never leaves.
3. Edit at the speed of your own machine.
4. Private by construction. Fast by default.
5. Cut here. Stay here.

## 2. Name

| #   | Name            | Style       | Meaning and pronunciation                                                | Why it fits                                                         | Risk                                                                        |
| --- | --------------- | ----------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Vertcut         | Descriptive | "vert" + "cut", VURT-kut                                                 | Says exactly what it does                                           | Sounds like a utility, hard to build a brand on, "vert" reads as French     |
| 2   | Cutlocal        | Descriptive | "cut" + "local", KUT-LOH-kul                                             | Privacy angle is in the name                                        | Clunky, narrow (what about export, audio?)                                  |
| 3   | Onframe         | Descriptive | "on-device" + "frame", ON-frame                                          | Short, and frame is the unit of the craft                           | Generic, and likely crowded in video tooling                                |
| 4   | Kelvo           | Coined      | No meaning, KEL-voh                                                      | Short, ownable, easy to say                                         | Says nothing about video, may resemble existing brands                      |
| 5   | Veyra           | Coined      | No meaning, VAY-ruh                                                      | Soft, modern                                                        | Reads as a beauty or fintech name, no product link                          |
| 6   | Kerf            | Metaphor    | The slot a saw leaves when it cuts, KURF                                 | Precision and cutting in one word, very short, great for a mark     | Obscure word, search results dominated by other meanings, likely crowding   |
| 7   | **Framewright** | Metaphor    | A maker of frames, in the sense of wheelwright or shipwright, FRAYM-rite | Craft and precision, "frame" is the video unit, already in the repo | 11 letters, "wright" is an uncommon spelling, small existing projects exist |
| 8   | Plumb           | Metaphor    | Perfectly vertical, as in a plumb line, PLUM (the b is silent)           | Vertical video plus precision and dependability                     | Silent b, generic word, probably crowded                                    |

**Recommendation: Framewright.** It carries craft, precision and the frame in one word, it sounds credible to both creators and engineers, and it is already the repo name, so there is no rename cost. Runner-up: Kerf, which would give a stronger symbol but a weaker search presence.

Check domain, social handles and trademark availability yourself before committing. I have not verified any of them.

## 3. Logo exploration

All three were constructed on a 64 unit grid, drawn as plain SVG paths with no raster and no external fonts. Wordmark lettering is Sora outlines converted to paths. Files are in `brand/directions/`, each with `symbol`, `wordmark` and `lockup` in ink, paper, brand and brand-dark colourways.

### A. Split F (`directions/a-split-f`)

**Concept:** a bold F with one 45 degree cut through its foot. The cut is the product's verb, and the slice also reads as speed. One shape, one idea. The grid is 4 unit modules: stem 12, arms 12, arm gap 8, cut angle exactly 45 degrees.

### B. Viewfinder (`directions/b-viewfinder`)

**Concept:** crop-mark brackets frame a 9:16 area, with a playhead needle through the middle. Pictorial, and the most literal about the product. Built from a 5.5 stroke, brackets with an 8 unit arm, and a needle 5 wide with a pentagon head.

### C. Badge (`directions/c-badge`)

**Concept:** a rounded-square "fw" monogram knocked out of the tile, paired with a bold wordmark whose i carries a playhead cap instead of a dot. The grid is a 56 unit tile with a 15 unit corner radius.

## 4. Critique and refinement

| Criterion       | A Split F                            | B Viewfinder                                   | C Badge                                  |
| --------------- | ------------------------------------ | ---------------------------------------------- | ---------------------------------------- |
| Distinctiveness | 4. The cut is ownable, the F is not  | 3. Brackets plus needle is a familiar UI trope | 3. Rounded-square monogram is generic    |
| Simplicity      | 5. Two shapes                        | 3. Four brackets, a bar and a head             | 4. One tile, one knockout                |
| Scalability     | 5. Survives 16 px                    | 2. Collapses to noise below 24 px              | 4. The knockout clogs at 16 px           |
| Memorability    | 4. One strong gesture                | 3. Reads as "I" or a UI widget                 | 3. Competes with every monogram app icon |
| Relevance       | 4. Cut equals editing                | 5. Frame plus playhead is the whole product    | 3. Letters only, no idea                 |
| Versatility     | 5. Works in one colour, tile, avatar | 3. Needs stroke, awkward as a tile             | 4. Fine as a tile, weak as a lockup      |
| **Total**       | **27**                               | **19**                                         | **21**                                   |

**Pick: A, the cut.** The idea scored highest. The first execution was a sharp, capital F, which had three problems:

1. **Draft collision.** The cut ended 2 units from the mid arm, creating a tangent, and the foot was a sliver.
2. **Redundancy.** A capital F symbol next to a lowercase "framewright" wordmark repeats itself, and fixing it by using the F as the initial left two competing "f" shapes in the system.
3. **Generic skeleton.** A blocky F is a common shape. Only the cut owned it.

**Revision: the curved f (adopted).** The final symbol applies the same 45 degree cut to the lowercase Sora "f" from the wordmark. The curved hook gives the symbol character that a blocky F lacks, and the symbol and wordmark now share one letterform, so the symbol is literally the first letter of the name. The lockup problem disappears: the wordmark is the primary horizontal lockup, and the symbol is its first letter for small and square uses. The sharp F stays in `directions/a-split-f` as the record of the exploration.

Known weaknesses of the final:

1. **Narrow.** The f is 349 units wide against 738 tall, so it fills a square tile less than a wide mark would. The app icon scales it to 62% of the tile height to compensate.
2. **Subtle cut at 16 px.** In the 16 px favicon the f is 11 px tall, so the foot is about 1.9 px. It still reads as a notch, and the f is recognisable without it, but the cut is the detail to protect when resizing.
3. **Top-heavy.** The hook and crossbar carry most of the visual weight, so the symbol is optically centred on its bounding box rather than its mass.

### Final symbol

Sora 600 "f" with a 45 degree cut through the lower stem. The foot is a right triangle whose legs equal the stem width (130 units), and the cut gap is 65 units vertically. Drawn as two paths, the stem and the foot, so the foot can move in the loader. Grid: 64 units, mark height 54, bottom edge at 59.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="t"><title id="t">Framewright symbol</title><path fill="#14171C" d="M24.21 54.24V27.39H19.23V19.93H24.21V18.32Q24.21 11.51 27.98 8.26Q31.74 5 39.13 5H44.11V12.83H38.4Q36.13 12.83 34.93 14.04Q33.72 15.24 33.72 17.44V19.93H44.77V27.39H33.72V44.73Z"/><path fill="#14171C" d="M24.21 59 33.72 49.49V59Z"/></svg>
```

### Final wordmark (primary lockup)

Sora 600, lowercase, kerned with HarfBuzz, with the same cut applied to its f.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="24 -759 6373 973" role="img" aria-labelledby="t"><title id="t">Framewright wordmark</title><path fill="#14171C" d="M4952 214Q4913 214 4872.5 211Q4832 208 4797 203V87Q4833 91 4874 94.5Q4915 98 4951 98Q5018 98 5059.5 82Q5101 66 5120.5 31.5Q5140 -3 5140 -56V-105.4Q5139.5 -104.45 5139 -103.5Q5111 -51 5063 -23.5Q5015 4 4952 4Q4896 4 4850.5 -17Q4805 -38 4772.5 -75Q4740 -112 4722 -162Q4704 -212 4704 -269V-290Q4704 -347 4722.5 -396.5Q4741 -446 4775 -483Q4809 -520 4856 -540Q4903 -560 4960 -560Q5027 -560 5076.5 -531Q5126 -502 5154 -447Q5157.72 -439.69 5161 -431.94V-543H5271V-64Q5271 35 5237 96Q5203 157 5132.5 185.5Q5062 214 4952 214ZM1478 0V-543H1588V-410.55Q1592.49 -430.3 1599 -447.5Q1620 -503 1661.5 -531.5Q1703 -560 1765 -560H1771Q1834 -560 1875.5 -531.5Q1917 -503 1937.5 -447.5Q1939.29 -442.67 1940.92 -437.63Q1942.63 -442.66 1944.5 -447.5Q1966 -503 2007.5 -531.5Q2049 -560 2111 -560H2117Q2180 -560 2222 -531.5Q2264 -503 2285.5 -447.5Q2307 -392 2307 -310V0H2168V-323Q2168 -374 2142 -404.5Q2116 -435 2068 -435Q2020 -435 1991 -403.5Q1962 -372 1962 -319V0H1823V-323Q1823 -374 1797 -404.5Q1771 -435 1723 -435Q1675 -435 1646 -403.5Q1617 -372 1617 -319V0ZM3172 0 3024 -543H3159L3270.4 -114H3291.37L3372 -525H3532L3625.16 -114H3646.24L3745 -543H3871L3740 0H3541L3450.78 -389.21L3371 0ZM2705 19Q2635 19 2582.5 -5Q2530 -29 2495.5 -69.5Q2461 -110 2443.5 -160Q2426 -210 2426 -262V-281Q2426 -335 2443.5 -385.5Q2461 -436 2495.5 -475.5Q2530 -515 2581 -538.5Q2632 -562 2699 -562Q2787 -562 2846.5 -523.5Q2906 -485 2936 -422.5Q2966 -360 2966 -288V-238H2557.81Q2561.38 -206.72 2572 -180.5Q2588 -141 2621 -118.5Q2654 -96 2705 -96Q2756 -96 2788 -116.5Q2820 -137 2829 -167H2957Q2945 -111 2911 -69Q2877 -27 2824.5 -4Q2772 19 2705 19ZM1213 0V-104.08Q1206.47 -83.28 1196.5 -66Q1174 -27 1134.5 -6.5Q1095 14 1038 14Q979 14 934.5 -7Q890 -28 865.5 -67Q841 -106 841 -161Q841 -221 870.5 -259Q900 -297 953.5 -316Q1007 -335 1079 -335H1190V-340Q1190 -387 1167 -410Q1144 -433 1096 -433Q1071 -433 1036 -432Q1001 -431 965.5 -429.5Q930 -428 902 -426V-544Q925 -546 954 -548Q983 -550 1013.5 -550.5Q1044 -551 1071 -551Q1155 -551 1210.5 -529Q1266 -507 1294.5 -460Q1323 -413 1323 -337V0ZM5429 0V-730H5568V-450.75Q5588.87 -502.07 5627.5 -530Q5669 -560 5733 -560H5739Q5832 -560 5880 -496Q5928 -432 5928 -310V0H5789V-323Q5789 -375 5759.5 -405Q5730 -435 5682 -435Q5631 -435 5599.5 -401.5Q5568 -368 5568 -314V0ZM6319 7Q6244 7 6195.5 -12.5Q6147 -32 6123 -78.5Q6099 -125 6099 -204L6099.48 -441H6013V-543H6099.69L6100 -696H6230L6229.69 -543H6397V-441H6229.49L6229 -195Q6229 -155 6250.5 -133.5Q6272 -112 6312 -112H6397V7ZM92 -65V-432H24V-534H92V-556Q92 -649 143.5 -693.5Q195 -738 296 -738H364V-631H286Q255 -631 238.5 -614.5Q222 -598 222 -568V-534H373V-432H222V-195ZM464 0V-543H574V-366.9Q583.25 -444.7 621 -490Q671 -550 768 -550H788V-429H750Q680 -429 641.5 -391.5Q603 -354 603 -283V0ZM3986 0V-543H4096V-366.9Q4105.25 -444.7 4143 -490Q4193 -550 4290 -550H4310V-429H4272Q4202 -429 4163.5 -391.5Q4125 -354 4125 -283V0ZM4435 0V-439H4359V-543H4574V0ZM4992 -115Q5032 -115 5065 -133Q5098 -151 5118 -185Q5138 -219 5138 -267V-302Q5138 -348 5117.5 -380Q5097 -412 5064 -428.5Q5031 -445 4992 -445Q4948 -445 4914.5 -424.5Q4881 -404 4862 -367Q4843 -330 4843 -279Q4843 -229 4862 -192Q4881 -155 4914.5 -135Q4948 -115 4992 -115ZM1190 -201V-252H1077Q1029 -252 1003.5 -228.5Q978 -205 978 -168Q978 -131 1003.5 -108Q1029 -85 1077 -85Q1106 -85 1130.5 -95.5Q1155 -106 1171.5 -131.5Q1188 -157 1190 -201ZM2560.28 -323H2833.22Q2829.54 -348.93 2821 -370Q2806 -407 2775.5 -427Q2745 -447 2699 -447Q2653 -447 2621 -426Q2589 -405 2572.5 -365.5Q2564.4 -346.12 2560.28 -323ZM4486 -608Q4445 -608 4425.5 -629.5Q4406 -651 4406 -684Q4406 -717 4425.5 -738Q4445 -759 4486 -759Q4527 -759 4546 -738Q4565 -717 4565 -684Q4565 -651 4546 -629.5Q4527 -608 4486 -608ZM92 0 222 -130V0Z"/></svg>
```

Other colourways are in `brand/final/`: `-ink`, `-paper` (reversed), `-brand` (on light) and `-brand-dark` (on dark). The symbol and wordmark are not shown side by side, because the symbol is the wordmark's first letter.

## 5. Brand system

### Colour

Dark-first. One accent, blue, shifted lighter on dark surfaces so it keeps contrast. Surfaces step in four elevations; on dark, 1 is the deepest and 4 is the most raised. Ratios are WCAG 2.2 contrast, computed from the hex values.

| Role                 | Dark      | Light     |
| -------------------- | --------- | --------- |
| `--brand`            | `#7B9CFF` | `#3558E0` |
| `--brand-foreground` | `#0B1020` | `#FFFFFF` |
| `--surface-1`        | `#0F1115` | `#E9EBF0` |
| `--surface-2`        | `#15181D` | `#F4F5F8` |
| `--surface-3`        | `#1B1F26` | `#FAFBFC` |
| `--surface-4`        | `#232832` | `#FFFFFF` |
| `--border`           | `#2C323D` | `#D5D9E1` |
| `--border-strong`    | `#6B7385` | `#7A8394` |
| `--foreground`       | `#ECEEF2` | `#14171C` |
| `--muted-foreground` | `#A3AAB8` | `#4B5565` |

| Pair                              | Ratio | Passes      |
| --------------------------------- | ----- | ----------- |
| Dark: foreground on surface-1     | 16.3  | AAA text    |
| Dark: foreground on surface-4     | 12.7  | AAA text    |
| Dark: muted on surface-1          | 8.1   | AAA text    |
| Dark: muted on surface-4          | 6.3   | AA text     |
| Dark: brand on surface-1          | 7.2   | AAA text    |
| Dark: brand on surface-4          | 5.7   | AA text     |
| Dark: brand-foreground on brand   | 7.3   | AAA text    |
| Dark: border-strong on surface-2  | 3.7   | AA UI (3:1) |
| Light: foreground on surface-1    | 15.1  | AAA text    |
| Light: muted on surface-1         | 6.3   | AA text     |
| Light: brand on surface-1         | 4.9   | AA text     |
| Light: brand on surface-4 (white) | 5.8   | AA text     |
| Light: brand-foreground on brand  | 5.8   | AA text     |
| Light: border-strong on surface-4 | 3.8   | AA UI (3:1) |

Two cases sit near the line: `--border-strong` on dark surface-4 is 3.1 and on light surface-1 is 3.2. Both pass the 3:1 UI minimum but have no headroom, so do not use it for text. `--border` is decorative only and is not meant to meet 3:1.

Paste-ready Tailwind v4 theme: `brand/tokens.css`. Mapping to the app's current tokens: `--accent-solid` becomes `--brand`, `--accent-solid-foreground` becomes `--brand-foreground`, and the app's `--surface-0..3` become `--surface-1..4`.

### Typography

| Role               | Typeface   | Licence     | Use                                       |
| ------------------ | ---------- | ----------- | ----------------------------------------- |
| UI                 | Geist      | SIL OFL 1.1 | All interface text                        |
| Display / wordmark | Sora       | SIL OFL 1.1 | Wordmark, landing headlines, social cards |
| Mono / timecode    | Geist Mono | SIL OFL 1.1 | Timecode, bitrates, diagnostics           |

All three are on Google Fonts. Self-host them, because cross-origin isolation blocks third-party font hosts. Timecode uses `font-variant-numeric: tabular-nums` so digits never shift as they tick.

Scale on a 15 px root:

| Token   | Size             | Use                               |
| ------- | ---------------- | --------------------------------- |
| 2xs     | 0.7 rem, 10.5 px | Ruler ticks, badges               |
| xs      | 0.8 rem, 12 px   | Secondary labels                  |
| sm      | 0.9 rem, 13.5 px | Default UI text                   |
| base    | 1 rem, 15 px     | Body, inputs                      |
| lg      | 1.2 rem, 18 px   | Panel titles, dialog titles       |
| xl      | 1.5 rem, 22.5 px | Section headings                  |
| 2xl     | 2 rem, 30 px     | Landing subheads (Sora 600)       |
| display | 3 rem, 45 px     | Landing hero (Sora 600, -0.02 em) |

### Logo usage

- **Clear space:** one stem width on every side, which is 130 of the symbol's 738 unit height, about 18% of its height.
- **Minimum sizes:** symbol 16 px (use `favicon-16.svg` below 24 px), wordmark 96 px wide.
- **One colour:** use the `-ink` file on light and the `-paper` file on dark. The shapes need no fill variation.
- **Brand colour:** `-brand` on light surfaces, `-brand-dark` on dark. Never put brand blue on a brand-blue surface.
- **Misuse:** do not stretch, rotate, recolour off-palette, outline, close the cut, or add shadows and effects. See `brand/final/misuse.svg`, a large file because its labels are converted to paths.

### Assets

Favicon, 16 px. A dark rounded square with the white f inside, so it keeps its own contrast on any browser tab colour.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" role="img" aria-labelledby="t" width="16" height="16"><title id="t">Framewright favicon 16</title><rect width="16" height="16" rx="3.5" fill="#0F1115"/><path fill="#ECEEF2" d="M6.41 12.53V7.06H5.4V5.54H6.41V5.21Q6.41 3.83 7.18 3.16Q7.95 2.5 9.45 2.5H10.47V4.09H9.3Q8.84 4.09 8.6 4.34Q8.35 4.59 8.35 5.03V5.54H10.6V7.06H8.35V10.59Z"/><path fill="#ECEEF2" d="M6.41 13.5 8.35 11.56V13.5Z"/></svg>
```

Favicon, 32 px. Same tile, 22 px mark, 7 px corner radius.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-labelledby="t" width="32" height="32"><title id="t">Framewright favicon 32</title><rect width="32" height="32" rx="7" fill="#0F1115"/><path fill="#ECEEF2" d="M12.83 25.06V14.12H10.8V11.08H12.83V10.43Q12.83 7.65 14.36 6.33Q15.9 5 18.91 5H20.93V8.19H18.61Q17.68 8.19 17.19 8.68Q16.7 9.17 16.7 10.07V11.08H21.2V14.12H16.7V21.19Z"/><path fill="#ECEEF2" d="M12.83 27 16.7 23.12V27Z"/></svg>
```

App icon, rounded square. The corner radius is 22.5% of the side (115 of 512), and the f is 62% of the tile height.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="t" width="512" height="512"><title id="t">Framewright app icon</title><rect width="512" height="512" rx="115" fill="#0F1115"/><path fill="#7B9CFF" d="M209.82 387.82V228.68H180.34V184.46H209.82V174.92Q209.82 134.59 232.15 115.3Q254.48 96 298.28 96H327.76V142.4H293.94Q280.5 142.4 273.34 149.55Q266.19 156.7 266.19 169.71V184.46H331.66V228.68H266.19V331.45Z"/><path fill="#7B9CFF" d="M209.82 416 266.19 359.63V416Z"/></svg>
```

App icon, maskable. Full bleed, with the mark inside the central 80% safe circle.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="t" width="512" height="512"><title id="t">Framewright maskable app icon</title><rect width="512" height="512" fill="#0F1115"/><path fill="#7B9CFF" d="M219.92 358.98V234.66H196.89V200.11H219.92V192.65Q219.92 161.15 237.37 146.07Q254.81 131 289.03 131H312.06V167.25H285.64Q275.14 167.25 269.55 172.84Q263.96 178.43 263.96 188.59V200.11H315.11V234.66H263.96V314.94Z"/><path fill="#7B9CFF" d="M219.92 381 263.96 336.96V381Z"/></svg>
```

Social avatar. Full bleed so platforms can crop it to a circle.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-labelledby="t" width="400" height="400"><title id="t">Framewright avatar</title><rect width="400" height="400" fill="#0F1115"/><path fill="#7B9CFF" d="M169.7 286.5V182.07H150.35V153.05H169.7V146.79Q169.7 120.33 184.35 107.66Q199 95 227.74 95H247.09V125.45H224.9Q216.08 125.45 211.38 130.14Q206.69 134.84 206.69 143.37V153.05H249.65V182.07H206.69V249.51Z"/><path fill="#7B9CFF" d="M169.7 305 206.69 268.01V305Z"/></svg>
```

Open Graph card, 1200 x 630. The lettering is converted to paths, so it needs no fonts. It is a large file; open `brand/final/og-card.svg`.

### Motion note

The loader and the favicon share one look: a dark rounded tile with the white f. During an export or heavy load, the foot of the f slides along the cut axis and back, like a blade passing along its own line (1.4 s, ease-in-out, 5 units of travel). When the job finishes, the foot moves 3 units up and left to close the gap, so the f is whole. The f becomes whole when the job is done. Under `prefers-reduced-motion` the animation is off and the f stays static.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="t" width="64" height="64"><title id="t">Framewright loader</title><style>.foot{animation:cut 1.4s cubic-bezier(.65,0,.35,1) infinite}@keyframes cut{0%,100%{transform:translate(0,0)}50%{transform:translate(5px,-5px)}}@media (prefers-reduced-motion:reduce){.foot{animation:none}}</style><rect width="64" height="64" rx="14" fill="#0F1115"/><path fill="#ECEEF2" d="M26.23 48.48V28.59H22.54V23.06H26.23V21.86Q26.23 16.82 29.02 14.41Q31.81 12 37.28 12H40.97V17.8H36.74Q35.06 17.8 34.17 18.69Q33.27 19.59 33.27 21.21V23.06H41.46V28.59H33.27V41.43Z"/><path class="foot" fill="#ECEEF2" d="M26.23 52 33.27 44.95V52Z"/></svg>
```

Completion state (CSS, add to the page that embeds the SVG):

```css
.foot.done {
  animation: none;
  transform: translate(-3px, -3px);
  transition: transform 160ms ease-out;
}
```

## 6. Files

```
brand/
  preview.html          all directions and assets rendered
  tokens.css            Tailwind v4 theme and colour variables
  directions/           a-split-f, b-viewfinder, c-badge
  final/                symbol, wordmark, favicons, app icons,
                        avatar, og-card, loader, misuse
```
