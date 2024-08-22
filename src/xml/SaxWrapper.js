import { randomUUID } from 'crypto'
import { EventEmitter } from 'events'

import sax from 'sax'

class SaxWrapper extends EventEmitter {
  #sax = new sax.SAXParser(true)
  #uuid = randomUUID()

  constructor () {
    super()
    this.#sax.ontext = text => this.emit('text', text)
    this.#sax.onopentag = tag => this.emit('tagOpen', tag)
    this.#sax.onclosetag = tag => this.emit('tagClose', tag)
    this.#sax.oncdata = data => this.emit('cdata', data)
  }

  get uuid () {
    return this.#uuid
  }

  write (chunk, encoding) {
    return this.#sax.write(chunk, encoding)
  }
}

export default SaxWrapper
