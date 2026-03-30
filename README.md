# andrewblowe.com

Personal site for Andrew Blowe. Plain HTML/CSS/JS — no build step, no dependencies except CDN scripts.

## Stack

| Layer    | Choice          | Why                                      |
|----------|-----------------|------------------------------------------|
| Hosting  | Vercel          | Push-to-deploy, free, fast CDN           |
| DNS      | AWS Route 53    | A record → 76.76.21.21                   |
| 3D       | Three.js (CDN)  | `projects.html` pottery wheel only       |
| Fonts    | Self-hosted woff + Google Fonts (Jura) | No layout shift |

## Structure

```
andrewblowe-site/
├── index.html        # Home — typing terminal, profile photo
├── portfolio.html    # Career timeline
├── projects.html     # Fun/interactive experiments
├── style.css         # All shared styles
├── terminal.js       # Typing animation for index.html
├── gallery.js        # Click-to-expand image gallery (portfolio)
├── portfolio.js      # Scroll-active dot highlight (portfolio)
├── clay.js           # Three.js pottery wheel (projects)
├── images/           # Profile photo, portfolio screenshots, favicon
└── fonts/            # texgyreheros-regular-webfont.woff
```

## Local development

No build step needed — open files directly in a browser, or run a simple server to avoid CORS issues with local assets:

```bash
npx serve .
# or
python3 -m http.server 3000
```

## Deploy

Push to `main` on GitHub → Vercel auto-deploys to production in ~10 seconds.

```bash
git add .
git commit -m "your message"
git push
```

Vercel project: `tehandybs-projects/andrewblowe-site`
Production URL: `andrewblowe.com` + `www.andrewblowe.com`

## Adding a new page

1. Copy the nav block from any existing page
2. Add the new nav link to `index.html`, `portfolio.html`, `projects.html`, and the new page
3. Link your page-specific CSS at the bottom of `style.css` or inline a `<style>` block

## Pottery wheel (`clay.js`)

The wheel uses Three.js `LatheGeometry` — a rotationally symmetric mesh defined by a 2D silhouette (profile). Instead of moving individual 3D vertices, deformation modifies this profile array, then the geometry is rebuilt each frame during interaction.

**Key constants in `clay.js`:**

| Constant     | Default | Effect                                              |
|--------------|---------|-----------------------------------------------------|
| `PROFILE_N`  | 72      | Profile resolution — more points = smoother curves |
| `LATHE_SEGS` | 80      | Radial segments — more = rounder rotation           |
| `H`          | 0.85    | Half-height of clay in 3D units                     |
| `BASE_R`     | 0.48    | Starting radius of the sphere                       |
| `BRUSH_H`    | 0.18    | Vertical influence radius of the tool               |
| `BRUSH_STR`  | 0.003   | Deformation per frame at brush center               |
| `SPIN_SPEED` | 0.7     | Radians per second                                  |

**Controls:**
- Mouse move — position tool up/down
- Click + hold — sculpt (carve or expand depending on mode)
- `R` — reset to sphere
- `S` — smooth the profile
- `C` / `E` — switch to carve / expand mode

**To add a new tool shape:** modify the geometry built in `initScene()` for `toolGroup`. The tip sphere and rod are standard Three.js meshes — swap for any geometry.

**Performance:** `LatheGeometry` rebuild runs every frame during active sculpting. At `PROFILE_N=72, LATHE_SEGS=80` this is fast (~6000 faces). If you increase resolution significantly, consider rebuilding only when the profile changes above a threshold.

**Three.js version:** `0.160.0` loaded from jsDelivr CDN. To upgrade, update the script `src` in `projects.html`. The pottery wheel only uses core Three.js — no add-ons needed.

## Adding a new project to `projects.html`

Add a new `<section>` below the `.clay-section`:

```html
<section class="project-section">
  <h2 class="project-title">Project Name</h2>
  <!-- your content -->
</section>
```

And add the corresponding styles to `style.css` under `/* ── Projects page ── */`.
