import babel from 'rollup-plugin-babel';

module.exports = {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/picture-compressor-plus.es.js',
      format: 'es',
    },
    {
      file: 'dist/picture-compressor-plus.js',
      format: 'umd',
      name: 'pictureCompress',
    },
  ],
  plugins: [
    babel({
      exclude: '**/node_modules/**',
    }),
  ],
};
