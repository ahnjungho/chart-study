import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';

export default {
  entry: './entry.js',
  format: 'iife',
  moduleName: 'charts',
  plugins: [
    json(),
    babel({
      babelrc: false
    })
  ],
  dest: './bundle.js',
  globals: {
    d3: 'd3',
  },
};
