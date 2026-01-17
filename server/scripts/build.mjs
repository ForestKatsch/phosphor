import { build } from "esbuild";

const result = await build({
  entryPoints: ["src/index.ts"],
  outdir: "dist",
  bundle: true,
  format: "esm",
  platform: "node",
  sourcemap: true,
  target: "node22",
  logLevel: "info",
});

if (result.errors.length > 0) {
  process.exitCode = 1;
}
