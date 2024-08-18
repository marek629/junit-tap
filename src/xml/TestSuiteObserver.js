import { finish, start } from 'supertap'

import Observer from './Observer.js'
import { comment, failure, yaml } from '../loader.js'

class TestSuiteObserver extends Observer {
  #suites = []
  #stats = {
    index: 0,
    passed: 0,
    skipped: 0,
    failed: 0,
  }
  #buffer = []
  #fast = false
  #timer
  #flush

  #comment
  #failure
  #testCase
  #yaml

  constructor (sax, buffer, isFast, timer, flush) {
    super(sax)
    this.#buffer = buffer
    this.#fast = isFast
    this.#timer = timer
    this.#flush = flush
    this.#comment = comment(sax)
    this.#failure = failure(sax)
    this.#yaml = yaml(sax)
  }

  set testCase (value) {
    this.#testCase = value
  }

  testIndex () {
    return ++this.#stats.index
  }

  testPassed () {
    this.#stats.passed++
  }

  testSkipped () {
    this.#stats.skipped++
  }

  testFailed () {
    this.#stats.failed++
  }

  onOpen ({ attributes, isSelfClosing }) {
    this.#suites.push({ attributes, isSelfClosing })
    if (!isSelfClosing) this.#initTapData(attributes?.name ?? '')
  }

  #initTapData (testsuite) {
    this.#stats = {
      index: 0,
      passed: 0,
      skipped: 0,
      failed: 0,
    }
    this.#buffer.length = 0
    this.#buffer.push(
      `# Subtest: ${testsuite}`,
      start(),
    )
    this.#testCase.flush()
    this.#failure.flush()
    this.#comment.flush()
    this.#yaml.flush()
  }

  onClose () {
    const { attributes } = this.#suites.pop()
    if (!this.#fast && 'time' in attributes) {
      this.#timer.ms = attributes.time * 1000
    }
    this.#buffer.push(finish(this.#stats))

    this.#timer.finish()
    this.#flush()
  }
}

export default TestSuiteObserver
