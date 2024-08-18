import { text } from '../loader.js'
import Observer from './Observer.js'

class FailureObserver extends Observer {
  #failures = []
  #text

  constructor (sax) {
    super(sax)
    // avoid cyclic dependency deadlock
    process.nextTick(() => {
      this.#text = text(sax)
    })
  }

  get empty () {
    return this.#failures.length === 0
  }

  get attributes () {
    return this.#failures.map(f => f.attributes)
  }

  onOpen ({ attributes, isSelfClosing }) {
    this.#failures.length = 0
    this.#failures.push({ attributes, isSelfClosing })
  }

  onClose () {
    const text = this.#text.flush()
    if (text.length > 0) {
      this.#failures[this.#failures.length - 1].attributes.text = text
    }
  }

  flush () {
    const a = [...this.#failures]
    this.#failures.length = 0
    return a
  }
}

export default FailureObserver
