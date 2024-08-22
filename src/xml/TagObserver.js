import Observer from './Observer.js'

class TagObserver extends Observer {
  _tag = ''

  constructor (sax, bindClose) {
    super(sax)
    sax.on('tagOpen', this.onOpen.bind(this))
    if (bindClose) sax.on('tagClose', this.onClose.bind(this))
  }

  onClose (tag) {
    console.log('checking onClose', tag)
    return
  }

  _check (name) {
    return this._tag === name
  }
}

export default TagObserver
