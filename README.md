# DeutschDaily 📖

A mobile-first, installable German reading website built with **React, TypeScript, Vite, and CSS**, designed for a small-screen, app-like experience. All content is original for this project; no PDFs or other Deutsch-to-go material are reused.

## Story library — 150 **distinct original stories**

| Level | Unique plots | Reading focus |
|---|---:|---|
| A2 | 50 | Concrete everyday situations, accessible vocabulary, shorter sentences |
| B1 | 50 | Narrated events, causes and consequences, subordinate and relative clauses |
| B2 | 50 | More abstract subjects, nuanced arguments, conditional explanations, varied syntax |
| C1 | 0 | Coming soon |
| C2 | 0 | Coming soon |

**All 150 previous texts have been replaced.** No plot is deliberately repeated at another level. Each replacement has a distinct German story (162–200 words), a paragraph-by-paragraph English translation, and three story-specific German comprehension questions. A2, B1, and B2 are intended CEFR learning levels, **not externally certified ratings**.

Story titles, IDs, and German paragraphs are checked for exact duplication. Automated checks also enforce level counts, the JSON schema, paragraph alignment, length, and quiz structure. **Editorial review is still recommended before promotion as professionally validated language teaching material.** Automated validation does not prove CEFR suitability or translation quality.

**Your old local bookmarks/progress:** This is an entirely new story collection, so links to deleted stories will no longer resolve. The UI filters unavailable IDs. New reading progress begins with the replacement texts. Browser data for the previous texts can be cleared manually if desired.

## Run in VS Code

Install Node.js 20+ and run:

```bash
npm install
npm run dev
```

Open the address printed by Vite, normally http://localhost:5173. To test from your Android phone on the same Wi-Fi, visit `http://YOUR_COMPUTER_IP:5173` while the development server is running.

## Validate and build

```bash
npm run validate:stories
npm run build
npm run preview
```

`npm run build` automatically executes story validation first. Node modules are installed locally by `npm install`; never commit `node_modules/`.

## Story file layout

Each text has a **separate JSON file**:

```text
src/
  data/
    types.ts
    stories.ts             # tiny auto-discovery index; no story contents
    stories/
      A2/
        a2-der-kuchen-fuer-den-falschen-tisch.json
        ... 49 more
      B1/
        b1-die-letzte-faehre.json
        ... 49 more
      B2/
        b2-das-urteil-des-algorithmus.json
        ... 49 more
scripts/
  validate-stories.mjs
```

Vite's `import.meta.glob('./stories/**/*.json')` automatically finds every file and assembles the searchable in-app catalog. You **do not** need to add imports when adding a story. During the production build, Vite bundles the content into static website assets; this is compatible with GitHub Pages and offline PWA caching.

To add a new story, copy an existing JSON file into the correct level folder, give it a unique `id`, then edit the German paragraphs, English paragraphs, and three quiz questions. Run `npm run validate:stories`. The validator currently expects **exactly 50 texts in each of A2, B1, and B2**; adjust those counts when you intentionally expand the library.

All previous story IDs were intentionally replaced, so earlier bookmarks will not refer to the new collection. Progress for new stories is stored per-device in browser local storage, not synced to any server.

## Publish with GitHub Pages

1. Create a new public GitHub repository called `deutschdaily` (separate from `portfolio`).
2. Push the contents of this project to its `main` branch.
3. In GitHub, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. The included `.github/workflows/deploy.yml` publishes the production build at:
   `https://abrar-04.github.io/deutschdaily/`
5. Add a link in your portfolio that opens this URL in a new tab.

If you use another repository name, adjust `VITE_BASE_PATH` / the `base` in `vite.config.ts`. The app uses HashRouter so individual reading URLs work on GitHub Pages without server-side route rewriting.

## Features

- Mobile-first responsive layout, Android-friendly bottom tabs
- Searchable level-specific story library
- Reader with adjustable font size, dark mode, and a show/hide English translation
- German text-to-speech (availability depends on browser and device voice support)
- Three quiz questions per reading
- Bookmarks, reading history and completed readings stored locally
- PWA install prompt support and offline assets after an online load over HTTPS
- No user accounts, database, AI API, third-party copyrighted lesson content, or paywall

## Notes

- Every story has its own plot. The collections are not rewrites of the same 50 narratives.
- Browser speech synthesis quality varies; there are no downloaded audio recordings.
- The story library is bundled into the app; despite 150 JSON source files, your visitors don't make 150 separate JSON requests.
- Automated structural validation cannot guarantee that every English sentence is a precise translation, or certify a CEFR level. Human editorial review remains recommended.
