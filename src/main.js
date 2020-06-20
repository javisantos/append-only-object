import hyperid from 'hyperid'

import * as jsonpatch from 'fast-json-patch'
import util from 'util'

const instance = hyperid({ urlSafe: true })

function uniq (array, byId = true) {
  return byId ? array
    .filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
    : [...new Set(array.map(s => JSON.stringify(s)))]
      .map(s => JSON.parse(s))
}

function isObject (o) {
  return typeof o === 'object' && o !== null && Array.isArray(o) === false
}

const defaults = {
  strict: true, // or false
  unique: true, // or false
  deepequal: false, // or false
  by: true, // or false, object, array
  when: true, // or false
  encode: false, // or base64url, base64, hex...
  patch: false, // or true
  previous: false, // or true
  deletable: true // or false
}

export default class AppendOnlyObject {
  constructor (obj, opts) {
    this.deleted = new Set(obj.deleted || [])
    this.ids = new Set()
    delete obj.deleted
    this.opts = { ...defaults, ...opts }
    this[Symbol.for('value')] = new Proxy(obj, this.objHanlder)

    return new Proxy(this, this.handler)
  }

  setId (o) {
    if (!o.id) { o.id = instance() }
    this.ids.add(o.id)
  }

  _result (delta, prev, opts) {
    const encode = opts.encode
    const patch = opts.patch
    const by = opts.by
    const when = opts.when
    const previous = opts.previous

    const result = {
      id: instance(),
      change: delta
    }
    if (encode) {
      if (encode === 'json') {
        result.change = JSON.stringify(delta)
      } else if (opts.encode === 'base64url') {
        console.log('base64url not implemented')
      } else {
        result.change = Buffer.from(JSON.stringify(delta)).toString(encode)
      }
    }

    if (by === true) {
      result.by = instance.uuid
    } else if (by) {
      result.by = by
    }

    if (when) result.when = new Date().toISOString()
    if (patch) result.patch = jsonpatch.compare(prev, this[Symbol.for('value')])
    if (previous) result.previous = prev
    return result
  }

  append (delta, opts = {}) {
    const prev = { ...this[Symbol.for('value')] }
    // this.ids = new Set([])
    const target = this._append(delta, null, { ...this.opts, ...opts }.deletable)
    this[Symbol.for('value')] = new Proxy(Object.assign({}, target), this.objHanlder)
    return this._result(delta, prev, { ...this.opts, ...opts })
  }

  delete (id, opts = {}) {
    const prev = { ...this[Symbol.for('value')] }
    const deleted = this._delete(id)

    this[Symbol.for('value')] = new Proxy(Object.assign({}, this[Symbol.for('value')]), this.objHanlder)

    return this._result({ deleted }, prev, { ...this.opts, ...opts })
  }

  _append (delta, target = null, deletable) {
    if (target === null) {
      if (delta.deleted) this._delete(delta.deleted)
      target = JSON.parse(JSON.stringify(this[Symbol.for('value')]))
    }

    for (const key in delta) {
      if (isObject(delta[key])) {
        if (!target[key] && !this.deleted.has(delta[key].id)) {
          if (deletable) this.setId(delta[key])
          target[key] = delta[key]
        }
        this._append(delta[key], target[key], deletable)
      } else if (Array.isArray(delta[key])) {
        if (Array.isArray(target[key])) {
          delta[key].forEach((item) => {
            if (!isObject(item) || (!this.ids.has(item.id) && this.opts.unique)) {
              if (Array.isArray(item)) throw new TypeError('can\'t add arrays to arrays')
              target[key].push(item)
            } else if (!this.opts.unique) {
              target[key].push(item)
            }
            if (isObject(item) && deletable) this.setId(item)
          })
        }
        if (!target[key] && Array.isArray(delta[key])) {
          target[key] = delta[key].filter((item) => {
            if (Array.isArray(item)) throw new TypeError('can\'t add arrays to arrays')
            if (isObject(item) && this.ids.has(item.id) && this.opts.unique) return false
            if (isObject(item) && deletable) this.setId(item)
            return true
          })
        }

        if (!this.opts.unique && !this.opts.deepequal) target[key] = uniq(target[key], this.opts.unique)
      } else if (!target[key] && delta[key]) {
        target[key] = delta[key]
      }
    }

    return target
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
        if (name === 'toJSON') return () => this[Symbol.for('value')]
        if (name in this[Symbol.for('value')] && name !== 'deleted' && name !== 'value') {
          return this[Symbol.for('value')][name]
        } else {
          return Reflect.get(target, name, receiver)
        }
      },
      set: (target, prop, value, receiver) => {
        return Reflect.set(target, prop, value, receiver)
      },
      deleteProperty: (target, prop) => {
        // Never!
        return true
      }
    }
  }

  get objHanlder () {
    return {
      get: (target, name, receiver) => {
        if (name === 'isProxy') return true
        if (Array.isArray(target[name])) {
          target[name] = target[name].filter((item) => !this.deleted.has(item.id))
        }

        return typeof target[name] === 'object' && target[name] !== null
          ? Array.isArray(target[name])
            ? new Proxy(target[name], this.objHanlder)
            : !this.deleted.has(target[name].id) ? new Proxy(target[name], this.objHanlder) : null
          : Reflect.get(target, name, receiver)
      },
      set: (target, prop, value, receiver) => {
        if ((!target[prop] && !this.opts.strict) || Array.isArray(target[prop])) {
          return Reflect.set(target, prop, value, receiver)
        }
        return true
      },
      ownKeys: (target) => {
        const keys = Object.keys(target)
        const oKeys = []
        keys.forEach((key) => {
          if (typeof target[key] === 'object' &&
            target[key] !== null &&
            this.deleted.has(target[key].id)) {
          } else {
            oKeys.push(key)
          }
        })
        return oKeys
      },
      deleteProperty: (target, prop) => {
        // Never!
        return true
      }
    }
  }
}
