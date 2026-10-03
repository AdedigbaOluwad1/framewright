# Framewright brand identity

Assumptions: the product keeps the repo name Framewright if it survives the name check below; the app stays dark-first; the existing app fonts (Geist, Geist Mono) are reused for UI; everything here is original work and should still be checked for similarity before launch. Open `brand/preview.html` to see every direction and asset rendered.

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

**Pick: A.** Weaknesses found in the first draft, and how the refined set fixes them:

1. **Draft collision.** The cut ended 2 units from the mid arm, creating a tangent, and the foot was a sliver. The refined cut clears the arm by 5 units and the foot is a true right triangle with 12 unit legs.
2. **"F framewright" redundancy.** A capital F symbol next to a lowercase "f" wordmark repeats itself. The primary lockup now uses the symbol as the initial, so it reads "Framewright" with no repetition. The full-wordmark version remains as `lockup-full-*`, with the same cut applied to its f.
3. **16 px legibility.** Scaling the 64 unit artwork down blurs the gap, so the favicon is redrawn on a 16 unit pixel grid with a 4 px stem, 3 px arms and a 2 px cut offset.
4. **Known trade-off.** The F is left-heavy. I centred its bounding box rather than its mass, because shifting it right breaks alignment against the type baseline. In tiles it is optically slightly left.

### Final symbol

