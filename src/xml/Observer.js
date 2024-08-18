class Observer {
  /**
   * @type sax.SAXParser
   */
  _sax

  constructor (sax) {
    this._sax = sax
  }

  flush () {
    throw new TypeError('Observer is an interface!')
  }
}

export default Observer
