import { EventEmitter } from 'events'

import test from 'ava'
import { fake } from 'sinon'

import TextObserver from '../../src/xml/TextObserver.js'

const fakeBreakdown = emptiness => {
  const empty = fake.returns(emptiness)
  const breakdown = {
    get empty () {
      return empty()
    }
  }
  return [breakdown, empty]
}

test('2 instances should react on single text occurrance', t => {
  const sax = new EventEmitter
  const [breakdown, empty] = fakeBreakdown(true)
  const instances = [new TextObserver(sax, breakdown), new TextObserver(sax, breakdown)]

  sax.emit('text', 'j')

  t.is(empty.callCount, instances.length)
})

const storeMacro = test.macro({
  exec: (t, emptiness, text, expected) => {
    const sax = new EventEmitter
    const [breakdown] = fakeBreakdown(emptiness)
    const observer = new TextObserver(sax, breakdown)

    sax.emit('text', text)

    t.is(observer.flush(), expected)
  },
  title: (_, empty, text, expected) => `"${text}" text should${expected.length > 0
    ? '' : ' not'} be stored at ${empty ? '' : 'no-'}empty breakdown instance`,
})
for (const empty of [true, false]) {
  for (const data of [
    [empty, '', ''],
    [empty, 'no empty', empty ? '' : 'no empty'],
  ]) test(storeMacro, ...data)
}
