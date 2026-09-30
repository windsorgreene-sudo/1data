import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/three/scenes/**", "src/components/fx/ParticleGlobe.tsx"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [
        { regex: "^(three|postprocessing)(/|$)|^@react-three/", message: "three code lives in src/components/three/scenes and loads via React.lazy" },
        { group: ["**/three/scenes/*", "**/three/scenes", "@/components/three/scenes/*"], allowTypeImports: true, message: "Load scenes with React.lazy(() => import(...))" },
        { group: ["**/fx/ParticleGlobe", "./ParticleGlobe"], allowTypeImports: true, message: "Load ParticleGlobe through LazyGlobe" },
      ] }],
    },
  }
);
