import { createReadStream } from 'fs'
import { join } from 'path'
import { pipeline } from 'stream/promises'

import test from 'ava'
import { dirname } from 'dirname-filename-esm'
import { fake, useFakeTimers } from 'sinon'

import Transform from '../../src/transform.js'
import TestStream from './TestStream.js'

const macro = test.macro({
  exec: async (t, file, ...times) => {
    const input = createReadStream(join(dirname(import.meta), 'data' , file))
    const wait = fake(async ms => {
      clock.tick(ms)
      await clock.runAllAsync()
    })
    const clock = useFakeTimers(841_510)
    const transform = new Transform({
      scheduler: { wait },
    })
    const output = new TestStream()

    await pipeline(input, transform, output)
    clock.restore()

    t.is(output.data.length, times.length)
    t.deepEqual(wait.getCalls().map(v => v.firstArg), times)
    t.snapshot(`${output}`)
  },
  title: (_, file) => `should support time attribute for ${file} file`,
})

test.serial(macro, 'legacy.java.xml', 40, 8, 28)
test.serial(macro, 'node.gource.xml',
  4.68, 1.24, 1.34,
  1.17, 1.14, 1.12, 1.10, 1.10, 1.14, 1.15, 1.08, 0.99, 0.97, 0.95, 0.94, 0,
  53.62,
)
test.serial(macro, 'time.xml', 100, 30, 0, 9996, 5003, 2, 2)
