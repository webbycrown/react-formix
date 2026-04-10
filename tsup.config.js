import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.js"],
    format: ["cjs", "esm"],
    dts: false,
    clean: true,
    sourcemap: true,
});