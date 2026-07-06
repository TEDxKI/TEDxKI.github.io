# TEDxKI Website – Coordinator's Guide

Welcome! This guide explains how the TEDxKI website works, where its content lives, and how to safely make and publish changes — even if you've never coded before. Read it top to bottom once before you touch anything; after that, use it as a reference.

---

## 1. What this site actually is

The TEDxKI website is a set of plain HTML, CSS, and JavaScript files — **there is no React, Gatsby, or Bootstrap involved**, despite what older documentation may have said. It's a "static site": every page is just a file that a browser can open directly, with no live server doing work behind the scenes while visitors browse.

What makes it manageable is a small **build script** (`scripts/build.js`, run with `npm run build`). This script:

- reads the page templates in the repo (`index.html`, `sites/*/*.html`),
- fetches whatever content lives in **Contentful** (our content database — see below),
- stamps that content into the templates using a tool called `jsdom` (it lets a Node.js script fill in an HTML page the same way a browser would),
- and writes the finished, ready-to-publish pages into a folder called `dist/`.

So the day-to-day loop is: **edit a template or update Contentful → run `npm run build` → publish what's in `dist/`.**

---

## 2. Where content actually lives

There are two places content comes from, and knowing which one to edit is the single most important thing in this guide.

### Contentful (a content database, no coding required)

Contentful is a web app (like a fancy spreadsheet with forms) where you add/edit entries and click "Publish." The build script fetches this data automatically. Use Contentful for anything that changes often or year to year:

| Content | Contentful entry type | Notes |
|---|---|---|
| Team members (name, role, photo) | **New Team Member Card** | Filtered by the `TEAM_YEAR` value in `.env` |
| Event details, speakers, hosts, performers | **Event** | Filtered by the `EVENT_YEAR` value in `.env` |
| Watch page videos | **New Embedded Video** | Paste in a YouTube URL |
| Photos anywhere on the site (hero backgrounds, gallery photos, sponsor logos, About page images) | **Image Static** | See below — this is the one that lets you swap a photo without touching any code |

**How the photo-swapping trick works:** in the HTML, an image tag looks like this (real example from `sites/sponsors/sponsors.html`):

```html
<img data-static-code="GiftBag2" data-static-params="fm=webp&q=84&w=1200" ... />
```

That `data-static-code="GiftBag2"` is just a label. In Contentful, create (or edit) an **Image Static** entry whose `code` field is `GiftBag2` and upload the image there. Next time someone runs `npm run build`, the script (`scripts/lib/staticImages.js`) looks up that code and drops the real image URL into the page. You never need to edit the HTML to change a photo — just swap the Contentful entry and rebuild.

### Hardcoded content (lives directly in the code files)

Some content rarely changes and is just typed directly into the HTML files. To edit it, open the file in a text editor (e.g. VS Code) and change the text directly:

| Content | File to edit |
|---|---|
| Navigation menu, social media links, footer | `partials/includes.js` |
| Contact page text and email addresses | `sites/contact/contact.html` |
| Sponsorship tiers and copy | `sites/sponsors/sponsors.html` |
| About page mission/story text | `sites/about/about.html` |
| Watch page hero text and search placeholder | `sites/watch/watch.html` |
| Site-wide colors, fonts, spacing | `styles.css` (global) or the matching `sites/<page>/<page>.css` file (page-specific) |

**Rule of thumb:** if it's a person, event, video, or photo that will be different next year, it belongs in Contentful. If it's a label, a sentence of boilerplate copy, or a design choice, it's hardcoded and you edit the file directly.

---

## 3. Setting up your computer (one-time)

1. Install **VS Code**: https://code.visualstudio.com
2. Install **Node.js** (version 18 or higher): https://nodejs.org — this lets your computer run the build script.
3. Clone the repository: in VS Code, use Source Control → Clone Repository → `https://github.com/TEDxKI/TEDxKI.github.io`.
4. Get Contentful credentials from your team lead: `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`, `CONTENTFUL_ENVIRONMENT` (usually `master`).
5. Copy `.env.example` to a new file named `.env` (same folder), and fill in the values:
   ```
   CONTENTFUL_SPACE_ID=your_space_id
   CONTENTFUL_ENVIRONMENT=master
   CONTENTFUL_ACCESS_TOKEN=your_cda_token
   TEAM_YEAR=2026
   EVENT_YEAR=2025
   LANDING_HERO_ASSET_CODE=hero-background
   ```
   **Never commit `.env` to GitHub** — it holds real secrets. It's already excluded via `.gitignore`.
6. In a terminal, inside the project folder, run:
   ```bash
   npm install
   ```
   This downloads the small number of tools the build script needs. Takes a minute or two.

You're set up.

---

## 4. The everyday workflow: edit, build, preview

There is **no live-reload dev server** — every time you change something (in Contentful or in a code file), you need to re-run the build to see it.

1. Make your change — either publish an update in Contentful, or edit one of the hardcoded files listed above.
2. Build the site:
   ```bash
   npm run build
   ```
   This wipes and regenerates the `dist/` folder from scratch, fetching fresh data from Contentful each time. Takes a few seconds.
