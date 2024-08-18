import Observer from './Observer.js'

class SkippedObserver extends Observer {
  #testSuite

  constructor (sax, testSuite) {
    super(sax)
    this.#testSuite = testSuite
  }

  onOpen ({ isSelfClosing }) {
    if (isSelfClosing) this.#testSuite.testSkipped()
  }
}

export default SkippedObserver