Grid: 64 units. Stem x 14 to 26, top arm y 5 to 17, mid arm y 25 to 37 and 7 units shorter than the top arm, cut on the line y = 68 − x, foot a right triangle with 12 unit legs and a 6 unit vertical gap.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="t"><title id="t">Framewright symbol</title><path fill="#14171C" d="M14 5L50 5L50 17L26 17L26 25L43 25L43 37L26 37L26 42L14 54Z"/><path fill="#14171C" d="M14 60L26 60L26 48Z"/></svg>
```

### Final wordmark

Sora 600, lowercase, kerned with HarfBuzz, with the f's stem cut at the same 45 degrees and the same proportions as the symbol.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="24 -759 6373 973" role="img" aria-labelledby="t"><title id="t">Framewright wordmark</title><path fill="#14171C" d="M4952 214Q4913 214 4872.5 211Q4832 208 4797 203V87Q4833 91 4874 94.5Q4915 98 4951 98Q5018 98 5059.5 82Q5101 66 5120.5 31.5Q5140 -3 5140 -56V-105.4Q5139.5 -104.45 5139 -103.5Q5111 -51 5063 -23.5Q5015 4 4952 4Q4896 4 4850.5 -17Q4805 -38 4772.5 -75Q4740 -112 4722 -162Q4704 -212 4704 -269V-290Q4704 -347 4722.5 -396.5Q4741 -446 4775 -483Q4809 -520 4856 -540Q4903 -560 4960 -560Q5027 -560 5076.5 -531Q5126 -502 5154 -447Q5157.72 -439.69 5161 -431.94V-543H5271V-64Q5271 35 5237 96Q5203 157 5132.5 185.5Q5062 214 4952 214ZM1478 0V-543H1588V-410.55Q1592.49 -430.3 1599 -447.5Q1620 -503 1661.5 -531.5Q1703 -560 1765 -560H1771Q1834 -560 1875.5 -531.5Q1917 -503 1937.5 -447.5Q1939.29 -442.67 1940.92 -437.63Q1942.63 -442.66 1944.5 -447.5Q1966 -503 2007.5 -531.5Q2049 -560 2111 -560H2117Q2180 -560 2222 -531.5Q2264 -503 2285.5 -447.5Q2307 -392 2307 -310V0H2168V-323Q2168 -374 2142 -404.5Q2116 -435 2068 -435Q2020 -435 1991 -403.5Q1962 -372 1962 -319V0H1823V-323Q1823 -374 1797 -404.5Q1771 -435 1723 -435Q1675 -435 1646 -403.5Q1617 -372 1617 -319V0ZM3172 0 3024 -543H3159L3270.4 -114H3291.37L3372 -525H3532L3625.16 -114H3646.24L3745 -543H3871L3740 0H3541L3450.78 -389.21L3371 0ZM2705 19Q2635 19 2582.5 -5Q2530 -29 2495.5 -69.5Q2461 -110 2443.5 -160Q2426 -210 2426 -262V-281Q2426 -335 2443.5 -385.5Q2461 -436 2495.5 -475.5Q2530 -515 2581 -538.5Q2632 -562 2699 -562Q2787 -562 2846.5 -523.5Q2906 -485 2936 -422.5Q2966 -360 2966 -288V-238H2557.81Q2561.38 -206.72 2572 -180.5Q2588 -141 2621 -118.5Q2654 -96 2705 -96Q2756 -96 2788 -116.5Q2820 -137 2829 -167H2957Q2945 -111 2911 -69Q2877 -27 2824.5 -4Q2772 19 2705 19ZM1213 0V-104.08Q1206.47 -83.28 1196.5 -66Q1174 -27 1134.5 -6.5Q1095 14 1038 14Q979 14 934.5 -7Q890 -28 865.5 -67Q841 -106 841 -161Q841 -221 870.5 -259Q900 -297 953.5 -316Q1007 -335 1079 -335H1190V-340Q1190 -387 1167 -410Q1144 -433 1096 -433Q1071 -433 1036 -432Q1001 -431 965.5 -429.5Q930 -428 902 -426V-544Q925 -546 954 -548Q983 -550 1013.5 -550.5Q1044 -551 1071 -551Q1155 -551 1210.5 -529Q1266 -507 1294.5 -460Q1323 -413 1323 -337V0ZM5429 0V-730H5568V-450.75Q5588.87 -502.07 5627.5 -530Q5669 -560 5733 -560H5739Q5832 -560 5880 -496Q5928 -432 5928 -310V0H5789V-323Q5789 -375 5759.5 -405Q5730 -435 5682 -435Q5631 -435 5599.5 -401.5Q5568 -368 5568 -314V0ZM6319 7Q6244 7 6195.5 -12.5Q6147 -32 6123 -78.5Q6099 -125 6099 -204L6099.48 -441H6013V-543H6099.69L6100 -696H6230L6229.69 -543H6397V-441H6229.49L6229 -195Q6229 -155 6250.5 -133.5Q6272 -112 6312 -112H6397V7ZM92 -65V-432H24V-534H92V-556Q92 -649 143.5 -693.5Q195 -738 296 -738H364V-631H286Q255 -631 238.5 -614.5Q222 -598 222 -568V-534H373V-432H222V-195ZM464 0V-543H574V-366.9Q583.25 -444.7 621 -490Q671 -550 768 -550H788V-429H750Q680 -429 641.5 -391.5Q603 -354 603 -283V0ZM3986 0V-543H4096V-366.9Q4105.25 -444.7 4143 -490Q4193 -550 4290 -550H4310V-429H4272Q4202 -429 4163.5 -391.5Q4125 -354 4125 -283V0ZM4435 0V-439H4359V-543H4574V0ZM4992 -115Q5032 -115 5065 -133Q5098 -151 5118 -185Q5138 -219 5138 -267V-302Q5138 -348 5117.5 -380Q5097 -412 5064 -428.5Q5031 -445 4992 -445Q4948 -445 4914.5 -424.5Q4881 -404 4862 -367Q4843 -330 4843 -279Q4843 -229 4862 -192Q4881 -155 4914.5 -135Q4948 -115 4992 -115ZM1190 -201V-252H1077Q1029 -252 1003.5 -228.5Q978 -205 978 -168Q978 -131 1003.5 -108Q1029 -85 1077 -85Q1106 -85 1130.5 -95.5Q1155 -106 1171.5 -131.5Q1188 -157 1190 -201ZM2560.28 -323H2833.22Q2829.54 -348.93 2821 -370Q2806 -407 2775.5 -427Q2745 -447 2699 -447Q2653 -447 2621 -426Q2589 -405 2572.5 -365.5Q2564.4 -346.12 2560.28 -323ZM4486 -608Q4445 -608 4425.5 -629.5Q4406 -651 4406 -684Q4406 -717 4425.5 -738Q4445 -759 4486 -759Q4527 -759 4546 -738Q4565 -717 4565 -684Q4565 -651 4546 -629.5Q4527 -608 4486 -608ZM92 0 222 -130V0Z"/></svg>
```

### Final lockup (primary, F as initial)

