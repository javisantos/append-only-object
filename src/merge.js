function isMergeableObject (value) {
  return isNonNullObject(value) && !isSpecial(value)
}

function isNonNullObject (value) {
  return !!value && typeof value === 'object'
}

function isSpecial (value) {
  var stringValue = Object.prototype.toString.call(value)

  return stringValue === '[object RegExp]' || stringValue === '[object Date]' || isReactElement(value)
}

var canUseSymbol = typeof Symbol === 'function' && Symbol.for
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7

function isReactElement (value) {
  return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget (val) {
  return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified (value, options) {
  return (options.clone !== false && options.isMergeableObject(value))
    ? merge(emptyTarget(value), value, options)
    : value
}

function defaultArrayMerge (target, source, options) {
  return target.concat(source).map(function (element) {
    return cloneUnlessOtherwiseSpecified(element, options)
  })
}

function getMergeFunction (key, options, target, source) {
  if (!options.customMerge) {
    return merge
  }
  var customMerge = options.customMerge(key, target, source)
  return typeof customMerge === 'function' ? customMerge : merge
}

function getEnumerableOwnPropertySymbols (target) {
  return Object.getOwnPropertySymbols
    ? Object.getOwnPropertySymbols(target).filter(function (symbol) {
      return {}.propertyIsEnumerable.call(target, symbol)
    })
    : []
}

function getKeys (target) {
  return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

function propertyIsOnObject (object, property) {
  try {
    return property in object
  } catch (_) {
    return false
  }
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe (target, key) {
  return propertyIsOnObject(target, key) && // Properties are safe to merge if they don't exist in the target yet,
        !(Object.hasOwnProperty.call(target, key) && // unsafe if they exist up the prototype chain,
            Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}

function mergeObject (target, source, options) {
  var destination = {}
  if (options.isMergeableObject(target)) {
    getKeys(target).forEach(function (key) {
      destination[key] = cloneUnlessOtherwiseSpecified(target[key], options)
    })
  }
  getKeys(source).forEach(function (key) {
    if (propertyIsUnsafe(target, key)) {
      return
    }

    if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
      destination[key] = getMergeFunction(key, options, target[key], source[key])(target[key], source[key], options)
    } else if ((destination[key] === undefined || destination[key] === null)) {
      destination[key] = cloneUnlessOtherwiseSpecified(source[key], options)
    }
  })

  return destination
}

function merge (target, source, options) {
  options = options || {}
  options.arrayMerge = options.arrayMerge || defaultArrayMerge
  options.isMergeableObject = options.isMergeableObject || isMergeableObject
  options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified

  var sourceIsArray = Array.isArray(source)
  var targetIsArray = Array.isArray(target)
  var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray
  if (!sourceAndTargetTypesMatch) {
    return target
  } else if (sourceIsArray) {
    return options.arrayMerge(target, source, options)
  } else {
    if (!options.root) options.setId(source)
    return mergeObject(target, source, options)
  }
}

export default merge
