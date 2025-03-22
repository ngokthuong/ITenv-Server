import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
    },
    rules: {
      'no-unused-vars': 'warn', // Cảnh báo biến không dùng
      'no-console': 'off', // Cho phép console.log
      semi: ['error', 'always'], // Bắt buộc dùng dấu chấm phẩy
    },
    ignores: ['node_modules', 'dist'], // Bỏ qua thư mục
  },
];