Symbol height equals the ascender height, baseline aligned. Gap to the "r" is 46 font units.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -759 6541.05 973" role="img" aria-labelledby="t"><title id="t">Framewright horizontal lockup</title><path fill="#14171C" d="M0 -738L483.05 -738L483.05 -576.98L161.02 -576.98L161.02 -469.64L389.13 -469.64L389.13 -308.62L161.02 -308.62L161.02 -241.53L0 -80.51Z"/><path fill="#14171C" d="M0 0L161.02 0L161.02 -161.02Z"/><path fill="#14171C" d="M5096.05 214Q5057.05 214 5016.55 211Q4976.05 208 4941.05 203V87Q4977.05 91 5018.05 94.5Q5059.05 98 5095.05 98Q5162.05 98 5203.55 82Q5245.05 66 5264.55 31.5Q5284.05 -3 5284.05 -56V-105.4Q5283.56 -104.45 5283.05 -103.5Q5255.05 -51 5207.05 -23.5Q5159.05 4 5096.05 4Q5040.05 4 4994.55 -17Q4949.05 -38 4916.55 -75Q4884.05 -112 4866.05 -162Q4848.05 -212 4848.05 -269V-290Q4848.05 -347 4866.55 -396.5Q4885.05 -446 4919.05 -483Q4953.05 -520 5000.05 -540Q5047.05 -560 5104.05 -560Q5171.05 -560 5220.55 -531Q5270.05 -502 5298.05 -447Q5301.78 -439.69 5305.05 -431.94V-543H5415.05V-64Q5415.05 35 5381.05 96Q5347.05 157 5276.55 185.5Q5206.05 214 5096.05 214ZM1622.05 0V-543H1732.05V-410.55Q1736.55 -430.3 1743.05 -447.5Q1764.05 -503 1805.55 -531.5Q1847.05 -560 1909.05 -560H1915.05Q1978.05 -560 2019.55 -531.5Q2061.05 -503 2081.55 -447.5Q2083.34 -442.67 2084.97 -437.63Q2086.68 -442.66 2088.55 -447.5Q2110.05 -503 2151.55 -531.5Q2193.05 -560 2255.05 -560H2261.05Q2324.05 -560 2366.05 -531.5Q2408.05 -503 2429.55 -447.5Q2451.05 -392 2451.05 -310V0H2312.05V-323Q2312.05 -374 2286.05 -404.5Q2260.05 -435 2212.05 -435Q2164.05 -435 2135.05 -403.5Q2106.05 -372 2106.05 -319V0H1967.05V-323Q1967.05 -374 1941.05 -404.5Q1915.05 -435 1867.05 -435Q1819.05 -435 1790.05 -403.5Q1761.05 -372 1761.05 -319V0ZM3316.05 0 3168.05 -543H3303.05L3414.45 -114H3435.42L3516.05 -525H3676.05L3769.21 -114H3790.3L3889.05 -543H4015.05L3884.05 0H3685.05L3594.84 -389.21L3515.05 0ZM2849.05 19Q2779.05 19 2726.55 -5Q2674.05 -29 2639.55 -69.5Q2605.05 -110 2587.55 -160Q2570.05 -210 2570.05 -262V-281Q2570.05 -335 2587.55 -385.5Q2605.05 -436 2639.55 -475.5Q2674.05 -515 2725.05 -538.5Q2776.05 -562 2843.05 -562Q2931.05 -562 2990.55 -523.5Q3050.05 -485 3080.05 -422.5Q3110.05 -360 3110.05 -288V-238H2701.86Q2705.43 -206.72 2716.05 -180.5Q2732.05 -141 2765.05 -118.5Q2798.05 -96 2849.05 -96Q2900.05 -96 2932.05 -116.5Q2964.05 -137 2973.05 -167H3101.05Q3089.05 -111 3055.05 -69Q3021.05 -27 2968.55 -4Q2916.05 19 2849.05 19ZM1357.05 0V-104.08Q1350.52 -83.28 1340.55 -66Q1318.05 -27 1278.55 -6.5Q1239.05 14 1182.05 14Q1123.05 14 1078.55 -7Q1034.05 -28 1009.55 -67Q985.05 -106 985.05 -161Q985.05 -221 1014.55 -259Q1044.05 -297 1097.55 -316Q1151.05 -335 1223.05 -335H1334.05V-340Q1334.05 -387 1311.05 -410Q1288.05 -433 1240.05 -433Q1215.05 -433 1180.05 -432Q1145.05 -431 1109.55 -429.5Q1074.05 -428 1046.05 -426V-544Q1069.05 -546 1098.05 -548Q1127.05 -550 1157.55 -550.5Q1188.05 -551 1215.05 -551Q1299.05 -551 1354.55 -529Q1410.05 -507 1438.55 -460Q1467.05 -413 1467.05 -337V0ZM5573.05 0V-730H5712.05V-450.75Q5732.92 -502.07 5771.55 -530Q5813.05 -560 5877.05 -560H5883.05Q5976.05 -560 6024.05 -496Q6072.05 -432 6072.05 -310V0H5933.05V-323Q5933.05 -375 5903.55 -405Q5874.05 -435 5826.05 -435Q5775.05 -435 5743.55 -401.5Q5712.05 -368 5712.05 -314V0ZM6463.05 7Q6388.05 7 6339.55 -12.5Q6291.05 -32 6267.05 -78.5Q6243.05 -125 6243.05 -204L6243.54 -441H6157.05V-543H6243.74L6244.05 -696H6374.05L6373.75 -543H6541.05V-441H6373.55L6373.05 -195Q6373.05 -155 6394.55 -133.5Q6416.05 -112 6456.05 -112H6541.05V7ZM608.05 0V-543H718.05V-366.9Q727.3 -444.7 765.05 -490Q815.05 -550 912.05 -550H932.05V-429H894.05Q824.05 -429 785.55 -391.5Q747.05 -354 747.05 -283V0ZM4130.05 0V-543H4240.05V-366.9Q4249.3 -444.7 4287.05 -490Q4337.05 -550 4434.05 -550H4454.05V-429H4416.05Q4346.05 -429 4307.55 -391.5Q4269.05 -354 4269.05 -283V0ZM4579.05 0V-439H4503.05V-543H4718.05V0ZM5136.05 -115Q5176.05 -115 5209.05 -133Q5242.05 -151 5262.05 -185Q5282.05 -219 5282.05 -267V-302Q5282.05 -348 5261.55 -380Q5241.05 -412 5208.05 -428.5Q5175.05 -445 5136.05 -445Q5092.05 -445 5058.55 -424.5Q5025.05 -404 5006.05 -367Q4987.05 -330 4987.05 -279Q4987.05 -229 5006.05 -192Q5025.05 -155 5058.55 -135Q5092.05 -115 5136.05 -115ZM1334.05 -201V-252H1221.05Q1173.05 -252 1147.55 -228.5Q1122.05 -205 1122.05 -168Q1122.05 -131 1147.55 -108Q1173.05 -85 1221.05 -85Q1250.05 -85 1274.55 -95.5Q1299.05 -106 1315.55 -131.5Q1332.05 -157 1334.05 -201ZM2704.33 -323H2977.27Q2973.6 -348.93 2965.05 -370Q2950.05 -407 2919.55 -427Q2889.05 -447 2843.05 -447Q2797.05 -447 2765.05 -426Q2733.05 -405 2716.55 -365.5Q2708.46 -346.12 2704.33 -323ZM4630.05 -608Q4589.05 -608 4569.55 -629.5Q4550.05 -651 4550.05 -684Q4550.05 -717 4569.55 -738Q4589.05 -759 4630.05 -759Q4671.05 -759 4690.05 -738Q4709.05 -717 4709.05 -684Q4709.05 -651 4690.05 -629.5Q4671.05 -608 4630.05 -608Z"/></svg>
```

Other colourways are in `brand/final/`: `-ink`, `-paper` (reversed), `-brand` (on light) and `-brand-dark` (on dark). Use `lockup-full-*` when the symbol is already shown elsewhere on the same surface.

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

- **Clear space:** one stem width on every side, which is 12 of the symbol's 55 unit height, about 22% of its height.
- **Minimum sizes:** symbol 16 px (use `favicon-16.svg` below 24 px), lockup 96 px wide, wordmark 80 px wide.
- **One colour:** use the `-ink` file on light and the `-paper` file on dark. The shapes need no fill variation.
- **Brand colour:** `-brand` on light surfaces, `-brand-dark` on dark. Never put brand blue on a brand-blue surface.
- **Misuse:** do not stretch, rotate, recolour off-palette, outline, close the cut, or add shadows and effects. See `brand/final/misuse.svg`, a large file because its labels are converted to paths.

### Assets

Favicon, 16 px. Pixel-grid redraw, and it switches colour with the system theme.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" role="img" aria-labelledby="t" width="16" height="16"><title id="t">Framewright favicon 16</title><style>.m{fill:#3558E0}@media (prefers-color-scheme:dark){.m{fill:#7B9CFF}}</style><path class="m" d="M3 1L13 1L13 4L7 4L7 6L11 6L11 9L7 9L3 13Z"/><path class="m" d="M3 15L7 15L7 11Z"/></svg>
```

