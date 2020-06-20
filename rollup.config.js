import { terser } from 'rollup-plugin-terser'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import nodePolyfills from 'rollup-plugin-node-polyfills'

const plugins = () => {
  if (!process.env.PRODUCTION) {
    return [
      nodePolyfills(),
      commonjs(),
      resolve({
        preferBuiltins: true,
        browser: true
      })
    ]
  } else {
    return [
      nodePolyfills(),
      commonjs(),
      resolve({
        preferBuiltins: true,
        browser: true
      }),
      terser({
        compress: { ecma: 2019 }
      })
    ]
  }
}

export default [{

  input: 'src/main.js',
  output: [{
    file: 'dist/append-only-object-iife.js',
    format: 'iife',
    name: 'AppendOnlyObject',
    sourcemap: !process.env.PRODUCTION
  }, {
    file: 'dist/append-only-object-cjs.js',
    format: 'cjs',
    sourcemap: !process.env.PRODUCTION
  }, {
    file: 'dist/append-only-object-esm.js',
    format: 'esm',
    sourcemap: !process.env.PRODUCTION
  }, {
    file: 'dist/append-only-object-amd.js',
    format: 'amd',
    sourcemap: !process.env.PRODUCTION
  }],
  plugins: plugins()
}]
