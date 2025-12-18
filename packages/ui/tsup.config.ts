import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.tsx', 'src/**/*.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
  splitting: false,
  sourcemap: true,
  minify: false,
  treeshake: true,
});
