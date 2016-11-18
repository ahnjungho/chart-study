import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import strip from 'rollup-plugin-strip';

export default {
  entry: './entry.js',
  format: 'iife',
  moduleName: 'charts',
  plugins: [
    json(),
    babel({
      babelrc: false
    }),
    strip({
      functions: [ 'console.log'],
    })
  ],
  dest: './bundle.js',
  globals: {
    d3: 'd3',
  },
};
