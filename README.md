# neataptic-ts

Neuro-evolution is easier to trust when you can watch it run. This is a small TypeScript sandbox for the
[`neataptic`](https://www.npmjs.com/package/neataptic) library — networks that evolve by mutation instead of
being trained by hand — served through a tiny Express API so experiments can be run and read from a browser.

**Experiments, not a framework.** Nothing here is published to npm and nothing is promised to be stable.

## What it does

- Evolves neural networks with `neataptic` from a TypeScript source tree.
- Serves the experiments over HTTP with `express` and `helmet` for a hardened default header set.
- Reads configuration from the environment with `dotenv`.
- Keeps a `data.csv` beside the code so a run is reproducible against the same input.

## Run it

```bash
npm install
cp .env.example .env    # if the file is present in your checkout
npm run dev             # tsx watch src/server.ts
```

Build and run the compiled output:

```bash
npm run build           # rimraf dist && tsc
npm start               # node dist/src/server.js
```

## Check it

```bash
npm run lint            # eslint src/**/*.ts --fix
npm test                # lint, then tsc, then a clean git status
```

## Licence

MIT — see [LICENSE](./LICENSE).
