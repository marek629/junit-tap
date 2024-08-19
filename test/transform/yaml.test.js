import { createReadStream } from 'fs'
import { join } from 'path'
import { pipeline } from 'stream/promises'

import test from 'ava'
import { dirname } from 'dirname-filename-esm'
import { fake } from 'sinon'
import { parse } from 'yaml'

import Transform from '../../src/transform.js'
import TestStream from './TestStream.js'

const macro = test.macro({
  exec: async (t, file, ...expected) => {
    const input = createReadStream(join(dirname(import.meta), 'data' , file))
    const transform = new Transform({
      scheduler: { wait: fake.resolves(null) },
    })
    const output = new TestStream()

    await pipeline(input, transform, output)

    const origin = '  ---'
    const end = '  ...'
    if (expected.length === 0) {
      t.falsy(output.find(origin))
      t.falsy(output.find(end))
      return
    }
    t.truthy(output.find(origin))
    t.truthy(output.find(end))
    const string = output.toString()
    let start = 0
    for (const yaml of expected) {
      if (yaml === null) continue
      const stop = string.indexOf(`\n${end}\n`, start)
      const str = string.substring(
        string.indexOf(`\n${origin}\n`, start) + origin.length + 1,
        stop + 2,
      ).replace(/\n  /g, '\n')
      start = stop + end.length
      if (yaml.__skip === true) continue
      t.deepEqual(parse(str), yaml)
    }
  },
  title: (_, file, ...expected) => {
    const documents = [...expected ?? []].filter(Boolean).length
    return `${file} file should produce ${documents === 0 ? 'no' : documents} YAML documents`
  },
})

test(macro, 'tap.junit.xml')
test(macro, 'legacy.java.xml',
  {
    duration_ms: 40,
  },
  {
    duration_ms: 8,
    comments: [
      'org.opentest4j.AssertionFailedError: expected: <true>but was: <false>at \n' +
      '\t\t\torg.junit.jupiter.api.AssertionFailureBuilder.build(AssertionFailureBuilder.java:151)...',
    ],
    failures: [
      {
        message: 'expected: <true> but was: <false>',
        type: 'org.opentest4j.AssertionFailedError',
      },
    ],
  },
)
test(macro, 'node.gource.xml',
  // skipping passing items having duration_ms only
  ...Array(14).fill({ __skip: true }),
  // important is only the last one
  {
    duration_ms: 53.620000000000005,
    failures: [
      {
        message: 'test failed',
        type: 'testCodeFailure',
        text: "\n[Error: test failed] { code: 'ERR_TEST_FAILURE', failureType: 'testCodeFailure', cause: 'test failed', exitCode: 1, signal: null }",
      },
    ],
  },
)
test(macro, 'breakdown.xml',
  // failures collected from other files
  {
    duration_ms: 53.620000000000005,
    failures: [
      {
        message: 'test failed',
        type: 'testCodeFailure',
        text: "\n[Error: test failed] { code: 'ERR_TEST_FAILURE', failureType: 'testCodeFailure', cause: 'test failed', exitCode: 1, signal: null }",
      },
    ],
  },
  {
    duration_ms: 8,
    comments: [
      `org.opentest4j.AssertionFailedError: expected: <true>but was: <false>at 
                org.junit.jupiter.api.AssertionFailureBuilder.build(AssertionFailureBuilder.java:151)...`,
    ],
    failures: [
      {
        message: 'expected: <true> but was: <false>',
        type: 'org.opentest4j.AssertionFailedError',
      },
    ],
  },
  {
    failures: [
      {
        message: `Expected "# skipped 1" in """
TAP version 13
not ok 1 - test is equal in undefineds
not ok 2 - test skip extra # SKIP in undefineds
not ok 3 - should not be equal in undefineds
not ok 4 - should be equal in undefineds

1..4
# tests 4
# pass 3
# fail 1
            """`,
        type: 'fail',
      },
    ],
  },
  // failures converted to errors
  {
    duration_ms: 53.620000000000005,
    errors: [
      {
        message: 'test failed',
        type: 'testCodeError',
        text: "\n[Error: test failed] { code: 'ERR_TEST_ERROR', errorType: 'testCodeError', cause: 'test failed', exitCode: 1, signal: null }",
      },
    ],
  },
  {
    duration_ms: 8,
    comments: [
      `org.opentest4j.AssertionFailedError: expected: <true>but was: <false>at 
                org.junit.jupiter.api.AssertionFailureBuilder.build(AssertionFailureBuilder.java:151)...`,
    ],
    errors: [
      {
        message: 'expected: <true> but was: <false>',
        type: 'org.opentest4j.AssertionFailedError',
      },
    ],
  },
  {
    errors: [
      {
        message: `Expected "# skipped 1" in """
TAP version 13
not ok 1 - test is equal in undefineds
not ok 2 - test skip extra # SKIP in undefineds
not ok 3 - should not be equal in undefineds
not ok 4 - should be equal in undefineds

1..4
# tests 4
# pass 3
# fail 1
            """`,
        type: 'fail',
      },
    ],
  },
  // mixed variations
  {
    duration_ms: 53.620000000000005,
    errors: [
      {
        message: 'test failed',
        type: 'testCodeError',
        text: "\n[Error: test failed] { code: 'ERR_TEST_ERROR', errorType: 'testCodeError', cause: 'test failed', exitCode: 1, signal: null }",
      },
    ],
  },
  {
    duration_ms: 12,
    comments: [
      `org.opentest4j.AssertionFailedError: expected: <true>but was: <false>at 
                org.junit.jupiter.api.AssertionFailureBuilder.build(AssertionFailureBuilder.java:151)...`,
    ],
    failures: [
      {
        message: 'expected: <true> but was: <false>',
        type: 'org.opentest4j.AssertionFailedError',
      },
    ],
  },
  null,
)
