import { EOL } from 'os'
import { Transform } from 'stream'

import sax from 'sax'

import TestCaseObserver from './xml/TestCaseObserver.js'
import TestSuiteObserver from './xml/TestSuiteObserver.js'
import { failure, saxParser } from './loader.js'
import TestTimer from './TestTimer.js'
import SkippedObserver from './xml/SkippedObserver.js'

class JUnitTAPTransform extends Transform {
  #sax = new sax.SAXParser(true)
  #tap = ''
  #buffer = []
  #testCase
  #testSuite
  #failure
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
    this.#failure = failure(this.#sax)
    this.#skipped = new SkippedObserver(this.#sax, this.#testSuite)

    this.#sax.onopentag = tag => {
      switch (tag.name) {
        case 'testsuite':
          this.#testSuite.onOpen(tag)
          break
        case 'testcase':
          this.#testCase.onOpen(tag)
          break
        case 'failure':
          this.#failure.onOpen(tag)
          break
        case 'skipped':
          this.#skipped.onOpen(tag)
          break
      }
    }
    this.#sax.onclosetag = tag => {
      switch (tag) {
        case 'testcase':
          this.#testCase.onClose(tag)
          break
        case 'testsuite':
          this.#testSuite.onClose(tag)
          break
        case 'failure':
          this.#failure.onClose(tag)
          break
      }
    }
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
