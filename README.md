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

If deploy fails on the first run: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Stack

Vite, React, TypeScript, Tailwind CSS.
