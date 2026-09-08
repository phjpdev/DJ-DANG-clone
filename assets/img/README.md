# Image assets

**None of the original images could be retrieved.** They are served from Google's
`lh3.googleusercontent.com/sitesv/...` CDN, which returns **403 Forbidden** to every
direct request. Confirmed against all URL variants (`=w1280`, `=w2048`, `=s0`,
`=w1280-rw`, no suffix) and with browser user-agent, `Referer`, and `Sec-Fetch-*`
headers. They are session-gated and cannot be scraped.

**They have to come from the site owner** — either the original files, or by
right-click → "Save image as" on each one while signed in to the live site.

## Drop-in file names

Save each file into this folder with the exact name below. `assets/js/main.js` probes
for them on load and swaps them in automatically — no code change needed.

| File | Page / slot | Suggested size |
|---|---|---|
| `logo.png` | Header logo, every page | ~120×120, transparent PNG |
| `hero-home.jpg` | Home banner background | 1920×1080 |
| `hero-about.jpg` | About Us banner background | 1920×1080 |
| `hero-services.jpg` | Services banner background | 1920×1080 |
| `hero-resources.jpg` | Resource Center banner background | 1920×1080 |
| `hero-contact.jpg` | Contact Us banner background | 1920×1080 |
| `hero-portal.jpg` | Client Portal banner background | 1920×1080 |
| `home-footer.jpg` | Home, image row below contact block | 1280 wide |
| `services-footer.jpg` | Services, image row at foot of page | 1280 wide |
| `resource-general.jpg` | Resource Center, "General" column | 1280 wide |
| `resource-forms.jpg` | Resource Center, "Helpful Forms" column | 1280 wide |
| `resource-links.jpg` | Resource Center, "Helpful Links" column | 1280 wide |
| `resource-footer.jpg` | Resource Center, image row at foot of page | 1280 wide |
| `map.jpg` | Contact Us, map panel | 1280 wide |
| `team-mandy.jpg` | About — Mandy Dang | 600×600 square |
| `team-carly.jpg` | About — Carly Nguyen | 600×600 square |
| `team-hong.jpg` | About — Hong Tran | 600×600 square |
| `team-vinh.jpg` | About — Vinh Hoang | 600×600 square |
| `team-anh.jpg` | About — Anh Dang | 600×600 square |

## Notes

- **Team photos** are a small liberty: the live About page has no photos, only text in
  the right-hand column. The left column sits empty. If you want an exact match, delete
  the `<div class="col">…img-slot…</div>` block from each team section in
  `about-us.html`; if you have headshots, drop them in and the page fills out.
- **Banner scrim**: the live site darkens each banner photo with `#212121` at 40%
  opacity. That is reproduced in `styles.css` (`.banner-img::before`), so any photo you
  add will sit under the same overlay and the white title stays legible.
- Until a file exists, its slot shows a grey placeholder labelled with the file name it
  is waiting for, so it is obvious what is missing.
