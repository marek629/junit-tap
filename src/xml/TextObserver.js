import { failure } from '../loader.js'
import Observer from './Observer.js'

class TextObserver extends Observer {
  #text = ''
  #failure

  constructor (sax) {
    super(sax)
    this.#failure = failure(sax)
    this._sax.ontext = text => {
      if (this.#failure.empty) return
      const t = text.trimEnd()
      if (t.length > 0) this.#text = t
    }
  }

  flush () {
    const t = this.#text
    this.#text = ''
    return t
  }
}

export default TextObserver
