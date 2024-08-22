import { randomUUID } from 'crypto'

import test from 'ava'
import { spy } from 'sinon'

import TestCaseObserver from '../../src/xml/TestCaseObserver.js'
import TestSuiteObserver from '../../src/xml/TestSuiteObserver.js'
import { comment, error, failure, saxParser, yaml } from '../../src/loader.js'

const tag = 'testsuite'

const flushAllMacro = test.macro({
  exec: (t, attributes, expected) => {
    const sax = {uuid: randomUUID(), on: spy()}
    saxParser(sax)
    const observers = [comment, error, failure, yaml].map(i => i(sax))
    const testSuite = new TestSuiteObserver(sax, [])
    const testCase = new TestCaseObserver(sax, null, true, null, null, testSuite)
    const spies = [...observers, testCase].map(o => spy(o, 'flush'))

    testSuite.onOpen({ attributes, isSelfClosing: !expected, name: tag })

    t.is(spies.every(s => s.calledOnce), expected)
  },
  title: (_, attributes, expected) => `on open tag should${
    expected ? '' : ' not'} flush all known observers if the tag is ${
    expected ? ' not' : ''} self closing with attributes: ${JSON.stringify(attributes)}`
})

for (const should of [true, false]) {
  for (const attributes of [
    { name: '' },
    { name: 'test name' },
    {},
    null,
  ]) test(flushAllMacro, attributes, should)
}
