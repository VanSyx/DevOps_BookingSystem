module.exports = [
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                console: 'readonly',
                module: 'readonly',
                require: 'readonly',
                process: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-undef': 'error',
        },
    },
];
