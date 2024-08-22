import { test } from 'supertap'
import { stringify } from 'yaml'

import { comment, error, failure, yaml } from '../loader.js'
import TagObserver from './TagObserver.js'

export const external = {
  stringify,
  test,
}

class TestCaseObserver extends TagObserver {
  _tag = 'testcase'

  #cases = []
  #buffer = []
  #fast = false
  #timer
  #flush
  #testSuite
  #failure
  #error
  #yaml
  #comment

  constructor (sax, buffer, isFast, timer, flush, testSuite) {
    super(sax, true)
    this.#buffer = buffer
    this.#fast = isFast
    this.#timer = timer
    this.#flush = flush
    this.#testSuite = testSuite
    this.#failure = failure(sax)
    this.#error = error(sax)
    this.#yaml = yaml(sax)
    this.#comment = comment(sax)
    this.#comment.testCase = this
    this.#testSuite.testCase = this
  }

  get empty () {
    return this.#cases.length === 0
  }

  onOpen ({ name, attributes, isSelfClosing }) {
    if (!this._check(name)) return
    this.#cases.push({ name, attributes, isSelfClosing })
    if (isSelfClosing) this.#testSuite.testPassed()
  }

  onClose (name) {
    if (!this._check(name)) return
    const { attributes, isSelfClosing } = this.#cases.pop()
    if (!isSelfClosing && !(this.#failure.empty && this.#error.empty)) {
      this.#testSuite.testFailed()
    }
    const title = attributes?.name ?? ''
    if (attributes && 'time' in attributes) {
      this.#yaml.duration_ms = attributes.time * 1000
      if (!this.#fast) {
        this.#timer.ms = this.#yaml.duration_ms
      }
    }
    const yaml = this.#yaml.values
    if (!this.#comment.empty) yaml.comments = this.#comment.values
    if (!this.#failure.empty) yaml.failures = this.#failure.attributes
    if (!this.#error.empty) yaml.errors = this.#error.attributes
    const { stringify, test } = external
    this.#buffer.push(test(title, {
      index: this.#testSuite.testIndex(),
      passed: this.#failure.empty && this.#error.empty,
    }))
    if (Object.keys(yaml).length > 0) {
      this.#buffer.push(
        '  ---',
        stringify(yaml).replace(/^/gm, '  ').replace(/\n  $/, ''),
        '  ...',
      )
    }
    this.#comment.flush()
    this.#failure.flush()
    this.#error.flush()
    this.#yaml.flush()

    if (this.#timer.ms > 0) {
      this.#timer.consume()
      this.#flush()
    }
  }

  flush () {
    const a = [...this.#cases]
    this.#cases.length = 0
    return a
  }
}

export default TestCaseObserver
