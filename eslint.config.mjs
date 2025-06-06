import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // This object adds or overrides specific ESLint rules
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Disables the rule for 'any' types
    },
  },
  {
    // Ignore the generated Prisma client files and other generated content
    ignores: ["src/generated/**"],
  },
];

export default eslintConfig;