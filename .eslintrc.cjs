module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:tailwindcss/recommended",
    "prettier",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "simple-import-sort", "tailwindcss"],
  settings: {
    tailwindcss: {
      callees: ["twMerge", "createTheme"],
      classRegex: "^(class(Name)|thestorybme)?$",
    },
  },
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "tailwindcss/no-custom-classname": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "no-empty-pattern": "off",
    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }], // Disallow console.log, allow console.warn and console.error
  },
};
