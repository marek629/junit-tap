import { randomUUID } from 'crypto'

import test from 'ava'
import { fake, restore, spy, stub } from 'sinon'

import { comment, error, failure, saxParser, yaml } from '../../src/loader.js'
import BreakdownObserver from '../../src/xml/BreakdownObserver.js'
import TestCaseObserver, { external } from '../../src/xml/TestCaseObserver.js'

test.beforeEach(t => {
  const sax = {uuid: randomUUID(), on: spy()}
  saxParser(sax)
  const observers = [comment, error, failure, yaml].map(i => i(sax))
  t.context = {
    observers,
    sax,
  }
})

test.afterEach.always(() => {
  restore()
})

const createTestCase = (sax, timer) => {
  const buffer = []
  const testSuite = {
    testPassed: spy(),
    testFailed: spy(),
    testIndex: fake.returns(1),
  }
  return new TestCaseObserver(sax, buffer, true, timer, null, testSuite)
}

const flushAllMacro = test.macro({
  exec: (t, attributes, isSelfClosing) => {
    const { sax, observers } = t.context
    const testCase = createTestCase(sax, {ms: 0})
    const spies = observers.map(o => spy(o, 'flush'))

    testCase.onOpen({ attributes, isSelfClosing })
    testCase.onClose()

    t.true(spies.every(s => s.calledOnce))
  },
  title: (_, attributes, selfClosing) => `on open tag should flush all known observers if the tag is ${
    selfClosing ? '' : ' not'} self closing with attributes: ${JSON.stringify(attributes)}`
})
const bools = [true, false]
const attributeList = [
  { name: '' },
  { name: 'test name' },
  {},
  null,
]
for (const selfClosing of bools) {
  for (const attributes of attributeList) test(flushAllMacro, attributes, selfClosing)
}

const isEmptyAllMacro = test.macro({
  exec: (t, attributes, isSelfClosing) => {
    const { sax, observers } = t.context
    const testCase = createTestCase(sax, {ms: 0})
    const spies = observers.filter(o => 'empty' in o).map(o => spy(o, 'empty', ['get']))

    testCase.onOpen({ attributes, isSelfClosing })
    testCase.onClose()

    t.true(spies.every(s => s.get.called))
  },
  title: (_, attributes, selfClosing) => `on open tag should ask if empty all known observers if the tag is ${
    selfClosing ? '' : ' not'} self closing with attributes: ${JSON.stringify(attributes)}`
})
for (const selfClosing of bools) {
  for (const attributes of attributeList) test(isEmptyAllMacro, attributes, selfClosing)
}

test('on close tag should set full yaml if all known observers are not empty', t => {
  const { sax, observers } = t.context
  const testCase = createTestCase(sax, {ms: 0})
  const comments = ['comment 1', 'comment 2']
  const failures = [{type: 'fail', message: 'kk'}]
  const errors = [{type: 'error', message: 'oiu'}]
  observers.filter(o => 'empty' in o).map(o => {
    stub(o, 'empty').get(() => false)
    switch (o.constructor.name) {
      case 'CommentObserver':
        stub(o, 'values').get(() => comments)
        break
      case 'FailureObserver':
        stub(o, 'attributes').get(() => failures)
        break
      case 'ErrorObserver':
        stub(o, 'attributes').get(() => errors)
        break
    }
  })
  const stringify = spy(external, 'stringify')

  testCase.onOpen({ attributes: { name: 'j' }, isSelfClosing: false })
  testCase.onClose()

  t.true(stringify.calledOnce)
  t.deepEqual(stringify.args[0][0], {
    comments,
    failures,
    errors,
  })
})

const testMacro = test.macro({
  exec: (t, empties, passed) => {
    const { sax, observers } = t.context
    const testCase = createTestCase(sax, {ms: 0})
    observers
      .filter(o => o instanceof BreakdownObserver)
      .map((o, i) => stub(o, 'empty').get(() => empties[i]))
    const testSpy = spy(external, 'test')

    const name = 'j'
    testCase.onOpen({ attributes: { name }, isSelfClosing: false })
    testCase.onClose()

    t.true(testSpy.calledOnceWithExactly(name, { index: 1, passed }))
  },
  title: (_, empties, passed) => passed
      ? 'on close tag should test be passed if all known breakdown observers are empty'
      : `on close tag should test be failed if any known breakdown observer is not empty: ${empties}`,
})
for (const b1 of bools) {
  for (const b2 of bools) {
    const empties = [b1, b2]
    test.serial(testMacro, empties, empties.every(Boolean))
  }
}

test('null timer should failing on close tag', t => {
  const { sax } = t.context
  const testCase = createTestCase(sax, null)
  testCase.onOpen({})
  t.throws(testCase.onClose)
})
