import TagObserver from './TagObserver.js'

class SkippedObserver extends TagObserver {
  _tag = 'skipped'

  #testSuite

  constructor (sax, testSuite) {
    super(sax, false)
    this.#testSuite = testSuite
  }

  onOpen ({ isSelfClosing, name }) {
    if (!this._check(name)) return
    if (isSelfClosing) this.#testSuite.testSkipped()
  }
}

export default SkippedObserver
