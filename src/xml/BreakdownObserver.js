import Observer from './Observer.js'
import TextObserver from './TextObserver.js'

class BreakdownObserver extends Observer {
  _list = []
  _text

  constructor (sax) {
    super(sax)
    this._text = new TextObserver(sax, this)
  }

  get empty () {
    return this._list.length === 0
  }

  get attributes () {
    return this._list.map(f => f.attributes)
  }

  onOpen ({ attributes, isSelfClosing }) {
    this._list.length = 0
    this._list.push({ attributes, isSelfClosing })
  }

  onClose () {
    const text = this._text.flush()
    if (text.length > 0) {
      this._list[this._list.length - 1].attributes.text = text
    }
  }

  flush () {
    const a = [...this._list]
    this._list.length = 0
    return a
  }
}

export default BreakdownObserver
