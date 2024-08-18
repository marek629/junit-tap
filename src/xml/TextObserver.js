import Observer from './Observer.js'

class TextObserver extends Observer {
  #text = ''
  #breakdown

  constructor (sax, breakdown) {
    super(sax)
    this.#breakdown = breakdown
    sax.on('text', text => {
      if (this.#breakdown.empty) return
      const t = text.trimEnd()
      if (t.length > 0) this.#text = t
    })
  }

  flush () {
    const t = this.#text
    this.#text = ''
    return t
  }
}

export default TextObserver
