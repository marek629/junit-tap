import Observer from './Observer.js'

class CommentObserver extends Observer {
  #comments = []
  #testCase

  constructor (sax) {
    super(sax)
    this._sax.on('cdata', data => {
      if (!this.#testCase.empty) this.#comments.push(data)
    })
  }

  set testCase (value) {
    this.#testCase = value
  }

  get empty () {
    return this.#comments.length === 0
  }

  get values () {
    return [...this.#comments]
  }

  flush () {
    const a = this.values
    this.#comments.length = 0
    return a
  }
}

export default CommentObserver
