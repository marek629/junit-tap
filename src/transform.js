import { EOL } from 'os'
import { Transform } from 'stream'
import { scheduler } from 'timers/promises'

import sax from 'sax'
import { finish, start, test } from 'supertap'
import { stringify } from 'yaml'

class JUnitTAPTransform extends Transform {
  #sax = new sax.SAXParser(true)
  #tap = ''
  #stats = {
    index: 0,
    passed: 0,
    skipped: 0,
    failed: 0,
  }
  #buffer = []
  #testCases = []
  #testSuites = []
  #failures = []
  #comments = []
  #yaml = {}
  #ms = 0
  #fast = false
  #scheduler = scheduler
  #promises = []

  constructor ({ fast = false, scheduler, ...options }) {
    super(options)

    this.#fast = fast
    if (scheduler) this.#scheduler = scheduler

    this.#sax.onopentag = tag => {
      switch (tag.name) {
        case 'testsuite':
          this.#onOpenTestSuite(tag)
          break
        case 'testcase':
          this.#onOpenTestCase(tag)
          break
        case 'failure':
          this.#onOpenFailure(tag)
          break
        case 'skipped':
          this.#onOpenSkipped(tag)
          break
      }
    }
    this.#sax.onclosetag = tag => {
      switch (tag) {
        case 'testcase':
          this.#onCloseTestCase(tag)
          break
        case 'testsuite':
          this.#onCloseTestSuite(tag)
          break
      }
    }
    this.#sax.oncdata = data => {
      if (this.#testCases.length > 0) this.#comments.push(data)
    }
  }

  #initTapData (testsuite) {
    this.#stats = {
      index: 0,
      passed: 0,
      skipped: 0,
      failed: 0,
    }
    this.#buffer = [
      `# Subtest: ${testsuite}`,
      start(),
    ]
    this.#testCases = []
    this.#failures = []
    this.#comments = []
    this.#yaml = {}
  }

  #onOpenTestSuite ({ attributes, isSelfClosing }) {
    this.#testSuites.push({ attributes, isSelfClosing })
    if (!isSelfClosing) this.#initTapData(attributes?.name ?? '')
  }

  #onOpenTestCase ({ name, attributes, isSelfClosing }) {
    this.#testCases.push({ name, attributes, isSelfClosing })
    if (isSelfClosing) this.#stats.passed++
  }

  #onOpenFailure ({ attributes, isSelfClosing }) {
    this.#failures.length = 0
    this.#failures.push({ attributes, isSelfClosing })
  }

  #onOpenSkipped ({ isSelfClosing }) {
    if (isSelfClosing) this.#stats.skipped++
  }

  #onCloseTestCase () {
    const { attributes, isSelfClosing } = this.#testCases.pop()
    if (!isSelfClosing && this.#failures.length > 0) {
      this.#stats.failed++
    }
    let title = attributes.name
    if ('time' in attributes) {
      this.#yaml.duration_ms = attributes.time * 1000
    }
    const yaml = this.#yaml
    if (this.#comments.length > 0) yaml.comments = this.#comments
    if (this.#failures.length > 0) yaml.failures = this.#failures.map(f => f.attributes)
    this.#buffer.push(test(title, {
      index: ++this.#stats.index,
      passed: this.#failures.length === 0,
    }))
    if (Object.keys(yaml).length > 0) {
      this.#buffer.push(
        '  ---',
        stringify(yaml).replace(/^/gm, '  ').replace(/\n  $/, ''),
        '  ...',
      )
    }
    this.#comments.length = 0
    this.#failures.length = 0
  }

  #onCloseTestSuite () {
    const { attributes } = this.#testSuites.pop()
    if (!this.#fast && 'time' in attributes) {
      this.#ms = attributes.time * 1000
    }
    this.#buffer.push(finish(this.#stats))
    this.#tap += this.#buffer.join(EOL)
    this.#buffer.length = 0

    const tap = this.#tap
    this.#tap = ''
    const promise = this.#scheduler.wait(this.#ms)
    this.#promises.push(promise)
    promise.then(() => {
      this.push(tap)
    })
    this.#ms = 0
  }

  _transform (chunk, encoding, next) {
    this.#sax.write(chunk, encoding)
    next()
  }

  _flush (next) {
    Promise.all(this.#promises).then(() => next())
  }
}

export default JUnitTAPTransform
