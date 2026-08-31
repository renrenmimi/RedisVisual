import { defineConfig } from "vitest/config";

// Unit tests target the pure simulation engine, which needs no DOM.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
