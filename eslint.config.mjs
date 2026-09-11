import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The Capacitor wrapper is a separate project with its own toolchain and
    // dependency tree; linting it from here resolves against the web app's
    // node_modules and fails on imports it cannot see.
    "apps/**",
    // `vercel build` writes minified bundles and generated launchers here.
    // They are gitignored, but ESLint's flat config does not read .gitignore,
    // so without this a local `vercel build` makes `yarn lint` fail with ~49
    // errors in vendor code that nobody wrote.
    ".vercel/**",
  ]),
]);

export default eslintConfig;
