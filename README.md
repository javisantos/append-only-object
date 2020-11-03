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


- The target object is not mutated
- The initial values can be set without `id` to be undeletables
- An `id` is added to all the objects appended if no `id` is included
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
  id: 'GnWhgp9IShi9Hv6kt-GeZw-4',
  change: { childrens: [ [Object] ] },
  by: '1a75a182-9f48-4a18-bd1e-fea4b7f19e67',
  when: '2020-06-25T12:40:52.430Z',
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
  encode: false, // to encode the `change` value. Other options json|base64url|base64|hex|binary
  by: true, // by default return the uuid used to generate the ids. Can send an `object` or `array`.
  when: true, // add an (ISO 8601) `when` value.
  patch: false, // set to true if you want a (RFC6902) `patch` object tu be returned.
  previous: false, // set to true to receive the `previous` object before the append.
}
```
| All the `options` can be set `globally` in the creation of the object or with more `priority` (except `strict` and `unique`) in the `append` or `delete` methods.

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