Favicon, 32 px.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-labelledby="t" width="32" height="32"><title id="t">Framewright favicon 32</title><style>.m{fill:#3558E0}@media (prefers-color-scheme:dark){.m{fill:#7B9CFF}}</style><path class="m" d="M3.5 1L21.5 1L21.5 7L9.5 7L9.5 11L18 11L18 17L9.5 17L9.5 19.5L3.5 25.5Z"/><path class="m" d="M3.5 28.5L9.5 28.5L9.5 22.5Z"/></svg>
```

App icon, rounded square. The corner radius is 22.5% of the side (115 of 512).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="t" width="512" height="512"><title id="t">Framewright app icon</title><rect width="512" height="512" rx="115" fill="#0F1115"/><path fill="#7B9CFF" d="M157.82 106L354.18 106L354.18 171.45L223.27 171.45L223.27 215.09L316 215.09L316 280.55L223.27 280.55L223.27 307.82L157.82 373.27Z"/><path fill="#7B9CFF" d="M157.82 406L223.27 406L223.27 340.55Z"/></svg>
```

App icon, maskable. Full bleed, with the mark inside the central 80% safe circle.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="t" width="512" height="512"><title id="t">Framewright maskable app icon</title><rect width="512" height="512" fill="#0F1115"/><path fill="#7B9CFF" d="M180.73 141L331.27 141L331.27 191.18L230.91 191.18L230.91 224.64L302 224.64L302 274.82L230.91 274.82L230.91 295.73L180.73 345.91Z"/><path fill="#7B9CFF" d="M180.73 371L230.91 371L230.91 320.82Z"/></svg>
```

Social avatar. Full bleed so platforms can crop it to a circle.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-labelledby="t" width="400" height="400"><title id="t">Framewright avatar</title><rect width="400" height="400" fill="#0F1115"/><path fill="#7B9CFF" d="M144.36 115L255.64 115L255.64 152.09L181.45 152.09L181.45 176.82L234 176.82L234 213.91L181.45 213.91L181.45 229.36L144.36 266.45Z"/><path fill="#7B9CFF" d="M144.36 285L181.45 285L181.45 247.91Z"/></svg>
```

Open Graph card, 1200 x 630. The lettering is converted to paths, so it needs no fonts. It is a large file; open `brand/final/og-card.svg`.

### Motion note

During an export or heavy load, the foot of the F slides along the cut axis and back, like a blade passing along its own line (1.4 s, ease-in-out, 5 units of travel). When the job finishes, the foot moves 3 units up and left to close the gap, so the F is whole. The F becomes whole when the job is done. Under `prefers-reduced-motion` the animation is off and the F stays static.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="t" width="64" height="64"><title id="t">Framewright loader</title><style>.foot{animation:cut 1.4s cubic-bezier(.65,0,.35,1) infinite}@keyframes cut{0%,100%{transform:translate(0,0)}50%{transform:translate(5px,-5px)}}@media (prefers-reduced-motion:reduce){.foot{animation:none}}</style><path fill="#7B9CFF" d="M14 5L50 5L50 17L26 17L26 25L43 25L43 37L26 37L26 42L14 54Z"/><path class="foot" fill="#7B9CFF" d="M14 60L26 60L26 48Z"/></svg>
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
  final/                symbol, wordmark, lockup (+ full), favicons, app icons,
                        avatar, og-card, loader, misuse
```
