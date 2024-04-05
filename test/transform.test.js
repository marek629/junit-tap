import { createReadStream } from 'fs'
import { join } from 'path'
import { Writable } from 'stream'
import { pipeline } from 'stream/promises'

import test from 'ava'
import { dirname } from 'dirname-filename-esm'

import Transform from '../src/transform.js'

class TestStream extends Writable {
  /** @type string[] */
  data = []

  _write (chunk, encoding, next) {
    this.data.push(String(chunk))
    next()
  }

  find (string) {
    return this.data.find(value => {
      if (string.startsWith('ok ')) return value.includes(string) && !value.includes(`not ${string}`)
      return value.includes(string)
    })
  }

  toString () {
    return this.data.join('\n')
  }
}

const tapStreamMactro = test.macro({
  exec: async (t, file, ...records) => {
    const input = createReadStream(join(dirname(import.meta), 'data'  , file))
    const transform = new Transform()
    const output = new TestStream()

    await pipeline(input, transform, output)

    for (const str of records) t.truthy(output.find(str), `Expected "${str}" in """\n${output.toString()}"""`)
    t.snapshot(output.toString())
  },
  title: (providedTitle = '', file) => `${providedTitle || 'should produce TAP stream'} from ${file} file`
})

const selfGeneratedRecords = [
  '1..2',
  'ok 1 - should produce TAP stream in legacy.java.xml',
  'not ok 2 - should produce TAP stream in tap.junit.xml',
  'not ok 1 - test is equal in undefineds',
  'not ok 2 - test skip extra # SKIP in undefineds',
  'not ok 3 - should not be equal in undefineds',
  'not ok 4 - should be equal in undefineds',
  '# tests 2',
  '# pass 1',
  '# fail 1',
]

for (const data of [
  // example from https://howtodoinjava.com/junit5/xml-reports/
  [
    'legacy.java.xml',
    '1..2',
    'ok 1 - testOne',
    '  duration_ms: 40',
    'not ok 2 - testTwo',
    '  duration_ms: 8',
    'org.opentest4j.AssertionFailedError: expected: <true>but was: <false>',
    'org.junit.jupiter.api.AssertionFailureBuilder.build(AssertionFailureBuilder.java:151)',
    '# tests 2',
    '# pass 1',
    '# fail 1',
  ],
  // example from tap-junit project's readme file
  [
    'tap.junit.xml',
    '1..4',
    'ok 1 - test is equal',
    'ok 2 - test skip extra # SKIP',
    'ok 3 - should not be equal',
    'ok 4 - should be equal',
    '# tests 4',
    '# pass 3',
    '# skip 1',
  ],
  // usages of tap-junit in CLI
  [
    'tap.ogg.integration.xml',
    '1..25',
    'ok 2 - --defaults: short version in 285ms',
    'ok 3 - --producer is not supported anymore in 531ms',
    'ok 4 - --audio: default file in 987ms',
    'ok 12 - --volume: -1% given by short version in 685ms',
    'ok 13 - --tap switch deprecated as tap-ogg produces TAP stream on STDOUT in 1009ms',
    'ok 14 - no config.yml file in CWD in 606ms',
    'ok 15 - config.yml file in CWD at start in 641ms',
    'ok 25 - execute from test directory in 565ms',
    '# tests 25',
    '# pass 25',
  ],
  [
    'self.generated.pretty.xml',
    ...selfGeneratedRecords,
  ],
  [
    'self.generated.ugly.xml',
    ...selfGeneratedRecords,
  ],
  [
    'node.gource.xml',
    '# Subtest: args',
    '1..2',
    'ok 1 - 1 git repo and 1 no-git project',
    '  duration_ms: 4.677',
    'ok 2 - 3 git repos',
    '  duration_ms: 1.242',
    '# tests 2',
    '# pass 2',
    '# fail 0',
    '# Subtest: cliOptions',
    '1..12',
    'ok 1 - empty string on null given',
    '  duration_ms: 1.174',
    'ok 2 - empty string on undefined given',
    '  duration_ms: 1.139',
    'ok 10 - 1 short switch enabled and 1 short parameter',
    '  duration_ms: 0.968',
    '# tests 12',
    '# pass 12',
    '# fail 0',
  ]
]) test(tapStreamMactro, ...data)
