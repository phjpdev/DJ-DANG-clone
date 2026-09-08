# Dang & Associates, LLC — static rebuild

A hand-written HTML/CSS/JS rebuild of `dangassociatesllc.com`, which currently runs on
Google Sites. Same six pages, same section order, same column layout, same type scale
and palette — but as plain files that can be hosted anywhere and edited normally.

## Running it

No build step, no dependencies. Open `index.html`, or serve the folder:

```bash
npx serve .
# or
python -m http.server 8000
```

## Structure

```
.
├── index.html              Home
├── about-us.html           About Us + 5 team sections
├── services.html           4 service sections
├── resource-center.html    3-column forms & links
├── contact-us.html         Intro, contact details, map slot
├── client-portal.html      Portal welcome
└── assets/
    ├── css/styles.css      Theme reimplementation, tokens at top
    ├── js/main.js          Nav, image probes, search, form
    └── img/                Drop the real images here — see img/README.md
```

No templating layer, so the header and footer are repeated in each page. Editing one
means editing all six.

## Where the design values came from

Everything was read out of the live site rather than eyeballed:

- **Inline theme block** on each page → the colour and type scale
- **`atari.css`** (Google's stylesheet, ~1.6 MB) → layout geometry

### Type scale

Google Sites authors these in points. Converted at 1pt = 1.3333px.

| Role | Class on live site | Size | Weight | Line-height | Colour |
|---|---|---|---|---|---|
| Body | `.zfr3Q` | 11pt / 14.67px | 400 | 1.6667 | `#212121` |
| H1 | `.duRjpb` | 34pt / 45.33px | 300 | 1.2 | `#226e93` |
| H2 | `.JYVBee` | 19pt / 25.33px | 400 | 1.4 | `#226e93` |
| H3 | `.OmQG5e` | 15pt / 20px | 400 | 1.25 | `#212121` |
| Banner H1 | `.LB7kq .duRjpb` | 64pt / 85.33px | 300 | 1.0 | `#ffffff` |

Banner H1 carries `letter-spacing: 2px`; body H1 carries `0.5px`. Page content then
overrides body copy and sub-heads to 12pt pure black inline — reproduced as `.t12` /
`.b12`. Font is **Lato** 300/400/700, loaded from the same Google Fonts URL the
original uses.

### Palette

| Token | Value | Use |
|---|---|---|
| `--blue` | `#226e93` | Headings |
| `--blue-alt` | `#1e6c93` | Buttons, links |
| `--blue-light` | `#49aad4` | Accents |
| `--ink` | `#212121` | Body copy, banner scrim |
| `--grey` | `#f2f2f2` | Placeholder surfaces |

### Layout

| Value | Source |
|---|---|
| Content max-width `1280px`, padding `0 48px` | `.LS81yb` |
| Section is `display:table`, cell `vertical-align:middle` | `.yaqOZd` / `.mYVXT` |
| Section padding `1.5rem 0` at ≥768px | `.yaqOZd:not(.LB7kq):not(.WxWicb)` |
| Column padding `8px`, or `14px 8px` in the home two-column row | `.mGzaTb` / `.yYI8W .mGzaTb` |
| Header height `56px`, transparent, overlaid on the banner | `.sPG4ze section:first-child .mYVXT` |
| Banner scrim `#212121` at 40% opacity | `.O13XJf .IFuOkc:before` |
| List padding-left `20px`, items indented `15pt` | `.n8H08c` + page inline styles |

Breakpoints mirror the theme's own: `≤479px` and `480–767px` each step the headings
down, and columns stack below 768px.

## Page structure

Reproduced section by section, including the empty columns and the zero-height spacer
sections (`.WxWicb`) the original uses for vertical rhythm.

| Page | Sections |
|---|---|
| Home | banner → tagline → 2-col (Why Choose \| Process) → spacer → Get Started → 2-col contact → image row |
| About Us | banner → intro → 5 × 2-col team sections |
| Services | banner → 4 × 1-col service sections → image row |
| Resource Center | banner → spacer → 3-col (General \| Forms \| Links) → image row |
| Contact Us | banner → spacer ×2 → intro → 2-col details → spacer → map |
| Client Portal | banner → welcome |

## Search

The magnifier in the header opens `search.html`, a client-side rebuild of the Google
Sites search view: grey backdrop, floating search bar, white results card headed
"Results from this site", blue result titles, snippets with matched terms emboldened,
and a "Last modified on …" line.

- The query lives in the URL (`search.html?query=tax&scope=site`), so results are
  linkable and browser back/forward work.
- Results filter live as you type; Escape or the ✕ clears.
- Clicking a result opens the page with `?highlight=<query>`, and `main.js` marks
  those terms in the body and scrolls to the first one.

### Rebuilding the index

Page text is compiled into `assets/js/search-index.js`. **Re-run the generator after
editing any page copy**, or search will return stale snippets:

```powershell
powershell -File tools\build-search-index.ps1
```

It strips the header, footer, and form controls so shared chrome never pollutes a
snippet. The `modified` date per page is set in that script.

## Images

Five images you supplied are in place:

| File | Source | Used by |
|---|---|---|
| `hero-home.jpg` | notebook + pen on tablet, 2560×1709 | Banner on **all six pages** (the live site reuses one banner everywhere) |
| `home-footer.jpg` | "Enrolled Agent" badge, 604×159 | Home, image row below the contact block |
| `services-footer.jpg` | glasses on laptop, 1280×709 | Services, image row at foot of page |
| `resource-general.jpg` | stamps + magnifier, 450×247 | Resource Center, "General" column |
| `resource-forms.jpg` | glasses on cheque, 400×223 | Resource Center, "Helpful Forms" column |

`hero-about.jpg`, `hero-services.jpg`, `hero-resources.jpg`, `hero-contact.jpg` and
`hero-portal.jpg` are copies of `hero-home.jpg`. Replace any of them individually if a
page should get its own banner.

**Placement of the four non-banner images is my best guess** — swap any two by renaming
the files. Still outstanding: `logo.png`, `map.jpg`, `resource-links.jpg`,
`resource-footer.jpg`, and the five `team-*.jpg` headshots. Those slots show a grey
placeholder labelled with the filename they want; see
[`assets/img/README.md`](assets/img/README.md).

## Two additions, clearly marked

The live site has neither of these. Both are wrapped in `OPTIONAL ADDITION` comments —
delete the block to get back to a pure 1:1 clone.

1. **Contact form**, in the empty left column of the contact details section. Runs in
   demo mode until you set `FORM_ENDPOINT` in `assets/js/main.js` (Formspree,
   Web3Forms, Netlify, or your own handler — anything taking a `FormData` POST). Has
   inline validation and a honeypot field.
2. **"Sign In to the Portal" button** on `client-portal.html`, pointing at `#`. Replace
   with your provider URL.

The About page team sections also include a photo column the original does not have —
see the note in `assets/img/README.md` if you want it removed.

## Typos carried by the live site

Corrected here. Revert any of them if you would rather match character for character:

| Live site | Here |
|---|---|
| "Frederickbsurg" (About) | Fredericksburg |
| "IRS AUDIT RESPRESETATION" | IRS AUDIT REPRESENTATION |
| "B OOKKEEPING SERVICES" | BOOKKEEPING SERVICES |
| "Where My's Refund?" | Where's My Refund? |

The Resource Center lists a **D-4 Form** with no link on the live site. Left unlinked
here to match.
