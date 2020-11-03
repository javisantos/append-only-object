const AppendOnlyObject = require('.')

const me = new AppendOnlyObject({ name: 'Javi', test: { a: '1' } })

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
me.childrens.push({ value: 'noop' })

console.log(me)
console.log(me.deleted)
console.log(addSecondChildren)

// !!!In browser the Append Only Object is a Proxy, use console.log('me ->', me.toJSON()) instead
// Hacky but always work
// console.log('me ->', JSON.parse(JSON.stringify(me)))
