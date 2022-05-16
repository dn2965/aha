module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true
    },
    extends: ['airbnb', 'airbnb/hooks'],
    // 'extends': 'google',
    // "extends": ["eslint:recommended", "google"],
    parserOptions: {
        ecmaVersion: 'latest'
    },
    rules: {
        'max-len': ['error', {code: 200}],
        'indent': 'off',
        "comma-dangle": ["error", {
            "arrays": "never",
            "objects": "never",
            "imports": "never",
            "exports": "never",
            "functions": "never"
        }]
    }
};
