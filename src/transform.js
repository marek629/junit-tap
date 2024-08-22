import { EOL } from 'os'
import { Transform } from 'stream'

import SaxWrapper from './xml/SaxWrapper.js'
import SkippedObserver from './xml/SkippedObserver.js'
import TestCaseObserver from './xml/TestCaseObserver.js'
import TestSuiteObserver from './xml/TestSuiteObserver.js'
import { error, failure, saxParser } from './loader.js'
import TestTimer from './TestTimer.js'

class JUnitTAPTransform extends Transform {
  #sax = new SaxWrapper
  #tap = ''
  #buffer = []
  #testCase
  #testSuite
  #skipped
  #timer
  #fast = false

  constructor ({ fast = false, scheduler, ...options }) {
    super(options)
    saxParser(this.#sax)

    this.#fast = fast
    this.#timer = new TestTimer(scheduler, this.push.bind(this))
    this.#testSuite = new TestSuiteObserver(this.#sax, this.#buffer, this.#fast, this.#timer, this.#flush.bind(this))
    this.#testCase = new TestCaseObserver(this.#sax, this.#buffer, this.#fast, this.#timer, this.#flush.bind(this), this.#testSuite)
    this.#skipped = new SkippedObserver(this.#sax, this.#testSuite)
  }

  #flush () {
    this.#tap += this.#buffer.join(EOL)
    this.#buffer.length = 0
    if (!this.#tap.endsWith('\n')) this.#tap += '\n'

    this.#timer.enqueue(this.#tap)
    this.#tap = ''
  }

  _transform (chunk, encoding, next) {
    this.#sax.write(chunk, encoding)
    next()
  }

  _flush (next) {
    this.#timer.flush(next)
  }
}

export default JUnitTAPTransform
