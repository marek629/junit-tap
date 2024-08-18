import { randomUUID } from 'crypto'
import { EventEmitter } from 'events'

import sax from 'sax'

class SaxWrapper extends EventEmitter {
  #sax = new sax.SAXParser(true)
  #uuid = randomUUID()

  constructor () {
    super()
    this.#sax.ontext = text => this.emit('text', text)
  }

  get uuid () {
    return this.#uuid
  }

  set onopentag (cb) {
    this.#sax.onopentag = cb
  }

  set onclosetag (cb) {
    this.#sax.onclosetag = cb
  }

  set oncdata (cb) {
    this.#sax.oncdata = cb
  }

  write (chunk, encoding) {
    return this.#sax.write(chunk, encoding)
  }
}

export default SaxWrapper
