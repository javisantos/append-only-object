import { customAlphabet } from 'nanoid'
import * as jsonpatch from 'fast-json-patch'
import util from 'util'
import merge from './merge'
import parse from './parse'

const instance = customAlphabet('123456789abcdefghijkmnopqrstuvwxyz', 16)

function uniq (array, byId = true) {
  return byId ? array.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i) : [...new Set(array.map(s => JSON.stringify(s)))].map(s => JSON.parse(s))
}

function isObject (o) {
  return typeof o === 'object' && o !== null && Array.isArray(o) === false
}

const defaults = {
  strict: true, // or false
  unique: true, // or false
  by: false, // or true, object, array
  when: false, // or true
  encode: 'base64url', // or false, base64, hex...
  patch: false, // or true
  previous: false // or true
}

export default class AppendOnlyObject {
  constructor (obj, opts) {
    this.deleted = new Set(obj.deleted || [])
    this.ids = new Map()
    delete obj.deleted
    this.opts = { ...defaults, ...opts }
    this[Symbol.for('value')] = new Proxy(obj, this.objHanlder)

    return new Proxy(this, this.handler)
  }

  get value () {
    return parse(this[Symbol.for('value')])
  }

  setId (o) {
    if (!o.id) { o.id = instance() }
    this.ids.set(o.id, o)
  }

  _result (delta, prev, opts) {
    const encode = opts.encode
    const patch = opts.patch
    const by = opts.by
    const when = opts.when
    const previous = opts.previous

    const result = {
      // id: instance(),
      change: delta
    }
    if (encode) {
      if (encode === 'json') {
        result.change = JSON.stringify(delta)
      } else if (opts.encode === 'base64url') {
        const buffer = Buffer.from(JSON.stringify(delta))
        result.change = buffer
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+/, '')
      } else {
        result.change = Buffer.from(JSON.stringify(delta)).toString(encode)
      }
    }

    if (by && by !== true) {
      result.by = by
    }

    if (when) result.when = new Date().toISOString()
    if (patch) result.patch = jsonpatch.compare(prev, this[Symbol.for('value')])
    if (previous) result.previous = prev
    return result
  }

  _merge () {
    return (left, right) => {
      let result = merge(left, right, { setId: this.setId.bind(this) })
      if (this.opts.unique && Array.isArray(result)) {
        result = uniq(result, this.opts.unique)
      }
      return result
    }
  }

  append (delta, opts = {}) {
    const prev = { ...this[Symbol.for('value')] }
    if (delta.deleted) this._delete(delta.deleted)
    delete delta.deleted
    const merged = merge(prev, delta, {
      customMerge: this._merge.bind(this),
      root: true,
      setId: this.setId.bind(this)
    })

    this[Symbol.for('value')] = new Proxy(merged, this.objHanlder)
    return this._result(delta, prev, { ...this.opts, ...opts })
  }

  delete (id, opts = {}) {
    const prev = { ...this[Symbol.for('value')] }
    const deleted = this._delete(id)

    this[Symbol.for('value')] = new Proxy(Object.assign({}, this[Symbol.for('value')]), this.objHanlder)

    return this._result({ deleted }, prev, { ...this.opts, ...opts })
  }

  _delete (id) {
    if (Array.isArray(id)) {
      id.forEach((deleted) => {
        this.deleted.add(deleted)
      })
      return {
        deleted: id
      }
    } else {
      this.deleted.add(id)
      return {
        deleted: [id]
      }
    }
  }

  [util.inspect.custom || Symbol.for('nodejs.util.inspect.custom')] () {
    return this[Symbol.for('value')]
  } // this only works in node

  get handler () {
    return {
      get: (target, name, receiver) => {
        if (name === Symbol.for('value')) {
          return this[Symbol.for('value')]
        }
        if (name === 'toJSON') return () => parse(this[Symbol.for('value')])
        if (name in this[Symbol.for('value')] && name !== 'deleted') {
          return this[Symbol.for('value')][name]
        } else {
          return Reflect.get(target, name, receiver)
        }
      },
      deleteProperty: () => {
        // Never!
        return true
      },
      set: (target, prop, value, receiver) => {
        if (prop === Symbol.for('value')) {
          return Reflect.set(target, prop, value, receiver)
        }
        if (prop === 'id') {
          return Reflect.set(target, prop, value, receiver)
        }
        if ((!this[Symbol.for('value')][prop] && !this.opts.strict)) {
          this[Symbol.for('value')][prop] = value
          return Reflect.set(this[Symbol.for('value')], prop, value, receiver)
        }

        return true
      }

    }
  }

  get objHanlder () {
    return {
      get: (target, name, receiver) => {
        if (name === 'isProxy') return true
        if (Array.isArray(target[name])) {
          return new Proxy(target[name].filter((item) => !this.deleted.has(item.id)), this.objHanlder)
        }
        if (isObject(target[name]) && !target[name].isProxy) {
          return new Proxy(target[name], this.objHanlder)
        }
        return Reflect.get(target, name, receiver)
      },
      set: (target, prop, value, receiver) => {
        if ((!target[prop] && !this.opts.strict)) {
          target[prop] = value
          return true
        }

        return true
      },
      ownKeys: (target) => {
        const keys = Object.keys(target)
        const oKeys = []
        keys.forEach((key) => {
          if (typeof target[key] === 'object' && target[key] !== null && this.deleted.has(target[key].id)) {
            // No key
          } else {
            oKeys.push(key)
          }
        })
        return oKeys
      },
      deleteProperty: () => {
        // Never!
        return true
      }
    }
  }
}
