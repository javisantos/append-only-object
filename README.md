# append-only-object

![alt node](https://img.shields.io/badge/node->=10.16.0-brightgreen.svg)
![alt version](https://img.shields.io/npm/v/append-only-object)
![alt size](https://img.shields.io/bundlephobia/min/append-only-object)
![alt gzipped](https://img.shields.io/bundlephobia/minzip/append-only-object)

A way to `append only` objects (deltas) to objects

## Why

I wanted to learn about javascript [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). As you can see, the tests are a bit funny as i started this side project after having my second children. And i didn't find similar libraries, so i made it public. 

| Added some modifications to be aligned with [Peer DID method specification](https://dhh1128.github.io/peer-did-method-spec/index.html).

## Features


- The target object is mutated by default, can change this behaviour setting `opts.inmutable` to true
- The initial values can be set without `id` to be undeletables
- An `id` (hyperid) is added to all the objects appended if no `id` is included
- Can `delete` any object by his `id`
- Can `append` atomatically a timestamp setting `opts.when` to true
- Can't `append` deep equal object to an array, 
- Can't `append` an object with an id already deleted

## Installation

Available through the 
[npm registry](http://npmjs.com/package/append-only-object). It can be installed using the 
[`npm`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally)
or 
[`yarn`](https://yarnpkg.com/en/)
command line tools.

```sh
npm install append-only-object --save
```

## Usage

```js
import AppendOnlyObject from 'append-only-object'

const me = new AppendOnlyObject({ name: 'javi' })

me.append({ surname: [{ id: 'surname', value: 'Santos' }] })
me.append({ wife: 'Sam' })
me.append({ childrens: [{ value: 'Adam' }] })
const addSecondChildren = me.append({ childrens: [{ id: 'second', value: 'Matt' }] }, { patch: true })
me.append({ errors: { id: 'error', value: 'An error' } })
me.delete('error')

me.name = 'noop'
delete me.name
me.wife = null
me.childrens[0].value = 'noop'
me.childrens.push({value: 'noop' })

console.log(me)
console.log(me.deleted)
console.log(addSecondChildren)
```
output:

```js
{
  name: 'Javi',
  surname: [ { id: 'surname', value: 'Santos' } ],
  wife: 'Sam',
  childrens: [
    { value: 'Adam', id: 'uoNymdl6Q3W6vO-xL-Kwkw-2' },
    { value: 'Matt', id: 'second' }
  ]
}
Set { 'error' }
{
  id: 'uoNymdl6Q3W6vO-xL-Kwkw-4',
  change: { childrens: [ [Object] ] },
  patch: [ { op: 'add', path: '/childrens/1', value: [Object] } ]
}
```

See tests and example.js for more info.

## API

### `new AppendOnlyObject(target, [options])`

This class creates an append only object, where you can only `append` and `"delete"`.

`target` is the initial object.

`options` to control the object returned by the `append` method, include:

``` js
{
  strict: true, // set to false if you want to be able to `modify` (without overwrite or delete) an object or array (ex. push to an array or add a prop to an existent object).
  unique: true, // set to false if you want to allow objects with the same id.
  deepequal: false // set to true to allow deep equal objects inside arrays. (Make sense with unique=false)
  encode: false, // to encode the `change` value. Other options json|base64url|base64|hex|binary
  by: true, // by default return the uuid used to generate the ids. Can send an `object` or `array`.
  when: true, // add an (ISO 8601) `when` value.
  patch: false // set to true if you want a (RFC6902) `patch` object tu be returned.
  previous: false, // set to true to receive the `previous` object before the append.
  deletable: true, // set to false if you don't want to autogenerate an id if doesn't exist. Remember, only object with id are deletable.
}
```
| All the `options` can be set `globally` in the creation of the object or with more `priority` (except `strict`, `unique` and `deepequal`) in the `append` or `deleted` methods.

### `append(delta, [options])`

This method appends the delta to an already created `AppendOnlyObject`.


### `delete(id, [options])`

The id can be a `string` or an `array` of strings.

Removes all matching object with this id. Adds the id to the AppendOnlyObject`.deleted` (the property is hidden, and is an iterable `Set()`.

## Tests

```sh
npm install
npm run test
```

## Dependencies

- [fast-json-patch](https://ghub.io/fast-json-patch): Used to return an optional `patch` object
- [hyperid](https://ghub.io/hyperid): Used to generate an `id` for each object

## Dev Dependencies

- [@rollup/plugin-commonjs](https://ghub.io/@rollup/plugin-commonjs): Convert CommonJS modules to ES2015
- [del-cli](https://ghub.io/del-cli): Delete files and directories - Cross-platform
- [eslint](https://ghub.io/eslint): An AST-based pattern checker for JavaScript.
- [eslint-config-standard](https://ghub.io/eslint-config-standard): JavaScript Standard Style - ESLint Shareable Config
- [eslint-plugin-import](https://ghub.io/eslint-plugin-import): Import with sanity.
- [eslint-plugin-node](https://ghub.io/eslint-plugin-node): Additional ESLint&#39;s rules for Node.js
- [eslint-plugin-promise](https://ghub.io/eslint-plugin-promise): Enforce best practices for JavaScript promises
- [eslint-plugin-standard](https://ghub.io/eslint-plugin-standard): ESlint Plugin for the Standard Linter
- [husky](https://ghub.io/husky): Prevents bad commit or push (git hooks, pre-commit/precommit, pre-push/prepush, post-merge/postmerge and all that stuff...)
- [nodemon](https://ghub.io/nodemon): Simple monitor script for use during development of a node.js app.
- [rollup](https://ghub.io/rollup): Next-generation ES module bundler
- [rollup-plugin-node-polyfills](https://ghub.io/rollup-plugin-node-polyfills): rollup-plugin-node-polyfills ===
- [rollup-plugin-node-resolve](https://ghub.io/rollup-plugin-node-resolve): Bundle third-party dependencies in node_modules
- [rollup-plugin-terser](https://ghub.io/rollup-plugin-terser): Rollup plugin to minify generated es bundle
- [tap-spec](https://ghub.io/tap-spec): Formatted TAP output like Mocha&#39;s spec reporter
- [tape](https://ghub.io/tape): tap-producing test harness for node and browsers

## License

MIT

Copyright (c) 2020 Javi Santos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
