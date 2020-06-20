const test = require('tape')
const tapSpec = require('tap-spec')
const AppendOnlyObject = require('..')

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout)

const me = new AppendOnlyObject({ name: 'Javi', status: [{ id: 'single' }] })
test('Once upon a time (Should add an object array)', function (t) {
  const feelings = { feelings: [{ id: 'loneliness' }] }
  me.append(feelings)
  t.equal(me.name, 'Javi', 'My name is Javi')
  t.equal(me.status[0].id, 'single', 'I was single')
  console.log('ME', me)
  t.equal(me.feelings[0].id, 'loneliness', 'And i was feeling alone')

  t.end()
})

test('I added new hobbies (Should append deltas to the same object)', function (t) {
  me.append({ hobbies: [{ id: 'dance' }] })
  me.append({ hobbies: [{ id: 'travel' }] })

  t.equal(me.hobbies[0].id, 'dance', 'Dance')
  t.equal(me.hobbies[1].id, 'travel', 'And travel')

  t.end()
})

test('I met a woman (Should delete and append properities)', function (t) {
  const love = { feelings: [{ id: 'love' }], deleted: ['loneliness'] }
  me.append(love)
  t.equal(me.feelings[0].id, 'love', 'And i fell in love')
  t.equal(me.feelings.length, 1, 'And i wasn\'t feeling alone anymore')

  t.end()
})

test('After some time (Should add and append properities)', function (t) {
  const marriage = { status: [{ forever: 'married' }], wife: 'Sam', deleted: ['single'] }
  me.append(marriage)
  t.equal(me.wife, 'Sam', 'We married')
  t.equal(me.status[0].forever, 'married', 'Forever')
  t.end()
})

test('We planned to have a family', function (t) {
  const family = { family: { house: true, car: true } }
  me.append(family)
  t.equal(me.family.car, true, 'We bought a car')
  t.equal(me.family.house, true, 'And a house')
  t.end()
})

test('And we had 2 children (Should append to existent array)', function (t) {
  const family1 = { family: { childrens: [{ name: 'Adam' }] } }
  me.append(family1)
  t.equal(me.family.childrens[0].name, 'Adam', 'First Adam')
  const family2 = { family: { childrens: [{ name: 'Matt' }] } }
  me.append(family2)
  t.equal(me.family.childrens[1].name, 'Matt', 'And then Matt')
  t.end()
})

test('We removed some hobbies (Should delete multiples)', function (t) {
  const remove = { deleted: ['dance', 'travel'] }
  me.append(remove)
  t.equal(me.hobbies.length, 0, 'No hobbies (really no, but i need it to test multiple deletion xD)')
  t.end()
})

test('I\'m feeling happy and complete', function (t) {
  const happy = { feelings: [{ id: 'happiness' }, { name: 'joy' }], complete: true }
  me.append(happy)
  t.equal(me.feelings[1].id, 'happiness', 'For what we are')

  t.end()
})

test('And inmutable', function (t) {
  const me = new AppendOnlyObject({ name: 'Javi' })
  me.append({ surname: [{ id: 'surname', value: 'Santos' }] })
  me.append({ wife: 'Sam' })
  me.append({ childrens: [{ value: 'Adam' }] })
  me.append({ childrens: [{ value: 'Matt', id: 'second' }] }, { patch: true })
  me.append({ errors: { id: 'error', value: 'An error' } })
  me.delete('error')

  me.name = 'noop'
  delete me.name
  me.wife = null
  // me.pepe = 'asd'
  // me.childrens.push({ value: 'noop' })

  t.equal(JSON.stringify(me), JSON.stringify({
    name: 'Javi',
    surname: [{ id: 'surname', value: 'Santos' }],
    wife: 'Sam',
    childrens: [
      { value: 'Adam', id: me.childrens[0].id },
      { value: 'Matt', id: 'second' }
    ]
  }), 'I am who i am')
  t.end()
})
