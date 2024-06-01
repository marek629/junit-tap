import { EOL } from 'os'
import { Transform } from 'stream'
import { scheduler } from 'timers/promises'

import sax from 'sax'
import { finish, start, test } from 'supertap'
import { stringify } from 'yaml'

const round = ms => parseFloat(ms.toFixed(2))

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
  #consumedMs = 0
  #promise = Promise.resolve()

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
    const title = attributes.name
    if ('time' in attributes) {
      this.#yaml.duration_ms = attributes.time * 1000
      if (!this.#fast) {
        this.#ms = round(this.#yaml.duration_ms)
      }
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

    if (this.#ms > 0) {
      this.#consumedMs += this.#ms
      this.#flush()
    }
  }

  #onCloseTestSuite () {
    const { attributes } = this.#testSuites.pop()
    if (!this.#fast && 'time' in attributes) {
      this.#ms = round(attributes.time * 1000)
    }
    this.#buffer.push(finish(this.#stats))

    this.#ms -= this.#consumedMs
    if (this.#ms < 0) this.#ms = 0
    else this.#ms = round(this.#ms)
    this.#consumedMs = 0
    this.#flush()
  }

  #flush () {
    this.#tap += this.#buffer.join(EOL)
    this.#buffer.length = 0
    if (!this.#tap.endsWith('\n')) this.#tap += '\n'

    const tap = this.#tap
    const ms = this.#ms
    this.#promise = this.#promise.then(() => this.#wait(ms, tap))
    this.#tap = ''
    this.#ms = 0
  }

  #wait (ms, tap) {
    return this.#scheduler.wait(ms).then(() => {
      this.push(tap)
    })
  }

  _transform (chunk, encoding, next) {
    this.#sax.write(chunk, encoding)
    next()
  }

  _flush (next) {
    this.#promise.then(() => next())
  }
}

export default JUnitTAPTransform
