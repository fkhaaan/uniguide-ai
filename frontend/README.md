# UniGuide AI frontend

Next.js 16.3.3 with TypeScript, Tailwind CSS 4, and App Router. The current UI is the starter page; university-assistant features are planned.

Use **Yarn only**, with the committed `yarn.lock`:

```bash
yarn install --frozen-lockfile
yarn dev
```

Open http://localhost:3000 and keep port 3000 free. The backend uses port 3001. Stop the server with Ctrl+C.

```bash
yarn lint
yarn exec tsc --noEmit --incremental false
yarn build
yarn start
```

On a fresh checkout, run `yarn build` before the standalone type check to generate route types. A clean build currently needs network access to Google Fonts.

App files live in `src/app/`. Turbopack's root is explicitly set to this frontend directory, so unrelated parent lockfiles do not influence root discovery. Do not add npm, pnpm, or Bun lockfiles.

Local `.env*` files are ignored; `.env.example` may be committed with non-secret placeholders only. Do not copy the root backend environment example into this frontend.

See the [root README](../README.md) for architecture, prerequisites, and service setup.
