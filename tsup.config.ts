import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
  // react/react-dom are peer deps — never bundle them.
  external: ['react', 'react-dom'],
  // Inject the shimmer CSS into the JS so consumers get zero-config styling
  // (no separate `import 'skeletonme/styles.css'` required).
  injectStyle: true,
})
