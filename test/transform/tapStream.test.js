import { createReadStream } from 'fs'
import { join } from 'path'
import { pipeline } from 'stream/promises'

import test from 'ava'
import { dirname } from 'dirname-filename-esm'
import { fake } from 'sinon'

import Transform from '../../src/transform.js'
import TestStream from './TestStream.js'

const macro = test.macro({
  exec: async (t, file, config, ...records) => {
    const input = createReadStream(join(dirname(import.meta), 'data' , file))
    const transform = new Transform(config)
    const output = new TestStream()
    const precission = 1_000

    await pipeline(input, transform, output)

    for (const str of records) t.truthy(output.find(str), `Expected "${str}" in """\n${output.toString()}"""`)
    t.snapshot(output.toString())
  },
  title: (providedTitle = '', file, { fast }) => {
    const fastOption = fast
      ? 'fast'
      : 'real time'
    return `${providedTitle || 'should produce TAP stream'} from ${file} file, ${fastOption} option`
  },
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

for (const [file, ...data] of [
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
  ],
  [
    'time.xml',
    'ok 1 - should not be equal',
    '  duration_ms: 100',
    'ok 2 - should be equal',
    '  duration_ms: 30',
    '# tests 2',
    '# pass 2',
    '# fail 0',
    'ok 1 - someEndToEndTest',
    '  duration_ms: 9996',
    'ok 2 - someIntegrationTest',
    '  duration_ms: 5003',
    'ok 3 - someUnitTest',
    '  duration_ms: 2',
    '# tests 3',
    '# pass 3',
    '# fail 0',
  ],
  [
    'breakdown.xml',
    '# Subtest: failures collected from other files',
    'not ok 1 - /tmp/gource/test/args.test.js',
    'not ok 2 - testTwo',
    'not ok 3 - should produce TAP stream in tap.junit.xml',
    '1..3',
    '# tests 3',
    '# pass 0',
    '# fail 3',
    '# Subtest: failures converted to errors',
    'not ok 1 - /tmp/gource/test/args.test.js',
    'not ok 2 - testTwo',
    'not ok 3 - should produce TAP stream in tap.junit.xml',
    '1..3',
    '# tests 3',
    '# pass 0',
    '# fail 3',
    '# Subtest: mixed variations',
    'not ok 1 - /tmp/gource/test/args.test.js',
    'not ok 2 - testTwo',
    'ok 3 - should produce TAP stream in tap.junit.xml # SKIP',
    '1..3',
    '# tests 3',
    '# pass 0',
    '# skip 1',
    '# fail 2',
  ]
]) {
  for (const fast of [true, false]) {
    test(
      macro,
      file,
      {
        fast,
        scheduler: { wait: fake.resolves(null) },
      },
      ...data,
    )
  }
}
