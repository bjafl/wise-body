import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  // Bundle workspace packages — they export TypeScript source, so they can't
  // run natively in Node. Bundling them inline avoids the need to compile or
  // copy their source into the Docker runner stage.
  noExternal: ['@wise-body/db', '@wise-body/types'],
  // @prisma/client/runtime is CJS and uses dynamic require(). Adding a
  // createRequire shim at the top of the ESM bundle makes require() work.
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
})
