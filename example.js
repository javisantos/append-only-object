const AppendOnlyObject = require('.')

const me = new AppendOnlyObject({ name: 'javi' })

me.append({ surname: [{ id: 'surname', value: 'Santos' }] })
me.append({ wife: 'Sam' })
me.append({ childrens: [{ value: 'Adam' }] })
console.log('ME', me)
const addSecondChildren = me.append({ childrens: [{ id: 'second', value: 'Matt' }] }, { patch: true, when: true, by: '1a75a182-9f48-4a18-bd1e-fea4b7f19e67' })
me.append({ childrens: [{ id: 'second', value: 'Matt' }] }, { patch: true })
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
