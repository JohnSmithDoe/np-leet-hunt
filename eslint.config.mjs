// @ts-check
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: [
            '**/dist/**',
            '**/coverage/**',
            '**/node_modules/**',
            'apps/old/**',
            'apps/np-leet-hunt/android/**',
            'apps/np-leet-hunt/ios/**',
            '**/*.spec.ts',
            '**/vitest.config.ts',
            '**/playwright.config.ts',
            '**/capacitor.config.ts',
            'eslint.config.mjs',
            'tools/**',
        ],
    },
    {
        files: ['**/*.ts'],
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked,
            ...angular.configs.tsRecommended,
            prettierRecommended,
        ],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        processor: angular.processInlineTemplates,
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            "@typescript-eslint/no-misused-promises": [
                "warn",
                {
                    "checksVoidReturn": true,
                    "checksConditionals": true
                }
            ],
            // Re-enabled in Leet-26: Phaser 4 is TS-native, so its surface is now properly typed and
            // these only fire at genuine untyped boundaries (suppressed locally where unavoidable).
            "@typescript-eslint/no-unsafe-call": "error",
            "@typescript-eslint/no-unsafe-assignment": "error",
            "@typescript-eslint/no-unsafe-argument": "error",
            "@typescript-eslint/no-unsafe-member-access": "error",
            "@typescript-eslint/no-unsafe-return": "error",
            "@typescript-eslint/unbound-method": "off",
            "@typescript-eslint/restrict-plus-operands": "error",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-floating-promises": [
                "error",
                {
                    "ignoreVoid": true,
                    "ignoreIIFE": true
                }
            ],
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/require-await": "off",
            "no-empty-function": "off",
            "@typescript-eslint/no-empty-function": [
                "error",
                {
                    "allow": ["constructors"]
                }
            ],
            "@typescript-eslint/await-thenable": "off",
            "@typescript-eslint/no-unused-vars": "error",
            "no-unused-expressions": "off",
            "@typescript-eslint/no-unused-expressions": [
                "error",
                {
                    "allowShortCircuit": true,
                    "allowTernary": true
                }
            ],
            // the codebase interleaves #private and public members by design; the v8 defaults reject that
            "@typescript-eslint/member-ordering": "off",
            // unions like `'bg' | 'np' | 'fg' | 'ui' | string` are used as documented-but-open key types
            "@typescript-eslint/no-redundant-type-constituents": "off",
            // WIP game code keeps placeholder #private fields around
            "no-unused-private-class-members": "off",
            "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
            "dot-notation": "off",
            "@typescript-eslint/dot-notation": "error",
            "no-shadow": "off",
            "@typescript-eslint/no-shadow": "error",
            "@typescript-eslint/no-this-alias": [
                "error",
                {
                    "allowedNames": ["self"]
                }
            ],
            "@angular-eslint/no-empty-lifecycle-method": "off",
            "@angular-eslint/component-class-suffix": "error",
            "@angular-eslint/directive-selector": [
                "error",
                {
                    "type": "attribute",
                    "prefix": ["np"],
                    "style": "camelCase"
                }
            ],
            "@angular-eslint/component-selector": [
                "error",
                {
                    "type": "element",
                    "prefix": ["np"],
                    "style": "kebab-case"
                }
            ],
            "yoda": ["error", "never"],
            "no-prototype-builtins": "off",
            "simple-import-sort/imports": "error",
            "no-compare-neg-zero": "error",
            "eqeqeq": "error",
            "arrow-body-style": ["error", "as-needed"],
            "prefer-arrow-callback": "error",
            "no-undef-init": "error",
            "max-classes-per-file": ["error", 1]
        },
    },
    {
        files: ['**/*.html'],
        extends: [...angular.configs.templateRecommended],
        rules: {},
    }
);
