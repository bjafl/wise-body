import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  // Bundle workspace packages — they export TypeScript source, so they can't
  // run natively in Node. Bundling them inline avoids the need to compile or
  // copy their source into the Docker runner stage.
  noExternal: ['@wise-body/db', '@wise-body/types'],
})
