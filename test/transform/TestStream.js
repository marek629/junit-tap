import { Writable } from 'stream'

class TestStream extends Writable {
  /** @type string[] */
  data = []

  _write (chunk, encoding, next) {
    this.data.push(String(chunk))
    next()
  }

  find (string) {
    return this.data.find(value => {
      if (string.startsWith('ok ')) return value.includes(string) && !value.includes(`not ${string}`)
      return value.includes(string)
    })
  }

  toString () {
    return this.data.join('\n')
  }
}

export default TestStream
