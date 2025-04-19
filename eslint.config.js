const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat();

module.exports = [
  ...compat.extends('react-app'),
  ...compat.extends('react-app/jest'),
]; 