3. Preview it locally:
   ```bash
   cd dist
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser. Press `Ctrl+C` in the terminal to stop the server when you're done.
4. Click through the pages you changed (and a couple of others) to make sure nothing looks broken.

**Faster single-page rebuilds for troubleshooting:** if you only need to re-check one Contentful-driven page without rebuilding everything, you can run:
- `npm run render:events`
- `npm run render:team`
- `npm run render:landing`

These are shortcuts for debugging — for a real publish, always run the full `npm run build`.

---

## 5. Publishing to staging (a preview link anyone can check)

The `docs/` folder in this repository is what GitHub Pages serves at **https://tedxki.github.io** — a preview link you can share with the team before anything goes live on the real domain. It is not indexed by search engines, but anyone with the link can view it.

To publish your latest build there:

```bash
npm run build
rm -rf docs/* && cp -r dist/* docs/
```

(On Windows PowerShell: `Remove-Item docs\* -Recurse -Force` then `Copy-Item -Path dist\* -Destination docs\ -Recurse`.)

Then commit and push the `docs/` changes through VS Code's Source Control panel (or `git add docs && git commit -m "Update staging" && git push`). Wait a couple of minutes for GitHub Pages to rebuild, then check `https://tedxki.github.io`.

This step is entirely manual — there is no automation that does it for you, so it's easy to forget. If the staging site looks stale, this is almost always why.

---

## 6. Publishing to production (Namecheap, the live site)

Once staging looks correct and the team has reviewed it:

1. Build fresh if you haven't already: `npm run build`.
2. Open the `dist/` folder, select everything **inside** it (not the folder itself), and compress it into a zip file.
3. Log into Namecheap → cPanel → File Manager for the site.
4. As a safety net, rename the existing `public_html` folder (e.g. `public_html_backup_2026-07-07`) so you can revert if something breaks.
5. Upload the zip into File Manager, then right-click → Extract, extracting into `public_html`.
6. Open the live site and force-refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) to bypass any cached files, and check your changes are there.

If something looks broken, rename the backup folder back to `public_html` to instantly revert.

---

## 7. Full workflow, start to finish

```
1. Update Contentful and/or edit a hardcoded file
2. npm run build                          → regenerates dist/
3. cd dist && python3 -m http.server 8000 → preview locally, check your change
4. rm -rf docs/* && cp -r dist/* docs/    → copy to staging
   git add docs && git commit -m "..." && git push
5. Check https://tedxki.github.io, get team approval
6. Zip dist/ contents → upload via Namecheap cPanel → extract into public_html
7. Check the live site
```

---

## 8. Maintaining the site year to year

Once a year, when handing over to a new team or event:

1. In `.env`, bump `TEAM_YEAR` and `EVENT_YEAR` to the new year.
2. In Contentful, create the new year's **Event** entry (with its speakers/hosts/performers/teams) and the new **New Team Member Card** entries.
3. Rebuild (`npm run build`), then run through the staging and production publish steps above.
4. Spot-check the pages that pull from Contentful especially closely: Team, Events, and Watch.
5. Add new talk recordings to the Watch page as they become available (see below).

### Adding a new Watch page video

1. Upload the recording to the TEDxKI YouTube account (set visibility to "Unlisted").
2. In Contentful, create a **New Embedded Video** entry: title, speaker, year, and the YouTube URL.
3. Publish the entry, then rebuild and redeploy the site as usual.

### Contact / sponsorship forms

The forms embedded on the Contact and Sponsors pages are Google Forms, not part of this codebase. To change a form's fields, edit it directly in Google Forms — changes appear immediately since the site just embeds it. If you replace a form entirely with a new one, update the `<iframe>` URL in the relevant HTML file and rebuild.

---

## 9. Secrets and credentials

- The only secret this codebase touches is the Contentful access token, stored in `.env`. It's read only at build time on your own computer — it never gets shipped to visitors' browsers, and it's excluded from git via `.gitignore`.
- To rotate the token: generate a new one in Contentful's settings, replace the value in `.env`, and rebuild. No other files need to change.
- Namecheap and Google account credentials aren't stored anywhere in this repository — share those only through your team's password manager, not over chat or email.

---

## 10. Troubleshooting

**`npm install` fails** — confirm Node.js 18+ is installed (`node --version`); try deleting `node_modules/` and `package-lock.json` and running it again.

**Build fails, mentions missing Contentful credentials** — check that `.env` (not `.env.example`) exists in the project root and all four Contentful values are filled in with no stray quotes or spaces.

**A whole section of a page is blank after building** — the Contentful query for that content returned nothing. Double check `TEAM_YEAR`/`EVENT_YEAR` in `.env` match a year that actually has a published entry in Contentful.

**An image won't update no matter what I do in Contentful** — check that the `code` field on the Contentful Image Static entry exactly matches the `data-static-code` in the HTML (case-sensitive).

**Staging or the live site shows old content** — you likely forgot to run the copy-to-`docs/` step or the Namecheap upload after rebuilding. Both are manual steps; rebuilding alone changes nothing published.

---

## 11. File map (for a deeper look)

- `scripts/build.js` — orchestrates the whole build; run through this file first if you want to understand the pipeline.
- `scripts/lib/contentful.js` — the small client that talks to Contentful's API.
- `scripts/queries/*.js` — exactly what data is requested from Contentful for each page.
- `scripts/lib/staticImages.js` — the mechanism behind the `data-static-code` image-swapping trick.
- `partials/includes.js` — the shared header, social links, and footer used on every page. `partials/newsletter.txt` is not live code — it's a saved snippet documenting how to bring back a newsletter popup feature if it's ever wanted again.
- `sites/<page>/` — one folder per page (`about`, `contact`, `events`, `sponsors`, `team`, `watch`), each with its own HTML, CSS, and JS.
- `assets/` — images, icons, and fonts.
- `dist/` — build output; regenerated every time you run `npm run build`, safe to ignore in git.
- `docs/` — the GitHub Pages staging copy; this one **is** committed to git, since GitHub Pages requires it.

---

## 12. Handoff checklist

Before passing the coordinator role to someone else, make sure they have:

- [ ] Contentful login and access to the TEDxKI space
- [ ] GitHub repository access
- [ ] Namecheap login credentials
- [ ] Google Forms / Google Drive access for form responses
- [ ] This README
- [ ] Contact info for the outgoing coordinator or original developer, in case something unusual comes up
