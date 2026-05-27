# HINDSIGHT

Logic puzzle game: undo every move in the right order until the board is empty.

## Play locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm test
npm run build
```

## Generate levels

```bash
npm run generate:levels:fresh   # mine all 100 from scratch
npm run generate:levels         # resume from checkpoint
npm run verify:levels           # solvability check
```

## Deploy (GitHub Pages)

After push to `main`, Actions builds and deploys to  
https://sarusss1-glitc.github.io/brilliantss-hindsight/

**Required once per repo:** **Settings → Pages → Build and deployment → Source: `GitHub Actions`**, then re-run the workflow (or push again). Without this, the build succeeds but deploy fails.

## Stack

Vite, React, TypeScript, Tailwind CSS.
